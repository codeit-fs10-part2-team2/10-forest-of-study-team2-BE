const prisma = require('../lib/prisma');
const { getCurrentDateInfo } = require('../utils/dateUtils');
const { TodayHabitDTO, WeekHabitDTO } = require('../dto/habitDTO');

const habitService = {
  getTodayHabits: async (studyId) => {
    const { year, week, day } = getCurrentDateInfo();
    
    const habitsWithTodayFullfillment = await prisma.habit.findMany({
      where: {
        study_id: parseInt(studyId),
        isRemoved: false,
        habitFullfillments: {
          some: {
            habit_fullfillment_year: year,
            habit_fullfillment_week: week,
            habit_fullfillment_day: day,
          },
        },
      },
      include: {
        habitFullfillments: {
          where: {
            habit_fullfillment_year: year,
            habit_fullfillment_week: week,
            habit_fullfillment_day: day,
          },
        },
      },
    });

    return TodayHabitDTO.fromEntities(
      habitsWithTodayFullfillment.map(habit => ({
        habit: { habit_pk: habit.habit_pk, habit_name: habit.habit_name },
        hasFullfillment: habit.habitFullfillments.length > 0,
        fullfillmentCount: habit.habitFullfillments.length,
      }))
    );
  },

  getWeekHabitFulfillments: async (studyId) => {
    const { year, week } = getCurrentDateInfo();
    
    const weekHabits = await prisma.habit.findMany({
      where: {
        study_id: parseInt(studyId),
        OR: [
          { isRemoved: false },
          {
            habitFullfillments: {
              some: {
                habit_fullfillment_year: year,
                habit_fullfillment_week: week,
              },
            },
          },
        ],
      },
      include: {
        habitFullfillments: {
          where: {
            habit_fullfillment_year: year,
            habit_fullfillment_week: week,
          },
        },
      },
    });

    const habitsWithCount = weekHabits.map(habit => {
      const dayCounts = {};
      habit.habitFullfillments.forEach(fullfillment => {
        const day = fullfillment.habit_fullfillment_day;
        dayCounts[day] = (dayCounts[day] || 0) + 1;
      });

      return {
        habit: {
          habit_pk: habit.habit_pk,
          habit_name: habit.habit_name,
          isRemoved: habit.isRemoved,
        },
        weekFullfillments: habit.habitFullfillments,
        fullfillmentCountByDay: dayCounts,
        totalFullfillmentCount: habit.habitFullfillments.length,
      };
    });

    return WeekHabitDTO.fromEntities(habitsWithCount);
  },

  createHabitFullfillmentToday: async (studyId, habitId) => {
    const { year, week, day } = getCurrentDateInfo();

    return await prisma.habitFullfillment.create({
      data: {
        habit_pk: parseInt(habitId),
        study_id: parseInt(studyId),
        habit_fullfillment_year: year,
        habit_fullfillment_week: week,
        habit_fullfillment_day: day,
      },
    });
  },

  updateHabitsBatch: async (studyId, habitsData) => {
    const studyIdInt = parseInt(studyId);
    
    if (!Array.isArray(habitsData)) {
      throw new Error('habits 배열이 필요합니다.');
    }

    const existingHabits = await prisma.habit.findMany({
      where: {
        study_id: studyIdInt,
        isRemoved: false,
      },
    });

    const existingHabitMap = new Map();
    existingHabits.forEach(habit => {
      existingHabitMap.set(habit.habit_pk, habit);
    });

    const existingHabitByNameMap = new Map();
    existingHabits.forEach(habit => {
      existingHabitByNameMap.set(habit.habit_name, habit);
    });

    const newHabitPks = new Set();
    const processedHabitNames = new Set();
    const result = {
      created: [],
      updated: [],
      removed: [],
      unchanged: [],
    };

    await prisma.$transaction(async (tx) => {
      for (const habitData of habitsData) {
        const { habit_pk, habit_name } = habitData;
        
        if (!habit_name) {
          continue;
        }

        if (habit_pk) {
          const habitPkInt = parseInt(habit_pk);
          const existingHabit = existingHabitMap.get(habitPkInt);

          if (!existingHabit || existingHabit.study_id !== studyIdInt) {
            continue;
          }

          newHabitPks.add(habitPkInt);

          if (existingHabit.habit_name === habit_name) {
            result.unchanged.push(existingHabit);
            processedHabitNames.add(habit_name);
          } else {
            if (processedHabitNames.has(habit_name)) {
              newHabitPks.add(habitPkInt);
              await tx.habit.update({
                where: { habit_pk: habitPkInt },
                data: { isRemoved: true },
              });
              result.removed.push(habitPkInt);
              continue;
            }

            const duplicateCheck = await tx.habit.findFirst({
              where: {
                study_id: studyIdInt,
                habit_name,
                habit_pk: { not: habitPkInt },
                isRemoved: false,
              },
            });

            if (duplicateCheck) {
              newHabitPks.add(duplicateCheck.habit_pk);
              await tx.habit.update({
                where: { habit_pk: habitPkInt },
                data: { isRemoved: true },
              });
              result.removed.push(habitPkInt);
              processedHabitNames.add(habit_name);
              continue;
            }

            const updated = await tx.habit.update({
              where: { habit_pk: habitPkInt },
              data: { habit_name },
            });
            result.updated.push(updated);
            existingHabitMap.set(habitPkInt, updated);
            existingHabitByNameMap.set(habit_name, updated);
            processedHabitNames.add(habit_name);
          }
        } else {
          if (processedHabitNames.has(habit_name)) {
            const existingByName = existingHabitByNameMap.get(habit_name);
            if (existingByName) {
              newHabitPks.add(existingByName.habit_pk);
            }
            continue;
          }

          const existingByName = existingHabitByNameMap.get(habit_name);

          if (existingByName) {
            newHabitPks.add(existingByName.habit_pk);
            result.unchanged.push(existingByName);
            processedHabitNames.add(habit_name);
          } else {
            const duplicateCheck = await tx.habit.findFirst({
              where: {
                study_id: studyIdInt,
                habit_name,
                isRemoved: false,
              },
            });

            if (duplicateCheck) {
              newHabitPks.add(duplicateCheck.habit_pk);
              result.unchanged.push(duplicateCheck);
              existingHabitByNameMap.set(habit_name, duplicateCheck);
              processedHabitNames.add(habit_name);
            } else {
              const created = await tx.habit.create({
                data: {
                  study_id: studyIdInt,
                  habit_name,
                  isRemoved: false,
                },
              });
              result.created.push(created);
              existingHabitMap.set(created.habit_pk, created);
              existingHabitByNameMap.set(habit_name, created);
              newHabitPks.add(created.habit_pk);
              processedHabitNames.add(habit_name);
            }
          }
        }
      }

      const habitsToRemove = existingHabits.filter(
        h => !newHabitPks.has(h.habit_pk)
      );

      for (const habit of habitsToRemove) {
        await tx.habit.update({
          where: { habit_pk: habit.habit_pk },
          data: { isRemoved: true },
        });
        result.removed.push(habit.habit_pk);
      }
    });

    return result;
  },

  updateHabit: async (studyId, habitId, updateData) => {
    const { habit_name } = updateData;
    
    const habit = await prisma.habit.findFirst({
      where: {
        habit_pk: parseInt(habitId),
        study_id: parseInt(studyId),
      },
    });

    if (!habit) {
      throw new Error('Habit not found for this study');
    }
    
    return await prisma.habit.update({
      where: { habit_pk: parseInt(habitId) },
      data: {
        habit_name,
      },
    });
  },

  deleteHabit: async (studyId, habitId) => {
    const habit = await prisma.habit.findFirst({
      where: {
        habit_pk: parseInt(habitId),
        study_id: parseInt(studyId),
      },
    });

    if (!habit) {
      throw new Error('Habit not found for this study');
    }

    return await prisma.habit.update({
      where: { habit_pk: parseInt(habitId) },
      data: { isRemoved: true },
    });
  },

  createHabits: async (studyId, habitNames) => {
    const studyIdInt = parseInt(studyId);
    
    const names = Array.isArray(habitNames) ? habitNames : [habitNames];
    
    if (names.length === 0) {
      return [];
    }

    const existingHabits = await prisma.habit.findMany({
      where: {
        study_id: studyIdInt,
        habit_name: {
          in: names,
        },
      },
      select: {
        habit_name: true,
      },
    });

    const existingNames = existingHabits.map(h => h.habit_name);
    const newNames = names.filter(name => !existingNames.includes(name));

    if (newNames.length === 0) {
      return [];
    }

    const createData = newNames.map(habit_name => ({
      study_id: studyIdInt,
      habit_name,
      isRemoved: false,
    }));

    const createdHabits = await prisma.habit.createMany({
      data: createData,
      skipDuplicates: true,
    });

    const createdHabitList = await prisma.habit.findMany({
      where: {
        study_id: studyIdInt,
        habit_name: {
          in: newNames,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      created: createdHabitList,
      skipped: existingNames,
      totalCreated: createdHabits.count,
    };
  },

  getAllHabits: async () => {
    return await prisma.habit.findMany({
      where: { isRemoved: false },
      include: { study: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  getHabitsByStudyId: async (studyId) => {
    return await prisma.habit.findMany({
      where: { 
        study_id: parseInt(studyId),
        isRemoved: false,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  deleteHabitFullfillment: async (fullfillmentId) => {
    return await prisma.habitFullfillment.delete({
      where: { habit_fullfillment_pk: parseInt(fullfillmentId) },
    });
  },
};

module.exports = habitService;

class TodayHabitDTO {
  constructor(habit, hasFullfillment, fullfillmentCount) {
    this.habit_pk = habit.habit_pk;
    this.habit_name = habit.habit_name;
    this.hasFullfillment = hasFullfillment;
    this.fullfillmentCount = fullfillmentCount || 0;
  }

  static fromEntity(habit, hasFullfillment, fullfillmentCount) {
    return new TodayHabitDTO(habit, hasFullfillment, fullfillmentCount);
  }

  static fromEntities(habits) {
    return habits.map(item => TodayHabitDTO.fromEntity(
      item.habit,
      item.hasFullfillment,
      item.fullfillmentCount
    ));
  }
}

class WeekHabitDTO {
  constructor(habit, weekFullfillments, fullfillmentCountByDay, totalFullfillmentCount) {
    this.habit_pk = habit.habit_pk;
    this.habit_name = habit.habit_name;
    this.isRemoved = habit.isRemoved;
    this.weekFullfillments = weekFullfillments || [];
    this.fullfillmentCountByDay = fullfillmentCountByDay || {};
    this.totalFullfillmentCount = totalFullfillmentCount || 0;
  }

  static fromEntity(habit, weekFullfillments, fullfillmentCountByDay, totalFullfillmentCount) {
    return new WeekHabitDTO(habit, weekFullfillments, fullfillmentCountByDay, totalFullfillmentCount);
  }

  static fromEntities(habits) {
    return habits.map(item => WeekHabitDTO.fromEntity(
      item.habit,
      item.weekFullfillments,
      item.fullfillmentCountByDay,
      item.totalFullfillmentCount
    ));
  }
}

module.exports = {
  TodayHabitDTO,
  WeekHabitDTO,
};

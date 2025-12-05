const prisma = require('../lib/prisma');
const { StudyListDTO, StudyDetailDTO, TodayConcentrationDTO } = require('../dto/studyDTO');
const { now } = require('../utils/dateUtils');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const studyService = {
  getStudiesWithPaging: async (options = {}) => {
    const {
      page = 1,
      limit = 6,
      sort = 'recent',
      search = '',
    } = options;

    const skip = (page - 1) * limit;

    let orderBy = {};
    switch (sort) {
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'asc' };
        break;
      case 'points_desc':
        orderBy = { point_sum: 'desc' };
        break;
      case 'points_asc':
        orderBy = { point_sum: 'asc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    const where = search
      ? {
          study_name: {
            contains: search,
          },
        }
      : {};

    const [studies, total] = await Promise.all([
      prisma.study.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy,
        select: {
          study_id: true,
          study_name: true,
          study_introduction: true,
          point_sum: true,
          background: true,
          createdAt: true,
        },
      }),
      prisma.study.count({ where }),
    ]);

    const studyIds = studies.map(study => study.study_id);

    let topEmojisByStudyId = {};
    let totalEmojiCountsByStudyId = {};

    if (studyIds.length > 0) {
      const [topEmojisMap, totalEmojiCountsMap] = await Promise.all([
        Promise.all(
          studyIds.map(async (studyId) => {
            const topEmojis = await prisma.emoji.findMany({
              where: { study_id: studyId },
              orderBy: { emoji_hit: 'desc' },
              take: 3,
              select: {
                emoji_id: true,
                emoji_name: true,
                emoji_hit: true,
              },
            });
            return { studyId, topEmojis };
          })
        ),
        prisma.emoji.groupBy({
          by: ['study_id'],
          where: {
            study_id: { in: studyIds },
          },
          _count: {
            emoji_id: true,
          },
        }),
      ]);

      topEmojisMap.forEach(({ studyId, topEmojis }) => {
        topEmojisByStudyId[studyId] = topEmojis;
      });

      totalEmojiCountsMap.forEach((item) => {
        totalEmojiCountsByStudyId[item.study_id] = item._count.emoji_id;
      });
    }

    const studiesWithEmojis = studies.map(study => ({
      ...study,
      topEmojis: topEmojisByStudyId[study.study_id] || [],
      totalEmojiCount: totalEmojiCountsByStudyId[study.study_id] || 0,
    }));

    return {
      studies: StudyListDTO.fromEntities(studiesWithEmojis),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  createStudy: async (studyData) => {
    const { nickname, study_name, study_introduction, background, password, concentration_time } = studyData;

    const dataToCreate = {
      nickname,
      study_name: study_name,
      study_introduction: study_introduction,
      background: background || 0,
      point_sum: 0,
    };

    if (password) {
      dataToCreate.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    if (concentration_time !== undefined) {
      dataToCreate.concentration_time = concentration_time;
    } else {
      dataToCreate.concentration_time = '00:25:00';
    }

    return await prisma.study.create({
      data: dataToCreate,
    });
  },

  updateStudy: async (studyId, updateData) => {
    const { nickname, study_name, study_introduction, background, password } = updateData;

    const dataToUpdate = {};
    if (nickname !== undefined) dataToUpdate.nickname = nickname;
    if (study_name !== undefined) dataToUpdate.study_name = study_name;
    if (study_introduction !== undefined) dataToUpdate.study_introduction = study_introduction;
    if (background !== undefined) dataToUpdate.background = background;
    if (password !== undefined && password !== null) {
      dataToUpdate.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    return await prisma.study.update({
      where: { study_id: parseInt(studyId)},
      data: dataToUpdate,
    });
  },

  deleteStudy: async (studyId) => {
    return await prisma.study.delete({
      where: { study_id: parseInt(studyId) },
    });
  },

  getStudyDetail: async (studyId, week) => {
    const currentYear = now().year();

    const study = await prisma.study.findUnique({
      where: { study_id: parseInt(studyId) },
      select: {
        study_id: true,
        study_name: true,
        study_introduction: true,
        point_sum: true,
        emojis: {
          select: {
            emoji_id: true,
            emoji_name: true,
            emoji_hit: true,
          },
        },
        habitFullfillments: {
          where: {
            habit_fullfillment_year: currentYear,
            habit_fullfillment_week: parseInt(week),
          },
          include: {
            habit: {
              select: {
                habit_pk: true,
                habit_name: true,
                isRemoved: true,
              },
            },
          },
        },
      },
    });

    return StudyDetailDTO.fromEntity(study);
  },

  verifyPassword: async (studyId, password) => {
    const study = await prisma.study.findUnique({
      where: { study_id: parseInt(studyId) },
      select: {
        password: true,
      },
    });

    if (!study || !study.password) {
      return false;
    }

    if (!password) {
      return false;
    }

    const storedPassword = study.password;
    const isBcryptHash = storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$');

    if (isBcryptHash) {
      const isValid = await bcrypt.compare(password, storedPassword);
      if (isValid) {
        return true;
      }
      return false;
    } else {
      if (storedPassword === password) {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await prisma.study.update({
          where: { study_id: parseInt(studyId) },
          data: { password: hashedPassword },
        });
        return true;
      }
      return false;
    }
  },

  getTodayConcentration: async (studyId) => {
    const study = await prisma.study.findUnique({
      where: { study_id: parseInt(studyId) },
      select: {
        study_name: true,
        point_sum: true,
        concentration_time: true,
      },
    });

    if (!study) {
      throw new Error('Study not found');
    }

    return TodayConcentrationDTO.fromEntity({
      study_name: study.study_name,
      total_point: study.point_sum,
      concentration_time: study.concentration_time,
    });
  },

  updateConcentrationTime: async (studyId, concentrationTime) => {
    const study = await prisma.study.findUnique({
      where: { study_id: parseInt(studyId) },
    });

    if (!study) {
      throw new Error('Study not found');
    }

    return await prisma.study.update({
      where: { study_id: parseInt(studyId) },
      data: {
        concentration_time: concentrationTime,
      },
      select: {
        study_id: true,
        study_name: true,
        concentration_time: true,
      },
    });
  },

  getAllStudies: async () => {
    return await prisma.study.findMany({
      orderBy: { createdAt: 'desc' },
    });
  },

  getStudyById: async (studyId) => {
    return await prisma.study.findUnique({
      where: { study_id: parseInt(studyId) },
      select: {
        study_id: true,
        nickname: true,
        study_name: true,
        study_introduction: true,
        background: true,
        point_sum: true,
        concentration_time: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  getStudiesByIds: async (studyIds) => {
    const ids = Array.isArray(studyIds) ? studyIds : [studyIds];
    const limitedIds = ids.slice(0, 3).map(id => parseInt(id));

    if (limitedIds.length === 0) {
      return [];
    }

    const studiesMap = new Map();
    const studies = await prisma.study.findMany({
      where: {
        study_id: {
          in: limitedIds,
        },
      },
      select: {
        study_id: true,
        study_name: true,
        study_introduction: true,
        point_sum: true,
        background: true,
        createdAt: true,
      },
    });

    studies.forEach(study => {
      studiesMap.set(study.study_id, study);
    });

    const orderedStudies = limitedIds
      .map(id => studiesMap.get(id))
      .filter(study => study !== undefined);

    return StudyListDTO.fromEntities(orderedStudies);
  },
};

module.exports = studyService;

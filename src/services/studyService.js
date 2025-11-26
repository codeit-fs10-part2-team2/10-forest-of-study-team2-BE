const prisma = require('../lib/prisma');
const { StudyListDTO, StudyDetailDTO, TodayConcentrationDTO } = require('../dto/studyDTO');
const { now } = require('../utils/dateUtils');

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

    return {
      studies: StudyListDTO.fromEntities(studies),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  createStudy: async (studyData) => {
    const { nickname, study_name, introduction, background, password, concentration_time } = studyData;

    const dataToCreate = {
      nickname,
      study_name: study_name,
      study_introduction: introduction,
      password,
      background: background || 0,
      point_sum: 0,
    };

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
    if (password !== undefined) dataToUpdate.password = password;

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

    if (!study) {
      return false;
    }

    return study.password === password;
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

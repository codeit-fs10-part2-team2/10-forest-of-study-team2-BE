const prisma = require('../lib/prisma');

const pointService = {
  getAllPoints: async () => {
    return await prisma.point.findMany({
      include: { study: true },
      orderBy: { createdAt: 'desc' },
    });
  },

  getPointsByStudyId: async (studyId) => {
    return await prisma.point.findMany({
      where: { study_id: parseInt(studyId) },
      orderBy: { createdAt: 'desc' },
    });
  },

  createPoint: async (pointData) => {
    const { study_id, point_content, point } = pointData;
    
    const newPoint = await prisma.point.create({
      data: {
        study_id: parseInt(study_id),
        point_content,
        point: point || 0,
      },
    });

    const studyPoints = await prisma.point.aggregate({
      where: { study_id: parseInt(study_id) },
      _sum: { point: true },
    });

    await prisma.study.update({
      where: { study_id: parseInt(study_id) },
      data: { point_sum: studyPoints._sum.point || 0 },
    });

    return newPoint;
  },

  deletePoint: async (studyId, pointId) => {
    const point = await prisma.point.findFirst({
      where: {
        point_pk: parseInt(pointId),
        study_id: parseInt(studyId),
      },
    });

    if (!point) {
      throw new Error('Point not found for this study');
    }

    await prisma.point.delete({
      where: { point_pk: parseInt(pointId) },
    });

    const studyPoints = await prisma.point.aggregate({
      where: { study_id: parseInt(studyId) },
      _sum: { point: true },
    });

    await prisma.study.update({
      where: { study_id: parseInt(studyId) },
      data: { point_sum: studyPoints._sum.point || 0 },
    });

    return { message: 'Point deleted successfully' };
  },
};

module.exports = pointService;

const express = require('express');
const pointRouter = express.Router();
const pointService = require('../services/pointService');

/**
 * @swagger
 * tags:
 *   name: Points
 *   description: Point management endpoints
 */

/**
 * @swagger
 * /api/points/study/{studyId}:
 *   get:
 *     summary: Get points by study ID
 *     tags: [Points]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of points for the study
 */
pointRouter.get('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const points = await pointService.getPointsByStudyId(studyId);
    res.json({ success: true, data: points });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/points/study/{studyId}:
 *   post:
 *     summary: Create new point for a study
 *     tags: [Points]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - point_content
 *             properties:
 *               point_content:
 *                 type: string
 *               point:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Point created successfully
 */
pointRouter.post('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const pointData = {
      study_id: parseInt(studyId),
      ...req.body,
    };
    const newPoint = await pointService.createPoint(pointData);
    res.status(201).json({ success: true, data: newPoint });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/points/study/{studyId}/{pointId}:
 *   delete:
 *     summary: Delete point
 *     tags: [Points]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: pointId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Point deleted successfully
 */
pointRouter.delete('/study/:studyId/:pointId', async (req, res, next) => {
  try {
    const { studyId, pointId } = req.params;
    const result = await pointService.deletePoint(studyId, pointId);
    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
});

module.exports = pointRouter;

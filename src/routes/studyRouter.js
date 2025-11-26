const express = require('express');
const studyRouter = express.Router();
const studyService = require('../services/studyService');

/**
 * @swagger
 * components:
 *   schemas:
 *     StudyInput:
 *       type: object
 *       required:
 *         - nickname
 *         - study_name
 *       properties:
 *         nickname:
 *           type: string
 *         study_name:
 *           type: string
 *         study_introduction:
 *           type: string
 *         password:
 *           type: string
 *         background:
 *           type: integer
 *           minimum: 0
 *           maximum: 7
 *         concentration_time:
 *           type: string
 *           format: time
 *           description: Optional. Default is '00:25:00' if not provided
 */

/**
 * @swagger
 * tags:
 *   name: Studies
 *   description: Study management endpoints
 */

/**
 * @swagger
 * /api/studies:
 *   get:
 *     summary: Get all studies with pagination, sorting, and search
 *     tags: [Studies]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 6
 *         description: Number of items per page
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [recent, oldest, points_desc, points_asc]
 *           default: recent
 *         description: Sort order (recent, oldest, points_desc, points_asc)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for study_name
 *     responses:
 *       200:
 *         description: List of studies with pagination
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     studies:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Study'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 */
studyRouter.get('/', async (req, res, next) => {
  try {
    const { page, limit, sort, search } = req.query;
    const result = await studyService.getStudiesWithPaging({
      page,
      limit,
      sort,
      search,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies/{id}:
 *   get:
 *     summary: Get study by ID
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     responses:
 *       200:
 *         description: Study details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Study'
 *       404:
 *         description: Study not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
studyRouter.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const study = await studyService.getStudyById(id);
    if (!study) {
      return res.status(404).json({ success: false, message: 'Study not found' });
    }
    res.json({ success: true, data: study });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies:
 *   post:
 *     summary: Create new study
 *     tags: [Studies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudyInput'
 *     responses:
 *       201:
 *         description: Study created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Study'
 */
studyRouter.post('/', async (req, res, next) => {
  try {
    const study = await studyService.createStudy(req.body);
    res.status(201).json({ success: true, data: study });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies/{id}:
 *   put:
 *     summary: Update study
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StudyInput'
 *     responses:
 *       200:
 *         description: Study updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Study'
 */
studyRouter.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const study = await studyService.updateStudy(id, req.body);
    res.json({ success: true, data: study });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies/{id}:
 *   delete:
 *     summary: Delete study
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     responses:
 *       200:
 *         description: Study deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 */
studyRouter.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await studyService.deleteStudy(id);
    res.json({ success: true, message: 'Study deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies/{id}/concentration-time:
 *   put:
 *     summary: Update study concentration time
 *     tags: [Studies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - concentration_time
 *             properties:
 *               concentration_time:
 *                 type: string
 *                 format: time
 *                 description: Concentration time in HH:MM:SS format
 *                 example: "00:25:00"
 *     responses:
 *       200:
 *         description: Concentration time updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     study_id:
 *                       type: integer
 *                     study_name:
 *                       type: string
 *                     concentration_time:
 *                       type: string
 */
studyRouter.put('/:id/concentration-time', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { concentration_time } = req.body;
    
    if (!concentration_time) {
      return res.status(400).json({
        success: false,
        message: 'concentration_time이 필요합니다.',
      });
    }

    const study = await studyService.updateConcentrationTime(id, concentration_time);
    res.json({ success: true, data: study });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/studies/batch:
 *   post:
 *     summary: Get multiple studies by IDs (max 3)
 *     tags: [Studies]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - study_ids
 *             properties:
 *               study_ids:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 maxItems: 3
 *                 description: Array of study IDs (maximum 3)
 *                 example: [1, 2, 3]
 *     responses:
 *       200:
 *         description: List of studies
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Study'
 */
studyRouter.post('/batch', async (req, res, next) => {
  try {
    const { study_ids } = req.body;
    
    if (!study_ids || !Array.isArray(study_ids) || study_ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'study_ids 배열이 필요합니다.',
      });
    }

    if (study_ids.length > 3) {
      return res.status(400).json({
        success: false,
        message: '최대 3개의 study_id만 조회할 수 있습니다.',
      });
    }

    const studies = await studyService.getStudiesByIds(study_ids);
    res.json({ success: true, data: studies });
  } catch (error) {
    next(error);
  }
});

module.exports = studyRouter;

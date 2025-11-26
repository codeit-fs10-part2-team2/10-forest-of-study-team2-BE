const express = require('express');
const habitRouter = express.Router();
const habitService = require('../services/habitService');

/**
 * @swagger
 * tags:
 *   name: Habits
 *   description: Habit management endpoints
 */

/**
 * @swagger
 * /api/habits:
 *   get:
 *     summary: Get all habits
 *     tags: [Habits]
 *     responses:
 *       200:
 *         description: List of all habits
 */
habitRouter.get('/', async (req, res, next) => {
  try {
    const habits = await habitService.getAllHabits();
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}:
 *   get:
 *     summary: Get habits by study ID
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of habits for the study
 */
habitRouter.get('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const habits = await habitService.getHabitsByStudyId(studyId);
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}:
 *   post:
 *     summary: Create new habits for a study (array of habit names)
 *     tags: [Habits]
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
 *               - habit_names
 *             properties:
 *               habit_names:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of habit names to create
 *                 example: ["운동하기", "독서하기", "코딩하기"]
 *     responses:
 *       201:
 *         description: Habits created successfully
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
 *                     created:
 *                       type: array
 *                       items:
 *                         type: object
 *                     skipped:
 *                       type: array
 *                       items:
 *                         type: string
 *                     totalCreated:
 *                       type: integer
 */
habitRouter.post('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const { habit_names } = req.body;
    
    if (!habit_names || !Array.isArray(habit_names) || habit_names.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'habit_names 배열이 필요합니다.',
      });
    }

    const result = await habitService.createHabits(studyId, habit_names);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}:
 *   put:
 *     summary: Update all habits for a study (batch update)
 *     tags: [Habits]
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
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 habit_pk:
 *                   type: integer
 *                   description: 기존 Habit ID (없으면 새로 생성)
 *                 habit_name:
 *                   type: string
 *             description: Habit 데이터 배열 (habit_pk, habit_name만 포함)
 *             example: [
 *               {"habit_pk": 1, "habit_name": "운동하기"},
 *               {"habit_pk": 2, "habit_name": "독서하기 수정"},
 *               {"habit_name": "코딩하기 (신규)"}
 *             ]
 *     responses:
 *       200:
 *         description: Habits updated successfully
 */
habitRouter.put('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    
    if (!Array.isArray(req.body)) {
      return res.status(400).json({
        success: false,
        message: 'habits 배열이 필요합니다.',
      });
    }

    const result = await habitService.updateHabitsBatch(studyId, req.body);
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}/{habitId}:
 *   put:
 *     summary: Update single habit (deprecated - use PUT /study/:studyId instead)
 *     tags: [Habits]
 *     deprecated: true
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habit_name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Habit updated successfully
 */
habitRouter.put('/study/:studyId/:habitId', async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;
    const habit = await habitService.updateHabit(studyId, habitId, req.body);
    res.json({ success: true, data: habit });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}/{habitId}:
 *   delete:
 *     summary: Delete habit (soft delete)
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Habit deleted successfully
 */
habitRouter.delete('/study/:studyId/:habitId', async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;
    await habitService.deleteHabit(studyId, habitId);
    res.json({ success: true, message: 'Habit deleted successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}/today:
 *   get:
 *     summary: Get today's habits
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     responses:
 *       200:
 *         description: Today's habits
 */
habitRouter.get('/study/:studyId/today', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const habits = await habitService.getTodayHabits(studyId);
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}/week:
 *   get:
 *     summary: Get this week's habits
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Study ID
 *     responses:
 *       200:
 *         description: This week's habits
 */
habitRouter.get('/study/:studyId/week', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const habits = await habitService.getWeekHabitFulfillments(studyId);
    res.json({ success: true, data: habits });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/study/{studyId}/{habitId}/fullfillment:
 *   post:
 *     summary: Create habit fullfillment for today
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Habit fullfillment created successfully
 */
habitRouter.post('/study/:studyId/:habitId/fullfillment', async (req, res, next) => {
  try {
    const { studyId, habitId } = req.params;
    const fullfillment = await habitService.createHabitFullfillmentToday(studyId, habitId);
    res.status(201).json({ success: true, data: fullfillment });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/habits/fullfillments/{fullfillmentId}:
 *   delete:
 *     summary: Delete habit fullfillment
 *     tags: [Habits]
 *     parameters:
 *       - in: path
 *         name: fullfillmentId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Habit fullfillment deleted successfully
 */
habitRouter.delete('/fullfillments/:fullfillmentId', async (req, res, next) => {
  try {
    const { fullfillmentId } = req.params;
    await habitService.deleteHabitFullfillment(fullfillmentId);
    res.json({ success: true, message: 'Habit fullfillment deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = habitRouter;

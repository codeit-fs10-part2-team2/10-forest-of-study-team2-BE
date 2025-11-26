const express = require('express');
const emojiRouter = express.Router();
const emojiService = require('../services/emojiService');

/**
 * @swagger
 * tags:
 *   name: Emojis
 *   description: Emoji management endpoints
 */

/**
 * @swagger
 * /api/emojis/study/{studyId}:
 *   get:
 *     summary: Get emojis by study ID
 *     tags: [Emojis]
 *     parameters:
 *       - in: path
 *         name: studyId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of emojis for the study
 */
emojiRouter.get('/study/:studyId', async (req, res, next) => {
  try {
    const { studyId } = req.params;
    const emojis = await emojiService.getEmojisByStudyId(studyId);
    res.json({ success: true, data: emojis });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emojis:
 *   post:
 *     summary: Create new emoji or increment hit if exists
 *     tags: [Emojis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - study_id
 *               - emoji_name
 *             properties:
 *               study_id:
 *                 type: integer
 *               emoji_name:
 *                 type: string
 *                 description: Emoji character or name
 *               emoji_hit:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Emoji created or updated successfully
 */
emojiRouter.post('/', async (req, res, next) => {
  try {
    const emoji = await emojiService.createEmoji(req.body);
    res.status(201).json({ success: true, data: emoji });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emojis/{emojiId}/increment:
 *   post:
 *     summary: Increment emoji hit count
 *     tags: [Emojis]
 *     parameters:
 *       - in: path
 *         name: emojiId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Emoji hit count incremented successfully
 */
emojiRouter.post('/:emojiId/increment', async (req, res, next) => {
  try {
    const { emojiId } = req.params;
    const emoji = await emojiService.incrementEmojiHit(emojiId);
    res.json({ success: true, data: emoji });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/emojis/{emojiId}:
 *   delete:
 *     summary: Delete emoji
 *     tags: [Emojis]
 *     parameters:
 *       - in: path
 *         name: emojiId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Emoji deleted successfully
 */
emojiRouter.delete('/:emojiId', async (req, res, next) => {
  try {
    const { emojiId } = req.params;
    await emojiService.deleteEmoji(emojiId);
    res.json({ success: true, message: 'Emoji deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = emojiRouter;

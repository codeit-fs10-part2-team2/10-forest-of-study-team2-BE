const prisma = require('../lib/prisma');

const emojiService = {
  getEmojisByStudyId: async (studyId) => {
    return await prisma.emoji.findMany({
      where: { study_id: parseInt(studyId) },
      orderBy: { createdAt: 'desc' },
    });
  },

  createEmoji: async (emojiData) => {
    const { study_id, emoji_name, emoji_hit } = emojiData;
    
    const existingEmoji = await prisma.emoji.findFirst({
      where: {
        study_id: parseInt(study_id),
        emoji_name,
      },
    });

    if (existingEmoji) {
      return await prisma.emoji.update({
        where: { emoji_id: existingEmoji.emoji_id },
        data: { emoji_hit: existingEmoji.emoji_hit + 1 },
      });
    }

    return await prisma.emoji.create({
      data: {
        study_id: parseInt(study_id),
        emoji_name,
        emoji_hit: emoji_hit || 0,
      },
    });
  },

  incrementEmojiHit: async (emojiId) => {
    const emoji = await prisma.emoji.findUnique({
      where: { emoji_id: parseInt(emojiId) },
    });

    if (!emoji) {
      throw new Error('Emoji not found');
    }

    return await prisma.emoji.update({
      where: { emoji_id: parseInt(emojiId) },
      data: { emoji_hit: emoji.emoji_hit + 1 },
    });
  },

  deleteEmoji: async (emojiId) => {
    return await prisma.emoji.delete({
      where: { emoji_id: parseInt(emojiId) },
    });
  },
};

module.exports = emojiService;

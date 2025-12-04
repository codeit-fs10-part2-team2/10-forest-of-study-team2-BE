const prisma = require('../lib/prisma');

const emojiService = {
  getEmojisByStudyId: async (studyId) => {
    return await prisma.emoji.findMany({
      where: { study_id: parseInt(studyId) },
      orderBy: { createdAt: 'desc' },
    });
  },

  createEmoji: async (emojiData) => {
    const { study_id, emoji_name } = emojiData;
    const studyIdInt = parseInt(study_id);
    const emojiNameClean = String(emoji_name);
    
    return await prisma.$transaction(async (tx) => {
      const existingEmoji = await tx.emoji.findFirst({
        where: {
          study_id: studyIdInt,
          emoji_name: emojiNameClean,
        },
      });

      if (existingEmoji) {
        return await tx.emoji.update({
          where: { 
            emoji_id: existingEmoji.emoji_id,
          },
          data: { 
            emoji_hit: existingEmoji.emoji_hit + 1,
          },
        });
      }

      return await tx.emoji.create({
        data: {
          study_id: studyIdInt,
          emoji_name: emojiNameClean,
          emoji_hit: 1,
        },
      });
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

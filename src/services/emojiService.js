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
      const allEmojis = await tx.emoji.findMany({
        where: {
          study_id: studyIdInt,
        },
      });
      
      const requestEmojiBytes = Buffer.from(emojiNameClean).toString('hex');
      
      const existingEmoji = allEmojis.find(e => {
        const dbEmojiBytes = Buffer.from(e.emoji_name).toString('hex');
        return dbEmojiBytes === requestEmojiBytes;
      });

      if (existingEmoji) {
        return await tx.emoji.update({
          where: { 
            emoji_id: existingEmoji.emoji_id,
          },
          data: { 
            emoji_hit: { increment: 1 },
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
    }, {
      maxWait: 10000,
      timeout: 30000,
    });
  },

  incrementEmojiHit: async (emojiId) => {
    if (!emojiId || emojiId === 'undefined' || emojiId === 'null') {
      throw new Error('emojiId is required');
    }

    const emojiIdInt = parseInt(emojiId);
    if (isNaN(emojiIdInt)) {
      throw new Error('Invalid emojiId');
    }

    try {
      return await prisma.emoji.update({
        where: { emoji_id: emojiIdInt },
        data: { emoji_hit: { increment: 1 } },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new Error('Emoji not found');
      }
      throw error;
    }
  },

  deleteEmoji: async (emojiId) => {
    return await prisma.emoji.delete({
      where: { emoji_id: parseInt(emojiId) },
    });
  },
};

module.exports = emojiService;

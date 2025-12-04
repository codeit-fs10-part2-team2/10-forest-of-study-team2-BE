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
    
    console.log('[createEmoji] Request received:', {
      study_id: studyIdInt,
      emoji_name: emoji_name,
      emoji_name_clean: emojiNameClean,
      emoji_name_length: emojiNameClean.length,
      emoji_name_bytes: Buffer.from(emojiNameClean).toString('hex'),
    });
    
    return await prisma.$transaction(async (tx) => {
      const allEmojis = await tx.emoji.findMany({
        where: {
          study_id: studyIdInt,
        },
      });
      
      console.log('[createEmoji] All emojis for study_id', studyIdInt, ':', allEmojis.map(e => ({
        emoji_id: e.emoji_id,
        emoji_name: e.emoji_name,
        emoji_name_bytes: Buffer.from(e.emoji_name).toString('hex'),
        emoji_hit: e.emoji_hit,
      })));
      
      const existingEmoji = await tx.emoji.findFirst({
        where: {
          study_id: studyIdInt,
          emoji_name: emojiNameClean,
        },
      });

      console.log('[createEmoji] Existing emoji found:', existingEmoji ? {
        emoji_id: existingEmoji.emoji_id,
        emoji_name: existingEmoji.emoji_name,
        emoji_name_bytes: Buffer.from(existingEmoji.emoji_name).toString('hex'),
        emoji_hit: existingEmoji.emoji_hit,
        matches: existingEmoji.emoji_name === emojiNameClean,
      } : null);

      if (existingEmoji) {
        console.log('[createEmoji] Updating emoji:', {
          emoji_id: existingEmoji.emoji_id,
          old_hit: existingEmoji.emoji_hit,
          new_hit: existingEmoji.emoji_hit + 1,
        });
        
        const updated = await tx.emoji.update({
          where: { 
            emoji_id: existingEmoji.emoji_id,
          },
          data: { 
            emoji_hit: existingEmoji.emoji_hit + 1,
          },
        });
        
        console.log('[createEmoji] Emoji updated:', {
          emoji_id: updated.emoji_id,
          emoji_name: updated.emoji_name,
          emoji_hit: updated.emoji_hit,
        });
        
        return updated;
      }

      console.log('[createEmoji] Creating new emoji');
      
      const created = await tx.emoji.create({
        data: {
          study_id: studyIdInt,
          emoji_name: emojiNameClean,
          emoji_hit: 1,
        },
      });
      
      console.log('[createEmoji] Emoji created:', {
        emoji_id: created.emoji_id,
        emoji_name: created.emoji_name,
        emoji_hit: created.emoji_hit,
      });
      
      return created;
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

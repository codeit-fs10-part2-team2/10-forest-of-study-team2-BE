const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

let timezoneSet = false;

prisma.$use(async (params, next) => {
  if (!timezoneSet) {
    try {
      await prisma.$executeRawUnsafe('SET time_zone = "+09:00"');
      timezoneSet = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('Database timezone set to Asia/Seoul (+09:00)');
      }
    } catch (error) {
      console.warn('Failed to set database timezone:', error.message);
    }
  }
  
  return next(params);
});

module.exports = prisma;

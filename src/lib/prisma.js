const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const prisma = basePrisma.$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      if (operation === 'create' || operation === 'update' || operation === 'createMany' || operation === 'updateMany') {
        return (async () => {
          try {
            await basePrisma.$executeRawUnsafe('SET time_zone = "+09:00"');
          } catch (error) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('Timezone setting warning:', error.message);
            }
          }
          return query(args);
        })();
      }
      return query(args);
    },
  },
});

module.exports = prisma;

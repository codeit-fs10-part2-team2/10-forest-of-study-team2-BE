const { PrismaClient } = require('@prisma/client');

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const prisma = basePrisma.$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      if (operation === 'create' || operation === 'update' || operation === 'createMany' || operation === 'updateMany') {
        return basePrisma.$transaction(async (tx) => {
          await tx.$executeRaw`SET time_zone = '+09:00'`;
          return query(args);
        });
      }
      return query(args);
    },
  },
});

module.exports = prisma;

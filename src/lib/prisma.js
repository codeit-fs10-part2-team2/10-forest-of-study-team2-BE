const { PrismaClient } = require('@prisma/client');
const { now } = require('../utils/dateUtils');

const basePrisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

const prisma = basePrisma.$extends({
  query: {
    $allOperations({ operation, model, args, query }) {
      const currentTime = now().toDate();
      
      if (operation === 'create') {
        if (args.data) {
          if (Array.isArray(args.data)) {
            args.data = args.data.map(item => ({
              ...item,
              createdAt: item.createdAt || currentTime,
              updatedAt: item.updatedAt || currentTime,
            }));
          } else {
            args.data = {
              ...args.data,
              createdAt: args.data.createdAt || currentTime,
              updatedAt: args.data.updatedAt || currentTime,
            };
          }
        }
      }
      
      if (operation === 'update') {
        if (args.data) {
          args.data = {
            ...args.data,
            updatedAt: currentTime,
          };
        }
      }
      
      if (operation === 'createMany') {
        if (args.data && Array.isArray(args.data)) {
          args.data = args.data.map(item => ({
            ...item,
            createdAt: item.createdAt || currentTime,
            updatedAt: item.updatedAt || currentTime,
          }));
        }
      }
      
      if (operation === 'updateMany') {
        if (args.data) {
          args.data = {
            ...args.data,
            updatedAt: currentTime,
          };
        }
      }
      
      return query(args);
    },
  },
});

module.exports = prisma;

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
console.log('Prisma models:', Object.keys(prisma));
prisma.$disconnect();

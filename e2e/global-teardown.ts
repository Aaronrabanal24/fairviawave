import { PrismaClient } from '@prisma/client';

async function globalTeardown() {
  const prisma = new PrismaClient();

  try {
    // Clean up test data
    await prisma.event.deleteMany({
      where: {
        unitId: process.env.PUBLIC_UNIT_ID
      }
    });
    await prisma.unit.deleteMany({
      where: {
        id: process.env.PUBLIC_UNIT_ID
      }
    });
    console.log('Test environment cleanup complete');
  } catch (error) {
    console.error('Failed to clean up test environment:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

export default globalTeardown;
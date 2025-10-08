import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedTestData() {
  // Create a published test unit
  const testUnit = await prisma.unit.create({
    data: {
      id: 'test-unit-published',
      name: 'Test Unit',
      description: 'A test unit for e2e testing',
      status: 'published',
      publishedAt: new Date(),
      events: {
        create: [
          {
            type: 'status_change',
            content: 'Unit published',
            visibility: 'public',
            contentHash: 'hash1',
            chainHash: 'chain1',
            ts: new Date(),
            metadata: {}
          }
        ]
      }
    }
  });

  console.log('Test data seeded:', testUnit);
}

if (process.env.TEST_DB_SEED) {
  seedTestData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
}
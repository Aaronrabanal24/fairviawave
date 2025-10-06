// Simple script to seed demo data
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding demo data...');

  // Create demo unit
  const unit = await prisma.unit.upsert({
    where: { id: 'demo-unit' },
    update: {},
    create: {
      id: 'demo-unit',
      name: 'Demo Unit 001',
      description: '2 bed, 1 bath apartment with modern amenities',
      status: 'published',
      publishedAt: new Date()
    }
  });

  console.log('✅ Created demo unit:', unit.id);

  // Create some sample events
  const events = [
    { type: 'unit_published', content: 'Unit was published and made available' },
    { type: 'badge_installed', content: 'Trust badge was installed and verified' },
  ];

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: `${unit.id}-${event.type}` },
      update: {},
      create: {
        id: `${unit.id}-${event.type}`,
        unitId: unit.id,
        type: event.type,
        content: event.content,
        visibility: 'public',
        contentHash: 'demo',
        chainHash: 'demo'
      }
    });
  }

  console.log('✅ Created demo events');
  console.log('🚀 Demo data seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
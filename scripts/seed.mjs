import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Seed demo unit if it doesn't exist
  const unit = await prisma.unit.upsert({
    where: { id: 'seed-demo' },
    update: {},
    create: {
      id: 'seed-demo',
      name: 'Demo Unit',
      description: 'Seeded demo unit for testing',
      status: 'published',
      publishedAt: new Date()
    }
  })

  // Seed signals with varying timestamps
  const now = new Date()
  const signals = [
    { 
      unitId: 'seed-demo', 
      type: 'view_trust',
      stage: 'view_trust',
      sessionId: 'seed-session-1',
      ipHash: 'seed-ip-1',
      createdAt: new Date(now.getTime() - 25*24*60*60*1000)
    },
    { 
      unitId: 'seed-demo', 
      type: 'tour_request',
      stage: 'tour_request',
      sessionId: 'seed-session-2',
      ipHash: 'seed-ip-1',
      createdAt: new Date(now.getTime() - 20*24*60*60*1000)
    },
    { 
      unitId: 'seed-demo', 
      type: 'tour_request',
      stage: 'tour_request',
      sessionId: 'seed-session-3',
      ipHash: 'seed-ip-2',
      createdAt: new Date(now.getTime() - 15*24*60*60*1000)
    },
    { 
      unitId: 'seed-demo', 
      type: 'application_submit',
      stage: 'application_submit',
      sessionId: 'seed-session-4',
      ipHash: 'seed-ip-2',
      createdAt: new Date(now.getTime() - 10*24*60*60*1000)
    },
    { 
      unitId: 'seed-demo', 
      type: 'lease_signed',
      stage: 'lease_signed',
      sessionId: 'seed-session-5',
      ipHash: 'seed-ip-2',
      createdAt: new Date(now.getTime() - 5*24*60*60*1000)
    },
  ]

  await prisma.signal.createMany({
    data: signals,
    skipDuplicates: true
  })

  console.log('Seeded demo unit and signals')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
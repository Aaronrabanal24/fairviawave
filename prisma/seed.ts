import { PrismaClient } from '@prisma/client'
import { appendEvent } from '../lib/events'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create sample units
  const unit1 = await prisma.unit.create({
    data: {
      name: 'Sample Unit 1',
      description: 'This is a draft unit for testing',
      status: 'draft',
    },
  })

  const unit2 = await prisma.unit.create({
    data: {
      name: 'Sample Unit 2',
      description: 'This is a published unit for testing',
      status: 'published',
      publishedAt: new Date(),
    },
  })

  // Create sample events
  await appendEvent({
    unitId: unit1.id,
    type: 'status_change',
    content: 'Unit created',
    visibility: 'internal',
    actor: 'seed-script',
    client: prisma,
  })

  await appendEvent({
    unitId: unit2.id,
    type: 'status_change',
    content: 'Unit published',
    visibility: 'public',
    actor: 'seed-script',
    client: prisma,
  })

  await appendEvent({
    unitId: unit2.id,
    type: 'comment',
    content: 'This is a public comment on the published unit',
    visibility: 'public',
    actor: 'seed-script',
    client: prisma,
  })

  console.log('Seeding finished.')
  console.log(`Created units: ${unit1.id}, ${unit2.id}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

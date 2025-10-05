// Quick test to verify database connection
// Run with: node test-db.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('Testing database connection...')

  try {
    const units = await prisma.unit.findMany()
    console.log('✅ Database connection successful!')
    console.log(`Found ${units.length} units`)

    if (units.length === 0) {
      console.log('\n💡 Database is empty. You can seed it with: npx prisma db seed')
    }
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

main()

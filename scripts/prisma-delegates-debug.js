// Utility script to print available Prisma client delegates at runtime.
// Usage: node scripts/prisma-delegates-debug.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

;(async () => {
  try {
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$'))
    console.log('Prisma delegates:', keys)
    if (!keys.includes('signal')) {
      console.warn('[WARN] signal delegate not present. Regenerate with: npx prisma generate')
    }
    await prisma.$disconnect()
  } catch (e) {
    console.error('Error inspecting delegates:', e)
    process.exitCode = 1
  }
})()

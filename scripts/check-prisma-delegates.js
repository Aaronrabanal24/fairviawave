#!/usr/bin/env node
/**
 * CI guard: ensure required Prisma model delegates exist.
 * Fails process if any are missing.
 */
const { PrismaClient } = require('@prisma/client')
const required = ['unit','event','signal']
async function main() {
  const prisma = new PrismaClient()
  try {
    const keys = Object.keys(prisma).filter(k => !k.startsWith('$'))
    const missing = required.filter(r => !keys.includes(r))
    console.log('Delegates present:', keys)
    if (missing.length) {
      console.error('Missing delegates:', missing)
      process.exit(1)
    }
  } finally {
    await prisma.$disconnect()
  }
}
main().catch(e => { console.error(e); process.exit(1) })

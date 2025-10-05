import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    // Quick DB health check
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'fairvia-wave1',
      region: process.env.VERCEL_REGION,
    })
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        status: 'unhealthy',
        error: 'Database connection failed',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

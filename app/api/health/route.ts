import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  try {
    // Quick DB health check
    await prisma.$queryRaw`SELECT 1`

    return NextResponse.json({
      ok: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'fairvia-wave1',
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

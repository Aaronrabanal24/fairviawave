import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/units/:id/timeline/internal - Internal timeline (requires API key)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check for internal API key
    const apiKey = request.headers.get('x-internal-api-key')
    if (apiKey !== process.env.INTERNAL_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const url = new URL(request.url)

    // Add pagination support
    const rawPage = parseInt(url.searchParams.get('page') || '1', 10)
    const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage)
    const rawPageSize = parseInt(url.searchParams.get('page_size') || '100', 10)
    const pageSize = Number.isNaN(rawPageSize)
      ? 100
      : Math.min(1000, Math.max(1, rawPageSize))
    const skip = (page - 1) * pageSize

    const [unit, events, totalEvents] = await Promise.all([
      prisma.unit.findUnique({
        where: { id },
      }),
      prisma.event.findMany({
        where: { unitId: id },
        orderBy: [
          { ts: 'asc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.event.count({ where: { unitId: id } }),
    ])

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Return full internal data with pagination
    return NextResponse.json({
      unit,
      events,
      pagination: {
        page,
        pageSize,
        totalEvents,
        totalPages: Math.max(1, Math.ceil(totalEvents / pageSize)),
      },
    })
  } catch (error) {
    console.error('Error fetching internal timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

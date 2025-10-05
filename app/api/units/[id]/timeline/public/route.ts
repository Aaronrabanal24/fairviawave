import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimit'
import { toPublicEvent } from '@/lib/publicSerializer'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

// GET /api/units/:id/timeline/public - Public timeline (PII-safe)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const url = new URL(request.url)
    const searchParams = url.searchParams
    const headerIp =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'anon'
    const ip = headerIp.split(',')[0].trim() || 'anon'

    if (!rateLimit(`pub:${ip}`, 600)) {
      return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 })
    }

    const rawPage = parseInt(searchParams.get('page') || '1', 10)
    const page = Number.isNaN(rawPage) ? 1 : Math.max(1, rawPage)
    const rawPageSize = parseInt(searchParams.get('page_size') || '20', 10)
    const pageSize = Number.isNaN(rawPageSize)
      ? 20
      : Math.min(50, Math.max(1, rawPageSize))
    const skip = (page - 1) * pageSize

    const unit = await prisma.unit.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        publishedAt: true,
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    if (unit.status !== 'published') {
      return NextResponse.json({ error: 'Unit not published' }, { status: 403 })
    }

    // Optional: increment daily public views (guarded)
    try {
      await prisma.$executeRaw`INSERT INTO public.public_views_daily ("unitId", day, count)
        VALUES (${id}, CURRENT_DATE, 1)
        ON CONFLICT ("unitId", day) DO UPDATE SET count = public.public_views_daily.count + 1`
    } catch (e) {
      // table may not exist; ignore
    }

    const [events, totalEvents] = await Promise.all([
      prisma.event.findMany({
        where: { unitId: id, visibility: 'public' },
        orderBy: [
          { ts: 'asc' },
          { createdAt: 'asc' },
        ],
        skip,
        take: pageSize,
        select: {
          id: true,
          type: true,
          content: true,
          metadata: true,
          createdAt: true,
          ts: true,
        },
      }),
      prisma.event.count({ where: { unitId: id, visibility: 'public' } }),
    ])

    // Return only PII-safe fields
    return NextResponse.json({
      id: unit.id,
      name: unit.name,
      description: unit.description,
      publishedAt: unit.publishedAt,
      events: events.map((event) =>
        toPublicEvent({
          id: event.id,
          type: event.type,
          content: event.content,
          metadata: event.metadata as any,
          createdAt: event.createdAt,
          ts: event.ts,
        })
      ),
      pagination: {
        page,
        pageSize,
        totalEvents,
        totalPages: Math.max(1, Math.ceil(totalEvents / pageSize)),
      },
    })
  } catch (error) {
    console.error('Error fetching public timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

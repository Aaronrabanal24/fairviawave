import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/units/:id/timeline/public - Public timeline (PII-safe)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        events: {
          where: { visibility: 'public' },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            type: true,
            content: true,
            createdAt: true,
            // Exclude internal fields and PII
          },
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    if (unit.status !== 'published') {
      return NextResponse.json({ error: 'Unit not published' }, { status: 403 })
    }

    // Return only PII-safe fields
    return NextResponse.json({
      id: unit.id,
      name: unit.name,
      description: unit.description,
      publishedAt: unit.publishedAt,
      events: unit.events.map((event) => ({
        id: event.id,
        type: event.type,
        content: event.content,
        timestamp: event.createdAt,
      })),
    })
  } catch (error) {
    console.error('Error fetching public timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

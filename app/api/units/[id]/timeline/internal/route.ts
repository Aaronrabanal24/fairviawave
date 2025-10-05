import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

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

    const unit = await prisma.unit.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: [
            { ts: 'asc' },
            { createdAt: 'asc' },
          ],
        },
      },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Return full internal data
    return NextResponse.json({
      unit,
      events: unit.events,
    })
  } catch (error) {
    console.error('Error fetching internal timeline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline' },
      { status: 500 }
    )
  }
}

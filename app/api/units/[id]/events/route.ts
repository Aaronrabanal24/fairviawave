import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { appendEvent } from '@/lib/events'
import { prisma } from '@/lib/db'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/units/:id/events - Add event to unit (requires auth)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Auth check
  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const { id } = params
    const body = await request.json()
    const { type, content, visibility = 'internal', metadata, ts } = body

    if (!type || !content) {
      return NextResponse.json(
        { error: 'Type and content are required' },
        { status: 400 }
      )
    }

    const unit = await prisma.unit.findUnique({
      where: { id },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const actor = user.email ?? user.id
    let eventTs: Date | undefined
    if (ts) {
      const parsed = new Date(ts)
      if (!Number.isNaN(parsed.getTime())) {
        eventTs = parsed
      }
    }

    const event = await appendEvent({
      unitId: id,
      type,
      content,
      visibility,
      metadata: metadata ?? null,
      actor,
      ts: eventTs,
    })

    return NextResponse.json(event, { status: 201 })
  } catch (error) {
    console.error('Error creating event:', error)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}

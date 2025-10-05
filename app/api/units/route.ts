import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import { appendEvent } from '@/lib/events'
import { prisma } from '@/lib/db'

// GET /api/units - List all units
export async function GET() {
  try {
    const units = await prisma.unit.findMany({
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(units)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch units' }, { status: 500 })
  }
}

// POST /api/units - Create a new unit (requires auth)
export async function POST(request: Request) {
  // Auth check
  const supabase = createSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const actor = user.email ?? user.id
    const unit = await prisma.unit.create({
      data: {
        name,
        description,
        status: 'draft',
      },
    })

    // Create initial event with chain integrity
    await appendEvent({
      unitId: unit.id,
      type: 'status_change',
      content: 'Unit created',
      visibility: 'internal',
      actor,
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}

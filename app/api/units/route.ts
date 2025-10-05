import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { createSupabaseServer } from '@/lib/supabase/server'

const prisma = new PrismaClient()

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

    const unit = await prisma.unit.create({
      data: {
        name,
        description,
        status: 'draft',
      },
    })

    // Create initial event
    await prisma.event.create({
      data: {
        unitId: unit.id,
        type: 'status_change',
        content: 'Unit created',
        visibility: 'internal',
      },
    })

    return NextResponse.json(unit, { status: 201 })
  } catch (error) {
    console.error('Error creating unit:', error)
    return NextResponse.json({ error: 'Failed to create unit' }, { status: 500 })
  }
}

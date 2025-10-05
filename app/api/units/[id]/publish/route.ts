import { NextResponse } from 'next/server'
import { createSupabaseServer } from '@/lib/supabase/server'
import QRCode from 'qrcode'
import { appendEvent } from '@/lib/events'
import { prisma } from '@/lib/db'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

// POST /api/units/:id/publish - Publish a unit (requires auth)
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

    const unit = await prisma.unit.findUnique({
      where: { id },
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    // Update unit to published
    const updatedUnit = await prisma.unit.update({
      where: { id },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    })

    // Create publish event
    const actor = user.email ?? user.id
    await appendEvent({
      unitId: id,
      type: 'status_change',
      content: 'Unit published',
      visibility: 'public',
      actor,
    })

    // Generate public URL
    const baseUrl = process.env.PUBLIC_BASE_URL || 'http://localhost:3000'
    const publicUrl = `${baseUrl}/api/units/${id}/timeline/public`

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(publicUrl)

    return NextResponse.json({
      unit: updatedUnit,
      publicUrl,
      qrDataUrl,
    })
  } catch (error) {
    console.error('Error publishing unit:', error)
    return NextResponse.json({ error: 'Failed to publish unit' }, { status: 500 })
  }
}

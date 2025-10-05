import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { chainHash, eventContentHash } from '@/lib/hash'

type Mismatch = {
  id: string
  want: string
  got: string
  at: string
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const unitId = params.id

  const events = await prisma.event.findMany({
    where: { unitId },
    orderBy: [
      { ts: 'asc' },
      { createdAt: 'asc' },
    ],
    select: {
      id: true,
      unitId: true,
      type: true,
      actor: true,
      ts: true,
      metadata: true,
      contentHash: true,
      chainHash: true,
    },
  })

  let prev: string | null = null
  const mismatches: Mismatch[] = []

  for (const event of events) {
    const wantContent = eventContentHash({
      unitId: event.unitId,
      type: event.type,
      actor: event.actor,
      ts: event.ts.toISOString(),
      metadata: event.metadata as any,
    })

    const wantChain = chainHash(prev, wantContent)

    if (wantContent !== event.contentHash || wantChain !== event.chainHash) {
      mismatches.push({
        id: event.id,
        want: wantChain,
        got: event.chainHash,
        at: event.ts.toISOString(),
      })
    }

    prev = event.chainHash
  }

  return NextResponse.json({
    ok: mismatches.length === 0,
    count: events.length,
    mismatches,
  })
}

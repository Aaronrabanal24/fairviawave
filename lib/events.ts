import type { Prisma, Event } from '@prisma/client'
import { prisma } from '@/lib/db'
import { chainHash, eventContentHash, type Json } from '@/lib/hash'

export type AppendEventInput = {
  unitId: string
  type: string
  content?: string | null
  metadata?: Prisma.JsonValue | null
  visibility?: 'public' | 'internal'
  actor?: string | null
  ts?: Date
  client?: Prisma.TransactionClient | typeof prisma
}

export async function appendEvent({
  unitId,
  type,
  content = null,
  metadata = null,
  visibility = 'internal',
  actor = null,
  ts = new Date(),
  client = prisma,
}: AppendEventInput): Promise<Event> {
  const previous = await client.event.findFirst({
    where: { unitId },
    orderBy: [
      { ts: 'desc' },
      { createdAt: 'desc' },
    ],
    select: {
      chainHash: true,
    },
  })

  const tsIso = ts.toISOString()
  const contentHash = eventContentHash({
    unitId,
    type,
    actor,
    ts: tsIso,
    metadata: (metadata ?? undefined) as Json | undefined,
  })
  const chainHashValue = chainHash(previous?.chainHash ?? null, contentHash)

  return client.event.create({
    data: {
      unitId,
      type,
      content,
      metadata: (metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      visibility,
      actor,
      ts,
      contentHash,
      chainHash: chainHashValue,
    },
  })
}

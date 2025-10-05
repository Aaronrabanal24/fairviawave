import { createHash } from 'crypto'

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

export type EventHashInput = {
  unitId: string
  type: string
  actor: string | null | undefined
  ts: string
  metadata: Json | undefined
}

function canonicalize(value: Json): Json {
  if (value === null || typeof value !== 'object') {
    return value
  }

  if (Array.isArray(value)) {
    return value.map((item) => canonicalize(item))
  }

  const entries = Object.entries(value)
    .filter(([, v]) => v !== undefined)
    .map(([key, val]) => [key, canonicalize(val as Json)] as const)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))

  return entries.reduce<Record<string, Json>>((acc, [key, val]) => {
    acc[key] = val
    return acc
  }, {})
}

function hashPayload(payload: unknown): string {
  return createHash('sha256').update(JSON.stringify(payload)).digest('hex')
}

export function eventContentHash(input: EventHashInput): string {
  const canonical = {
    unitId: input.unitId,
    type: input.type,
    actor: input.actor ?? null,
    ts: input.ts,
    metadata: canonicalize((input.metadata ?? null) as Json),
  }
  return hashPayload(canonical)
}

export function chainHash(previous: string | null, contentHash: string): string {
  return hashPayload({ previous: previous ?? null, contentHash })
}

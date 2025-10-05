const EMAIL_REGEX = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i
const PHONE_REGEX = /\b(?:\+?1[-.\s]?)?(?:\(\d{3}\)|\d{3})[-.\s]?\d{3}[-.\s]?\d{4}\b/

type Metadata = Record<string, unknown> | null | undefined

type PublicEventInput = {
  id: string
  type: string
  createdAt: Date
  ts?: Date | null
  content?: string | null
  metadata?: Metadata
}

type PublicEventOutput = {
  id: string
  type: string
  timestamp: string
  content?: string
  metadata: Record<string, unknown>
}

function stripPII(value: unknown): boolean {
  if (typeof value !== 'string') return false
  return EMAIL_REGEX.test(value) || PHONE_REGEX.test(value)
}

function pickAllowList(metadata: Metadata, allowList: string[]): Record<string, unknown> {
  const output: Record<string, unknown> = {}
  if (!metadata || typeof metadata !== 'object') return output

  for (const key of allowList) {
    if (Object.prototype.hasOwnProperty.call(metadata, key)) {
      const val = (metadata as Record<string, unknown>)[key]
      if (!stripPII(val)) {
        output[key] = val as unknown
      }
    }
  }
  return output
}

function sanitizeMetadata(type: string, metadata: Metadata): Record<string, unknown> {
  switch (type) {
    case 'inquiry_received':
      return pickAllowList(metadata, ['source', 'campaign', 'channel'])
    case 'note_added':
      return pickAllowList(metadata, ['public'])
    default: {
      if (!metadata || typeof metadata !== 'object') return {}
      const entries = Object.entries(metadata)
        .filter(([, value]) => !stripPII(value))
        .map(([key, value]) => [key, value] as const)

      return Object.fromEntries(entries)
    }
  }
}

function sanitizeContent(type: string, content?: string | null): string | undefined {
  if (!content) return undefined
  if (stripPII(content)) {
    return undefined
  }
  if (type === 'note_added') {
    return undefined
  }
  return content
}

export function toPublicEvent(event: PublicEventInput): PublicEventOutput {
  const metadata = sanitizeMetadata(event.type, event.metadata)
  const content = sanitizeContent(event.type, event.content)
  const timestamp = (event.ts ?? event.createdAt).toISOString()

  return {
    id: event.id,
    type: event.type,
    timestamp,
    ...(content ? { content } : {}),
    metadata,
  }
}

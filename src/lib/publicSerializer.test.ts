import { describe, expect, it } from 'vitest'
import { toPublicEvent } from './publicSerializer'

describe('public serializer', () => {
  const baseEvent = {
    id: 'e1',
    type: 'inquiry_received',
    createdAt: new Date('2023-01-01T00:00:00Z'),
    ts: new Date('2023-01-01T00:00:00Z'),
    metadata: {
      email: 'leak@example.com',
      phone: '555-123-4567',
      source: 'Zillow',
    },
  }

  it('only exposes allow-listed fields for inquiry_received', () => {
    const out = toPublicEvent(baseEvent as any)
    expect(out.metadata).toEqual({ source: 'Zillow' })
    expect(JSON.stringify(out)).not.toMatch(/leak@example\.com/i)
    expect(JSON.stringify(out)).not.toMatch(/555[- ]?123[- ]?4567/)
  })

  it('note_added never shows freeform text', () => {
    const out = toPublicEvent({
      ...baseEvent,
      type: 'note_added',
      metadata: { text: 'private', public: false },
      content: 'private',
    } as any)
    expect(out.metadata).toEqual({ public: false })
    expect(JSON.stringify(out)).not.toMatch(/private/)
  })
})

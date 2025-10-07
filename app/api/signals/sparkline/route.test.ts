import { describe, test, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

vi.mock('@/lib/prisma', () => ({
  prisma: {
    unit: {
      findUnique: vi.fn()
    },
    $queryRaw: vi.fn()
  }
}))

describe('sparkline route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('returns 400 if no unitId', async () => {
    const req = new NextRequest('http://localhost/api/signals/sparkline')
    const res = await GET(req)
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.error).toBe('unitId required')
  })

  test('returns 404 if unit not found', async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue(null)
    const req = new NextRequest('http://localhost/api/signals/sparkline?unitId=missing')
    const res = await GET(req)
    expect(res.status).toBe(404)
  })

  test('returns 403 if unit not published', async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({ id: 'u1', status: 'draft' } as any)
    const req = new NextRequest('http://localhost/api/signals/sparkline?unitId=u1')
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  test('returns points and applies weights for published unit', async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({ id: 'seed-demo', status: 'published' } as any)

    // Return two days of scores
    const rows = [
      { day: new Date('2025-09-30T00:00:00Z'), score: 6 },
      { day: new Date('2025-10-01T00:00:00Z'), score: 9 }
    ]
    vi.mocked(prisma.$queryRaw).mockResolvedValue(rows)

    const req = new NextRequest('http://localhost/api/signals/sparkline?unitId=seed-demo&days=30')
    const res = await GET(req)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveProperty('points')
    expect(Array.isArray(body.points)).toBe(true)
    expect(body.points).toEqual([
      { dayISO: new Date('2025-09-30T00:00:00Z').toISOString(), score: 6 },
      { dayISO: new Date('2025-10-01T00:00:00Z').toISOString(), score: 9 }
    ])
    expect(body).toHaveProperty('lastUpdatedISO')
  })
})
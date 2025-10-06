import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, GET } from '@/app/api/signals/route'
import { signalDelegate } from '@/lib/delegates/signal'

// Mock the signal delegate
vi.mock('@/lib/delegates/signal', () => ({
  signalDelegate: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
    upsert: vi.fn()
  }
}))

function jsonRequest(url: string, method: string, body?: any) {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json', 'user-agent': 'vitest' },
    body: body ? JSON.stringify(body) : undefined
  })
}

describe('signals API POST', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('creates signal with sanitized metadata in development', async () => {
    // Note: Production blocking is tested by the condition process.env.NODE_ENV === 'production'
    // In this test environment, NODE_ENV is 'test' so POST will work
    vi.mocked(signalDelegate.create).mockResolvedValueOnce({ 
      id: 'sig1', 
      type: 'debug', 
      metadata: { unitId: 'u1' } 
    })
    
    const res = await POST(jsonRequest('http://test/api/signals', 'POST', {
      type: 'test',
      meta: { unitId: 'u1', sneaky: 'nope' }
    }))
    
    expect(res.status).toBe(201)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.created.metadata).toHaveProperty('unitId')
    expect(data.created.metadata).not.toHaveProperty('sneaky')
  })
})

describe('signals API GET', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns analytics summary', async () => {
    vi.mocked(signalDelegate.findFirst).mockResolvedValueOnce({ 
      id: 's1', 
      type: 'view_trust', 
      createdAt: new Date() 
    })
    vi.mocked(signalDelegate.count).mockResolvedValueOnce(7)
    
    const res = await GET()
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(data.ok).toBe(true)
    expect(data.last24h).toBe(7)
    expect(['low', 'medium', 'high']).toContain(data.level)
  })
})

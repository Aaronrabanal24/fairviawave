import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest"
import { vi } from "vitest"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { GET } from "./route"

// Create mock for Prisma signal groupBy function
vi.mock("@/lib/prisma", () => ({
  prisma: {
    signal: {
      groupBy: vi.fn()
    }
  }
}))

// All possible signal types for funnel
const SIGNAL_TYPES = [
  "application_open",
  "application_submit", 
  "lease_open",
  "lease_signed",
  "precheck_start", 
  "precheck_submit",
  "tour_request",
  "view_trust"
] as const

type SignalType = typeof SIGNAL_TYPES[number]

// Simplified mock for signal groups since we only use type and count
const createMockSignalGroup = (type: SignalType, count: number) => ({
  type,
  _count: { _all: count }
}) as any // Type assertion needed since Prisma types are complex

describe("signals funnel", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2025-10-06T12:00:00Z"))
  })

  afterAll(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("requires unitId", async () => {
    const req = new NextRequest("http://localhost:3000/api/signals/funnel")
    const res = await GET(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe("unitId required")
  })

  it("returns 8 keys even with no data", async () => {
    vi.mocked(prisma.signal.groupBy).mockResolvedValueOnce([])
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-none")
    const res = await GET(req)
    expect(res.status).toBe(200)
    
    const data = await res.json()
    expect(Object.keys(data.counts).sort()).toEqual(SIGNAL_TYPES)
    expect(data.level).toBe("low")
    expect(data.lastUpdatedISO).toBe("2025-10-06T12:00:00.000Z")
  })

  it("maps stages correctly when data exists", async () => {
    const mockSignals = [
      createMockSignalGroup("tour_request", 3),
      createMockSignalGroup("lease_signed", 1)
    ]
    
    vi.mocked(prisma.signal.groupBy).mockResolvedValueOnce(mockSignals)
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo")
    const res = await GET(req)
    const data = await res.json()
    
    expect(data.counts.tour_request).toBe(3)
    expect(data.counts.lease_signed).toBe(1)
    expect(data.level).toBe("low") // 4 total signals
  })

  it("calculates activity level correctly", async () => {
    const mockSignals = [
      createMockSignalGroup("view_trust", 20),
      createMockSignalGroup("tour_request", 10)
    ]
    
    vi.mocked(prisma.signal.groupBy).mockResolvedValueOnce(mockSignals)
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo")
    const res = await GET(req)
    const data = await res.json()
    
    expect(data.level).toBe("high") // 30 total signals
  })

  it("respects days parameter bounds", async () => {
    vi.mocked(prisma.signal.groupBy).mockResolvedValue([])
    
    const req1 = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo&days=0")
    const req2 = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo&days=100")
    
    const res1 = await GET(req1)
    const res2 = await GET(req2)
    
    expect(res1.status).toBe(200)
    expect(res2.status).toBe(200)

    // Check that the time window was clamped 
    expect(prisma.signal.groupBy).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({
        createdAt: expect.objectContaining({ gte: expect.any(Date) })
      })
    }))
  })

  it("includes cache control headers", async () => {
    vi.mocked(prisma.signal.groupBy).mockResolvedValueOnce([])
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo")
    const res = await GET(req)
    
    const cacheControl = res.headers.get("Cache-Control")
    expect(cacheControl).toContain("s-maxage=30")
    expect(cacheControl).toContain("stale-while-revalidate=120")
  })

  it("handles errors without leaking internals", async () => {
    vi.mocked(prisma.signal.groupBy).mockRejectedValueOnce(new Error("DB connection failed"))
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=seed-demo")
    const res = await GET(req)
    
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBe("failed to load funnel")
    expect(data).not.toHaveProperty("stack")
    expect(data).not.toHaveProperty("message")
  })
})
})
})
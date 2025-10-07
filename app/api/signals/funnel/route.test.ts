import { describe, test, expect, vi, beforeEach } from "vitest"
import { GET } from "./route"
import { NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Mock Prisma client
vi.mock("@/lib/prisma", () => ({
  prisma: {
    unit: {
      findUnique: vi.fn()
    },
    event: {
      findMany: vi.fn()
    }
  }
}))

describe("funnel", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })
  
  test("returns 400 if no unitId", async () => {
    const req = new NextRequest("http://localhost:3000/api/signals/funnel")
    const res = await GET(req)
    expect(res.status).toBe(400)
  })

  test("returns 404 if unit not found", async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue(null)
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=test-unit")
    const res = await GET(req)
    expect(res.status).toBe(404)
  })
  
  test("returns 403 if unit not published", async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: "test-unit",
      name: "Test Unit",
      description: null,
      status: "draft",
      publishedAt: null,
      createdAt: new Date(),
      updatedAt: new Date()
    })
    
    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=test-unit")
    const res = await GET(req)
    expect(res.status).toBe(403)
  })

  test("returns funnel counts for published unit", async () => {
    vi.mocked(prisma.unit.findUnique).mockResolvedValue({
      id: "test-unit",
      name: "Test Unit", 
      description: null,
      status: "published",
      publishedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    })

    vi.mocked(prisma.event.findMany).mockResolvedValue([
      { 
        id: "1", 
        unitId: "test-unit", 
        type: "view_trust",
        content: null,
        metadata: {},
        visibility: "public",
        actor: null,
        ts: new Date(),
        contentHash: "hash1",
        chainHash: "chain1",
        createdAt: new Date()
      },
      { 
        id: "2", 
        unitId: "test-unit", 
        type: "precheck_start",
        content: null,
        metadata: {},
        visibility: "public",
        actor: null,
        ts: new Date(),
        contentHash: "hash2",
        chainHash: "chain2",
        createdAt: new Date()
      },
      { 
        id: "3", 
        unitId: "test-unit", 
        type: "application_submit",
        content: null,
        metadata: {},
        visibility: "public",
        actor: null,
        ts: new Date(),
        contentHash: "hash3",
        chainHash: "chain3",
        createdAt: new Date()
      }
    ])

    const req = new NextRequest("http://localhost:3000/api/signals/funnel?unitId=test-unit")
    const res = await GET(req)
    const json = await res.json()

    expect(res.status).toBe(200)
    expect(json.counts).toEqual({
      view_trust: 1,
      precheck_start: 1, 
      precheck_submit: 0,
      tour_request: 0,
      application_open: 0,
      application_submit: 1,
      lease_open: 0,
      lease_signed: 0
    })
  })
})
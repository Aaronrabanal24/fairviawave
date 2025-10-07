import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import type { FunnelResponse } from "@/types/funnel"

const STAGES = [
  "view_trust","precheck_start","precheck_submit","tour_request",
  "application_open","application_submit","lease_open","lease_signed",
] as const
type Stage = typeof STAGES[number]

const EMPTY: Record<Stage, number> = {
  view_trust: 0, precheck_start: 0, precheck_submit: 0, tour_request: 0,
  application_open: 0, application_submit: 0, lease_open: 0, lease_signed: 0,
}

function toLevel(total: number): "low"|"medium"|"high" {
  if (total >= 25) return "high"
  if (total >= 8)  return "medium"
  return "low"
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const unitId = url.searchParams.get("unitId")
    if (!unitId) {
      return NextResponse.json({ error: "unitId required" }, { status: 400 })
    }
    
    const days = Math.max(1, Math.min(90, Number(url.searchParams.get("days") ?? 30)))

    // Single grouped query using indexed fields
    const since = new Date(Date.now() - days*24*60*60*1000)
    const grouped = await prisma.signal.groupBy({
      by: ["type"],
      _count: { 
        _all: true 
      },
      // RLS safe - no PII exposed, just counts
      // indexed fields for efficiency (unitId, createdAt)
      where: { 
        unitId, 
        createdAt: { gte: since }
      }
    })

    const counts = { ...EMPTY }
    for (const row of grouped) {
      const k = row.type as Stage
      if (STAGES.includes(k) && row._count) {
        counts[k] = typeof row._count === 'boolean' ? 0 : (row._count._all ?? 0)
      }
    }
    
    const total = Object.values(counts).reduce((a,b)=>a+b,0)
    const level = toLevel(total)
    const body: FunnelResponse = { 
      counts, 
      level, 
      lastUpdatedISO: new Date().toISOString() 
    }

    const res = NextResponse.json(body, { status: 200 })
    // Cache hints for public Owner Dashboard fetches
    res.headers.set("Cache-Control", "s-maxage=30, stale-while-revalidate=120")
    return res
  } catch (err) {
    // Never leak internals
    return NextResponse.json({ error: "failed to load funnel" }, { status: 500 })
  }
}
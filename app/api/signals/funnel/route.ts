import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export type FunnelResponse = {
  counts: {
    view_trust: number
    precheck_start: number
    precheck_submit: number
    tour_request: number
    application_open: number
    application_submit: number
    lease_open: number
    lease_signed: number
  }
  level: "low" | "medium" | "high"
  lastUpdatedISO: string
}

const STAGES = [
  "view_trust", "precheck_start", "precheck_submit", "tour_request",
  "application_open", "application_submit", "lease_open", "lease_signed"
] as const
type Stage = typeof STAGES[number]

const EMPTY: Record<Stage, number> = {
  view_trust: 0, precheck_start: 0, precheck_submit: 0, tour_request: 0,
  application_open: 0, application_submit: 0, lease_open: 0, lease_signed: 0
}

function toLevel(total: number): "low"|"medium"|"high" {
  if (total >= 25) return "high"
  if (total >= 8) return "medium"
  return "low"
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const unitId = url.searchParams.get("unitId")
    if (!unitId) {
      return NextResponse.json({ error: "unitId required" }, { status: 400 })
    }

    // Check unit exists and is published
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true, status: true }
    })

    if (!unit) {
      return NextResponse.json({ error: "unit not found" }, { status: 404 })
    }

    if (unit.status !== "published") {
      return NextResponse.json({ error: "unit not published" }, { status: 403 })
    }

    // Get events since the cutoff date
    const days = Math.max(1, Math.min(90, Number(url.searchParams.get("days") ?? 30)))
    const cutoff = new Date(Date.now() - days*24*60*60*1000)
    
    const events = await prisma.event.findMany({
      where: {
        unitId,
        createdAt: { gte: cutoff },
        type: { in: [...STAGES] }, // Convert readonly array to mutable
        visibility: "public"
      },
      select: { type: true }
    })

    // Count events by type 
    const counts = { ...EMPTY }
    for (const event of events) {
      const type = event.type as Stage
      counts[type]++
    }

    const total = events.length
    const level = toLevel(total)

    const response: FunnelResponse = {
      counts,
      level,
      lastUpdatedISO: new Date().toISOString()
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, max-age=30, stale-while-revalidate=60"
      }
    })
  } catch (err) {
    console.error("Funnel error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

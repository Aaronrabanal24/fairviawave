import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const runtime = "nodejs";       // ensure Node runtime (not Edge)
export const dynamic = "force-dynamic"; // always compute
export const revalidate = 0;           // no static cache for this API

const W: Record<string, number> = {
  view_trust: 1, 
  precheck_start: 2, 
  precheck_submit: 2,
  tour_request: 3, 
  application_open: 3, 
  application_submit: 4,
  lease_open: 4, 
  lease_signed: 5
}

export type SparklineResponse = {
  points: Array<{
    dayISO: string
    score: number
  }>
  lastUpdatedISO: string
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const unitId = url.searchParams.get("unitId")
    if (!unitId) {
      return NextResponse.json({ error: "unitId required" }, { status: 400 })
    }

    // Verify unit exists and is published
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

    const days = Math.max(1, Math.min(90, Number(url.searchParams.get("days") ?? 30)))
    const since = new Date(Date.now() - days*24*60*60*1000)

    const rows = await prisma.$queryRaw<{day: Date, score: number}[]>`
      SELECT date_trunc('day',"createdAt") AS day,
             SUM(CASE "stage"
               WHEN 'view_trust' THEN 1
               WHEN 'precheck_start' THEN 2
               WHEN 'precheck_submit' THEN 2
               WHEN 'tour_request' THEN 3
               WHEN 'application_open' THEN 3
               WHEN 'application_submit' THEN 4
               WHEN 'lease_open' THEN 4
               WHEN 'lease_signed' THEN 5
               ELSE 0 END) AS score
      FROM "Signal"
      WHERE "unitId" = ${unitId} AND "createdAt" >= ${since}
      GROUP BY 1 ORDER BY 1;
    `

    const points = rows.map(r => ({ 
      dayISO: r.day.toISOString(), 
      score: Number(r.score) 
    }))

    const response: SparklineResponse = {
      points,
      lastUpdatedISO: new Date().toISOString()
    }

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "s-maxage=60, stale-while-revalidate=300"
      }
    })
  } catch (err) {
    console.error("Sparkline error:", err)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
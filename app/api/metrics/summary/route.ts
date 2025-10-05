import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // One-shot summary query optimized for performance
    const rows = await prisma.$queryRaw<any[]>`
      WITH
        published_units AS (
          SELECT id
          FROM units
          WHERE status = 'published'
            AND ("publishedAt" IS NOT NULL)
        ),
        events_per_unit AS (
          SELECT "unitId", count(*)::int AS event_count
          FROM events
          GROUP BY "unitId"
        ),
        most_active AS (
          SELECT e."unitId" AS unit_id, count(e.id)::int AS events
          FROM events e
          GROUP BY e."unitId"
          ORDER BY events DESC
          LIMIT 1
        )
      SELECT
        (SELECT count(*)::int FROM units) AS total_units,
        (SELECT count(*)::int FROM published_units) AS published_units,
        (SELECT count(*)::int FROM units WHERE "createdAt" >= now() - interval '7 days') AS units_last_7d,
        (SELECT count(*)::int FROM units WHERE "createdAt" >= now() - interval '1 day') AS units_last_24h,

        (SELECT count(*)::int FROM events) AS total_events,
        (SELECT count(*)::int FROM events e
          WHERE e.visibility = 'public'
            AND EXISTS (SELECT 1 FROM published_units pu WHERE pu.id = e."unitId")) AS public_events,
        (SELECT count(*)::int FROM events WHERE "createdAt" >= now() - interval '7 days') AS events_last_7d,
        (SELECT count(*)::int FROM events WHERE "createdAt" >= now() - interval '1 day') AS events_last_24h,

        COALESCE((SELECT avg(event_count)::numeric(10,2) FROM events_per_unit), 0.00) AS avg_events_per_unit,

        (SELECT unit_id FROM most_active) AS most_active_unit_id,
        (SELECT events FROM most_active) AS most_active_unit_events
    `

    const s = rows[0]

    return NextResponse.json({
      ...s,
      published_rate: Number(s.total_units) > 0
        ? Number(s.published_units) / Number(s.total_units)
        : 0,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

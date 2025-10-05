import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Keep Prisma on Node, no prerender, and run near the DB
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET() {
  try {
    const rows = await prisma.$queryRaw<any[]>/* sql */`
      with
        pu as (
          select id
          from public.units
          where "publishedToken" is not null
            and ("publishedExpiry" is null or "publishedExpiry" > now())
        ),
        epu as (
          select "unitId", count(*)::int as c
          from public.events
          group by "unitId"
        ),
        ma as (
          select e."unitId" as unit_id, count(*)::int as events
          from public.events e
          group by e."unitId"
          order by events desc
          limit 1
        )
      select
        (select count(*)::int from public.units) as total_units,
        (select count(*)::int from pu) as published_units,
        (select count(*)::int from public.units where "createdAt" >= now() - interval '7 days') as units_last_7d,
        (select count(*)::int from public.units where "createdAt" >= now() - interval '1 day') as units_last_24h,
        (select count(*)::int from public.events) as total_events,
        (select count(*)::int from public.events e where exists (select 1 from pu where pu.id = e."unitId")) as public_events,
        (select count(*)::int from public.events where "createdAt" >= now() - interval '7 days') as events_last_7d,
        (select count(*)::int from public.events where "createdAt" >= now() - interval '1 day') as events_last_24h,
        coalesce((select avg(c)::numeric(10,2) from epu), 0.00) as avg_events_per_unit,
        (select unit_id from ma) as most_active_unit_id,
        (select events from ma) as most_active_unit_events
    `

    const s = rows[0]

    return NextResponse.json({
      ...s,
      published_rate: Number(s.total_units)
        ? Number(s.published_units) / Number(s.total_units)
        : 0,
    })
  } catch (error) {
    console.error('Error fetching metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    )
  }
}

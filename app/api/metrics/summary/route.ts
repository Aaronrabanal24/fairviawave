import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// Keep Prisma on Node, near the DB
export const runtime = "nodejs";
export const preferredRegion = ["sfo1"];
export const dynamic = "force-dynamic";
export const revalidate = 0;

// tiny helper to coerce null/undefined to 0
const n = (v: unknown) => Number.isFinite(Number(v)) ? Number(v) : 0;

export async function GET() {
  try {
    // Be defensive against slow/locked reads on shared DBs
    await prisma.$executeRawUnsafe(`set local statement_timeout = 1500`); // ms
    await prisma.$executeRawUnsafe(`set local lock_timeout = 1000`);

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
        (select count(*)::int from public.units  where "createdAt" >= now() - interval '7 days') as units_last_7d,
        (select count(*)::int from public.units  where "createdAt" >= now() - interval '1 day')  as units_last_24h,
        (select count(*)::int from public.events) as total_events,
        (select count(*)::int from public.events e where exists (select 1 from pu where pu.id = e."unitId")) as public_events,
        (select count(*)::int from public.events  where "createdAt" >= now() - interval '7 days') as events_last_7d,
        (select count(*)::int from public.events  where "createdAt" >= now() - interval '1 day')  as events_last_24h,
        coalesce((select avg(c)::numeric(10,2) from epu), 0.00) as avg_events_per_unit,
        (select unit_id from ma) as most_active_unit_id,
        (select events  from ma) as most_active_unit_events
    `;

    const s = rows?.[0] ?? {};
    const total = n(s.total_units);
    const published = n(s.published_units);

    return NextResponse.json({
      total_units: total,
      published_units: published,
      units_last_7d: n(s.units_last_7d),
      units_last_24h: n(s.units_last_24h),
      total_events: n(s.total_events),
      public_events: n(s.public_events),
      events_last_7d: n(s.events_last_7d),
      events_last_24h: n(s.events_last_24h),
      avg_events_per_unit: s.avg_events_per_unit ?? "0.00",
      most_active_unit_id: s.most_active_unit_id ?? null,
      most_active_unit_events: n(s.most_active_unit_events),
      published_rate: total ? published / total : 0,
    }, { headers: { "Cache-Control": "no-store" } });

  } catch (err: any) {
    // Helpful error in logs; trimmed response in prod
    console.error("METRICS_SUMMARY_FAILED", {
      name: err?.name, code: err?.code, message: err?.message,
    });
    const safe = process.env.NODE_ENV === "production"
      ? { error: "metrics_failed" }
      : { error: "metrics_failed", message: String(err?.message || err) };
    return NextResponse.json(safe, { status: 500 });
  }
}

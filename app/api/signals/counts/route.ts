import { NextResponse } from 'next/server';
import { signalDelegate } from '@/lib/delegates/signal';
import { scoreBucket } from '@/lib/score';

// Force dynamic for production build
export const dynamic = 'force-dynamic';

const CONVERSION_STAGES = [
  'view_trust',
  'precheck_start', 
  'precheck_complete',
  'tour_request',
  'tour_scheduled',
  'application_start',
  'application_submit',
  'lease_signed'
] as const;

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const unitId = url.searchParams.get('unitId') || 'demo-unit';
    const timeframe = url.searchParams.get('timeframe') || '7d';

    // Calculate time window
    const now = new Date();
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30;
    const since = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000));

    // Get counts for each stage
    const stageCounts = await Promise.all(
      CONVERSION_STAGES.map(async (stage) => {
        const count = await signalDelegate.count({
          where: {
            unitId,
            type: stage,
            createdAt: { gte: since }
          }
        });
        return [stage, count];
      })
    );

    const counts = Object.fromEntries(stageCounts);
    const totalSignals = stageCounts.reduce((sum, [_, count]) => sum + Number(count), 0);

    return NextResponse.json({
      ok: true,
      unitId,
      timeframe,
      totalSignals,
      counts,
      stages: CONVERSION_STAGES,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Counts API error:', error);
    return NextResponse.json(
      { ok: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

import { NextResponse } from 'next/server';
import { signalDelegate } from '@/lib/delegates/signal';
import { scoreBucket } from '@/lib/score';
import { successResponse, errorResponse } from '@/lib/api-utils';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const unitId = url.searchParams.get('unitId') || 'demo-unit';
    const timeRange = url.searchParams.get('timeRange') || '24h';

    // Calculate time range
    const now = new Date();
    let since: Date;
    switch (timeRange) {
      case '1h':
        since = new Date(now.getTime() - 60 * 60 * 1000);
        break;
      case '24h':
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        since = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      default:
        since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    // Aggregate signal counts by type for the specified unit and time range
    const signalCounts = await signalDelegate.findMany({
      where: {
        unitId,
        createdAt: { gte: since }
      },
      select: {
        type: true,
        _count: true
      }
    });

    // Group by type and count
    const countsByType: Record<string, number> = {};
    signalCounts.forEach(signal => {
      countsByType[signal.type] = (countsByType[signal.type] || 0) + 1;
    });

    // Map to FunnelCounts structure
    const funnelCounts = {
      view_trust: countsByType.view_trust || 0,
      precheck_start: countsByType.precheck_start || 0,
      precheck_submit: countsByType.precheck_submit || 0,
      tour_request: countsByType.tour_request || 0,
      application_open: countsByType.application_open || 0,
      application_submit: countsByType.application_submit || 0,
      lease_open: countsByType.lease_open || 0,
      lease_signed: countsByType.lease_signed || 0,
    };

    // Calculate activity level based on total signals
    const totalSignals = Object.values(funnelCounts).reduce((sum, count) => sum + count, 0);
    const level = scoreBucket(totalSignals);

    return successResponse({
      counts: funnelCounts,
      level,
      totalSignals,
      lastUpdatedISO: now.toISOString()
    });
  } catch (error) {
    return errorResponse('Failed to fetch funnel data', 500, error);
  }
}
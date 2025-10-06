import { NextResponse } from 'next/server';
import { signalDelegate } from '@/lib/delegates/signal';
import { prisma } from '@/lib/db';
import { scoreBucket } from '@/lib/score';

const isProd = process.env.NODE_ENV === 'production';

export async function GET() {
  if (isProd) {
    return NextResponse.json({ error: 'Dev endpoint not available in production' }, { status: 404 });
  }

  try {
    // 1. Check delegate availability
    const delegates = Object.keys(prisma).filter(k => 
      typeof (prisma as any)[k]?.findFirst === 'function'
    );
    const hasRequiredDelegates = ['unit', 'event', 'signal'].every(d => delegates.includes(d));

    // 2. Check recent activity (last 24h)
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last24h = await signalDelegate.count({ 
      where: { createdAt: { gte: since } } 
    });

    // 3. Activity level
    const level = scoreBucket(last24h);

    // 4. Latest signal
    const latestSignal = await signalDelegate.findFirst({ 
      orderBy: { createdAt: 'desc' },
      select: { id: true, type: true, createdAt: true, unitId: true }
    });

    // 5. Database connectivity
    const dbConnected = await prisma.$queryRaw`SELECT 1 as ping`.then(() => true).catch(() => false);

    // 6. Basic health checks
    const checks = {
      delegates: hasRequiredDelegates,
      database: dbConnected,
      recentActivity: last24h > 0,
      signalDelegate: typeof signalDelegate?.findFirst === 'function'
    };

    const allHealthy = Object.values(checks).every(Boolean);

    return NextResponse.json({
      ok: true,
      healthy: allHealthy,
      timestamp: new Date().toISOString(),
      delegates: {
        available: delegates,
        required: ['unit', 'event', 'signal'],
        hasAll: hasRequiredDelegates
      },
      activity: {
        last24h,
        level,
        latest: latestSignal
      },
      checks,
      summary: {
        status: allHealthy ? 'READY' : 'ISSUES',
        message: allHealthy 
          ? `Pilot ready: ${delegates.length} delegates, ${last24h} signals (${level} activity)`
          : 'Issues detected - check individual checks'
      }
    });

  } catch (error) {
    return NextResponse.json({
      ok: false,
      healthy: false,
      error: (error as any)?.message || 'Health check failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
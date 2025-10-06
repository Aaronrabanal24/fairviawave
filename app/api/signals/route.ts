import { NextResponse } from 'next/server';
import { signalDelegate } from '@/lib/delegates/signal';
import { prisma } from '@/lib/db';
import { sanitizeMeta } from '@/lib/sanitize';
import { scoreBucket } from '@/lib/score';

const isProd = process.env.NODE_ENV === 'production';

export async function GET() {
  // Include a tiny analytics payload for dashboard boot
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [latest, last24h] = await Promise.all([
    signalDelegate.findFirst({ orderBy: { createdAt: 'desc' } }),
    signalDelegate.count({ where: { createdAt: { gte: since } } })
  ]);

  const level = scoreBucket(last24h);
  return NextResponse.json({ ok: true, latest, last24h, level });
}

export async function POST(req: Request) {
  if (isProd) return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const type = String(body?.type ?? 'debug');
  const metadata = sanitizeMeta(body?.meta || {});
  
  // Generate required fields for Signal model
  const unitId = body?.unitId || 'test-unit';
  const sessionId = body?.sessionId || `sess_${Date.now()}`;
  const ipHash = 'dev-hash';

  const created = await signalDelegate.create({
    data: { 
      unitId,
      type, 
      sessionId,
      ipHash,
      metadata,
      score: 0
    }
  });

  // Keep 201 for creation; flip to 200 if you need backward compat
  return NextResponse.json({ ok: true, created }, { status: 201 });
}

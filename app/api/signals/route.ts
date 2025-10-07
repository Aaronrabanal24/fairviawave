import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { sanitizeMeta } from '@/lib/sanitize';
import { scoreBucket } from '@/lib/score';
import { prodGuard, successResponse, errorResponse } from '@/lib/api-utils';

export async function GET() {
  try {
    // Include a tiny analytics payload for dashboard boot
    const now = new Date();
    const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [latest, last24h] = await Promise.all([
      prisma.signal.findFirst({ orderBy: { createdAt: 'desc' } }),
      prisma.signal.count({ where: { createdAt: { gte: since } } })
    ]);

    const level = scoreBucket(last24h);
    return successResponse({ latest, last24h, level });
  } catch (error) {
    return errorResponse('Internal server error', 500, error);
  }
}

export async function POST(req: Request) {
  const guard = prodGuard();
  if (guard) return guard;

  try {
    const body = await req.json().catch(() => ({}));
    const type = String(body?.type ?? 'debug');
    const metadata = sanitizeMeta(body?.meta || {});
    
    // Generate required fields for Signal model
    const unitId = body?.unitId || 'test-unit';
    const sessionId = body?.sessionId || `sess_${Date.now()}`;
    const ipHash = 'dev-hash';

    const created = await prisma.signal.create({
      data: { 
        unitId,
        type, 
        sessionId,
        ipHash,
        metadata,
        score: 0
      }
    });

    return successResponse({ created }, 201);
  } catch (error) {
    return errorResponse('Internal server error', 500, error);
  }
}

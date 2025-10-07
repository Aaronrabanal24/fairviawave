import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { scoreBucket } from '@/lib/score';

export async function GET() {
  const now = new Date();
  const since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const last24h = await prisma.signal.count({ where: { createdAt: { gte: since } } });
  return NextResponse.json({ ok: true, last24h, level: scoreBucket(last24h) });
}
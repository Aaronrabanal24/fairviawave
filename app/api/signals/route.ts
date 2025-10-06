import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { log } from '@/lib/log';
import { rateLimit } from '@/lib/rateLimit';

const isProd = process.env.NODE_ENV === 'production';

export async function GET() {
  try {
    const signals = await prisma.signal.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    
    return NextResponse.json({ 
      ok: true, 
      count: signals.length,
      signals 
    });
  } catch (error) {
    log.error('Failed to fetch signals', { error: String(error) });
    return NextResponse.json({ error: 'Failed to fetch signals' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (isProd) {
    return NextResponse.json({ error: 'Disabled in production' }, { status: 403 });
  }
  
  // Apply rate limiting
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const { success, limit, remaining, reset } = await rateLimit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: reset },
      { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': limit.toString(),
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': reset.toString()
        }
      }
    );
  }
  
  try {
    const body = await req.json();
    const signalType = String(body?.type ?? 'debug');
    
    const created = await prisma.signal.create({
      data: { 
        type: signalType,
        meta: body?.meta ?? {} 
      }
    });
    
    log.info('Signal created', { type: signalType });
    return NextResponse.json({ ok: true, created }, { status: 201 });
  } catch (error) {
    log.error('Failed to create signal', { error: String(error) });
    return NextResponse.json({ error: 'Failed to create signal' }, { status: 500 });
  }
}

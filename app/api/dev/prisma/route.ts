import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Health/diagnostic route to introspect Prisma client delegates and basic DB connectivity.
// Not for production exposure (suggest protect via middleware or INTERNAL_API_KEY if promoted).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function listDelegates(client: Record<string, any>): string[] {
  return Object.keys(client)
    .filter(k => !k.startsWith('$'))
    .filter(k => typeof (client as any)[k] === 'object')
}

export async function GET(request: Request) {
  // Require INTERNAL_API_KEY header outside local dev to avoid accidental exposure.
  const key = request.headers.get('x-internal-api-key')
  const expected = process.env.INTERNAL_API_KEY
  const isDev = process.env.NODE_ENV !== 'production'
  if ((!isDev || expected) && key !== expected) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
  }
  const meta: Record<string, any> = {}
  let connectivity = false
  let signalDelegate = false
  let unitDelegate = false
  let eventDelegate = false
  try {
    const delegates = listDelegates(prisma as any)
    signalDelegate = delegates.includes('signal')
    unitDelegate = delegates.includes('unit')
    eventDelegate = delegates.includes('event')
    meta.delegates = delegates
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1 as ok` as any
    connectivity = true
    // If signal delegate exists attempt a lightweight count (guarded)
    if (signalDelegate) {
      const count = await (prisma as any).signal.count().catch(() => null)
      meta.signalCountSample = count
    }
  } catch (err: any) {
    meta.error = err?.message || String(err)
  }

  return NextResponse.json({
    ok: connectivity && unitDelegate,
    connectivity,
    models: { unit: unitDelegate, event: eventDelegate, signal: signalDelegate },
    ...meta,
    timestamp: new Date().toISOString()
  })
}

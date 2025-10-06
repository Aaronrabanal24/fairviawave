import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { rateLimit } from '@/lib/rateLimitRedis'
import { createHash } from 'crypto'
import { ConversionSignalType, SignalRequest, SignalResponse } from '@/types/signals'

// Runtime configuration
export const runtime = 'nodejs'
export const preferredRegion = ['sfo1']
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Valid signal types for validation
const VALID_SIGNAL_TYPES: ConversionSignalType[] = [
  'view_trust',
  'precheck_start',
  'precheck_complete',
  'tour_request',
  'tour_scheduled',
  'application_start',
  'application_submit',
  'lease_signed'
]

// Signal scoring weights (higher = more valuable)
const SIGNAL_SCORES: Record<ConversionSignalType, number> = {
  'view_trust': 10,
  'precheck_start': 25,
  'precheck_complete': 40,
  'tour_request': 60,
  'tour_scheduled': 75,
  'application_start': 85,
  'application_submit': 95,
  'lease_signed': 100
}

// Bot detection patterns
const BOT_PATTERNS = [
  /bot|crawler|spider|scraper/i,
  /googlebot|bingbot|facebookexternalhit/i,
  /headless|phantom|selenium/i
]

function hashIP(ip: string): string {
  return createHash('sha256').update(ip + (process.env.IP_SALT || 'fairvia')).digest('hex').substring(0, 16)
}

function isBot(userAgent: string): boolean {
  return BOT_PATTERNS.some(pattern => pattern.test(userAgent))
}

function validateSignalRequest(data: any): data is SignalRequest {
  return (
    typeof data.unitId === 'string' &&
    typeof data.type === 'string' &&
    VALID_SIGNAL_TYPES.includes(data.type as ConversionSignalType) &&
    typeof data.sessionId === 'string' &&
    data.sessionId.length > 0 &&
    (data.userId === undefined || data.userId === null || typeof data.userId === 'string')
  )
}

export async function POST(request: Request) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     '127.0.0.1'
    const ip = clientIP.split(',')[0].trim()
    const ipHash = hashIP(ip)
    const userAgent = request.headers.get('user-agent') || ''

    // Enhanced rate limiting: 100 signals per hour per IP
    const rateLimitResult = await rateLimit(`signal:${ipHash}`, 100, 3600000)
    if (!rateLimitResult.success) {
      return NextResponse.json<SignalResponse>(
        { success: false, error: 'Rate limit exceeded', rateLimited: true },
        { 
          status: 429,
          headers: rateLimitResult.retryAfter ? {
            'Retry-After': rateLimitResult.retryAfter.toString()
          } : {}
        }
      )
    }

    // Bot filtering
    if (isBot(userAgent)) {
      const allowedBots = process.env.ALLOWED_BOTS?.split(',') || ['uptimerobot', 'pingdom']
      const isAllowed = allowedBots.some(bot => userAgent.toLowerCase().includes(bot))
      
      if (!isAllowed) {
  // Return a success response for filtered bots (no signal created)
  return NextResponse.json<SignalResponse>({ success: true })
      }
    }

    const body = await request.json()
    
    // Validate request structure
    if (!validateSignalRequest(body)) {
      return NextResponse.json<SignalResponse>(
        { success: false, error: 'Invalid signal request format' },
        { status: 400 }
      )
    }

    const { unitId, type, sessionId, userId, metadata = {} } = body

    // Verify unit exists and is published
    const unit = await prisma.unit.findUnique({
      where: { id: unitId },
      select: { id: true, status: true }
    })

    if (!unit) {
      return NextResponse.json<SignalResponse>(
        { success: false, error: 'Unit not found' },
        { status: 404 }
      )
    }

    if (unit.status !== 'published') {
      return NextResponse.json<SignalResponse>(
        { success: false, error: 'Unit not published' },
        { status: 403 }
      )
    }

    // Check for duplicate signals (idempotency)
  const existingSignal = await prisma.signal.findFirst({
      where: {
        unitId,
        type,
        sessionId,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Within last 5 minutes
        }
      }
    })

    if (existingSignal) {
      return NextResponse.json<SignalResponse>({ 
        success: true, 
        signalId: existingSignal.id,
        score: existingSignal.score
      })
    }

    // Calculate signal score
    const score = SIGNAL_SCORES[type as ConversionSignalType] || 0

    // Enhanced metadata
    const enhancedMetadata = {
      ...metadata,
      score,
      userAgent: userAgent || undefined,
      timestamp: new Date().toISOString(),
      source: metadata.source || 'unknown'
    }

    // Create the signal record
  const signal = await prisma.signal.create({
      data: {
        unitId,
        type,
        sessionId,
        userId,
        ipHash,
        score,
        metadata: enhancedMetadata,
        userAgent: userAgent || null

  })
  console.log('Signal tracked:', type, 'for unit', unitId, '(score:', score, ')')
    console.log(\`Signal tracked: \${type} for unit \${unitId} (score: \${score})\`)

    // Return success response
    return NextResponse.json<SignalResponse>({
      success: true,
      signalId: signal.id,
      score
    })

  } catch (error) {
    console.error('Signal API error:', error)
    return NextResponse.json<SignalResponse>(
      { success: false, error: 'Internal server error' },
      { status: 500 }
  })
  console.log('Signal tracked:', type, 'for unit', unitId, '(score:', score, ')')

// GET endpoint for signal analytics
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const unitId = url.searchParams.get('unitId')
    const timeframe = url.searchParams.get('timeframe') || '7d'

    if (!unitId) {
      return NextResponse.json({ error: 'unitId parameter required' }, { status: 400 })
    }

    // Calculate timeframe
    const now = new Date()
    const daysBack = timeframe === '1d' ? 1 : timeframe === '7d' ? 7 : 30
    const since = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))

    // Get signal summary
    const signals = await prisma.signal.findMany({
      where: {
        unitId,
        createdAt: {
          gte: since
        }
      },
      select: {
        type: true,
        sessionId: true,
        score: true,
        createdAt: true
      }
    })

    // Calculate metrics
    const totalSignals = signals.length
    const uniqueSessions = new Set(signals.map((s: any) => s.sessionId)).size
    const signalsByType = signals.reduce((acc: Record<string, number>, signal: any) => {
      acc[signal.type] = (acc[signal.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const averageScore = signals.length > 0 
      ? signals.reduce((sum: number, s: any) => sum + (s.score || 0), 0) / signals.length 
      : 0

    return NextResponse.json({
      unitId,
      timeframe,
      totalSignals,
      uniqueSessions,
      signalsByType,
      averageScore: Math.round(averageScore * 100) / 100,
      lastUpdated: new Date().toISOString()
    })

  } catch (error) {
    console.error('Signal analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

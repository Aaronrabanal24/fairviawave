// Signal API - Event tracking schema and types for Wave 2
// This API tracks conversion signals across the customer journey

export type ConversionSignalType = 
  | 'view_trust'        // User views trust badge
  | 'precheck_start'    // User starts precheck process  
  | 'precheck_complete' // User completes precheck
  | 'tour_request'      // User requests tour
  | 'tour_scheduled'    // Tour gets scheduled
  | 'application_start' // User starts application
  | 'application_submit'// User submits application
  | 'lease_signed'      // Lease agreement signed

export type SignalStrength = 'low' | 'medium' | 'high'

export type ConversionSignal = {
  id: string
  unitId: string
  type: ConversionSignalType
  sessionId: string
  userId?: string | null
  ipHash: string
  userAgent?: string
  timestamp: Date
  metadata: {
    source?: string           // 'organic', 'qr', 'direct'
    pageUrl?: string         // Page where signal occurred
    timeOnPage?: number      // Seconds before signal
    referrer?: string        // Referrer URL
    deviceType?: string      // 'mobile', 'desktop', 'tablet'
    strength?: SignalStrength // Signal quality indicator
    score?: number           // Numeric score 0-100
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
}

export type SignalSummary = {
  unitId: string
  totalSignals: number
  uniqueUsers: number
  conversionRate: number
  signalsByType: Record<ConversionSignalType, number>
  averageScore: number
  timeframe: '1d' | '7d' | '30d'
  lastUpdated: Date
}

export type SignalRequest = {
  unitId: string
  type: ConversionSignalType
  sessionId: string
  userId?: string | null
  metadata?: Record<string, any>
}

export type SignalResponse = {
  success: boolean
  signalId?: string
  score?: number
  error?: string
  rateLimited?: boolean
}
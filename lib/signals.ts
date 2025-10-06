// Client-side signal tracking utility with debouncing and offline support
'use client'

import { ConversionSignalType } from '@/types/signals'

interface SignalMetadata {
  source?: string
  referrer?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  device?: string
  page_url?: string
  duration?: number
  [key: string]: any
}

interface SignalOptions {
  unitId: string
  type: ConversionSignalType
  metadata?: SignalMetadata
  debounceMs?: number
}

class SignalTracker {
  private sessionId: string
  private queue: SignalOptions[] = []
  private isOnline = true
  private retryTimeouts = new Map<string, NodeJS.Timeout>()
  private readonly RETRY_DELAYS = [1000, 2000, 5000, 10000] // Exponential backoff
  private pendingSignals = new Map<string, NodeJS.Timeout>()

  constructor() {
    this.sessionId = this.generateSessionId()
    if (typeof window !== 'undefined') {
      this.setupEventListeners()
      this.processQueue()
    }
  }

  private generateSessionId(): string {
    return `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
  }

  private setupEventListeners(): void {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true
      this.processQueue()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
    })

    // Flush queue on page unload
    window.addEventListener('beforeunload', () => {
      this.flushQueue()
    })

    // Page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        this.flushQueue()
      }
    })
  }

  public track(options: SignalOptions): void {
    if (typeof window === 'undefined') return

    const signal: SignalOptions = {
      ...options,
      metadata: {
        ...this.getDefaultMetadata(),
        ...options.metadata
      }
    }

    // Debouncing mechanism
    const debounceKey = `${signal.unitId}:${signal.type}`
    const debounceMs = options.debounceMs || 1000

    // Clear existing timeout
    const existing = this.pendingSignals.get(debounceKey)
    if (existing) {
      clearTimeout(existing)
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      this.queue.push(signal)
      this.processQueue()
      this.pendingSignals.delete(debounceKey)
    }, debounceMs)

    this.pendingSignals.set(debounceKey, timeout)
  }

  private getDefaultMetadata(): SignalMetadata {
    if (typeof window === 'undefined') return {}

    const urlParams = new URLSearchParams(window.location.search)
    
    return {
      referrer: document.referrer || undefined,
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined,
      device: this.getDeviceType(),
      page_url: window.location.href
    }
  }

  private getDeviceType(): string {
    if (typeof navigator === 'undefined') return 'unknown'
    
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/tablet|ipad|playbook|silk/i.test(userAgent)) {
      return 'tablet'
    }
    if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile/i.test(userAgent)) {
      return 'mobile'
    }
    return 'desktop'
  }

  private async processQueue(): Promise<void> {
    if (!this.isOnline || this.queue.length === 0) {
      return
    }

    // Process signals in batches
    const batchSize = 5
    const batch = this.queue.splice(0, batchSize)

    for (const signal of batch) {
      this.sendSignal(signal)
    }

    // Continue processing if queue has more items
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100)
    }
  }

  private async sendSignal(signal: SignalOptions, retryCount = 0): Promise<void> {
    const signalKey = `${signal.unitId}-${signal.type}-${Date.now()}`
    
    try {
      const response = await fetch('/api/signals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...signal,
          sessionId: this.sessionId
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const result = await response.json()
      
      // Clear retry timeout if exists
      const timeoutId = this.retryTimeouts.get(signalKey)
      if (timeoutId) {
        clearTimeout(timeoutId)
        this.retryTimeouts.delete(signalKey)
      }

      console.debug('Signal tracked:', result)

    } catch (error) {
      console.warn('Signal tracking failed:', error)
      
      // Retry with exponential backoff
      if (retryCount < this.RETRY_DELAYS.length) {
        const delay = this.RETRY_DELAYS[retryCount]
        const timeoutId = setTimeout(() => {
          this.sendSignal(signal, retryCount + 1)
        }, delay)
        
        this.retryTimeouts.set(signalKey, timeoutId)
      } else {
        console.error('Signal tracking failed permanently:', signal)
      }
    }
  }

  private flushQueue(): void {
    if (this.queue.length === 0) return

    // Use sendBeacon for reliable sending on page unload
    const signals = this.queue.splice(0)
    
    for (const signal of signals) {
      const data = JSON.stringify({
        ...signal,
        sessionId: this.sessionId
      })

      if ('sendBeacon' in navigator) {
        navigator.sendBeacon('/api/signals', data)
      } else {
        // Fallback for older browsers
        this.sendSignal(signal)
      }
    }
  }

  // Utility methods for common tracking scenarios
  public trackPageView(unitId: string, metadata?: SignalMetadata): void {
    this.track({
      unitId,
      type: 'view_trust',
      metadata,
      debounceMs: 2000 // Longer debounce for page views
    })
  }

  public trackPrecheckStart(unitId: string): void {
    this.track({
      unitId,
      type: 'precheck_start'
    })
  }

  public trackPrecheckComplete(unitId: string, formData?: any): void {
    this.track({
      unitId,
      type: 'precheck_complete',
      metadata: {
        duration: formData?.duration
      }
    })
  }

  public trackTourRequest(unitId: string): void {
    this.track({
      unitId,
      type: 'tour_request'
    })
  }

  public trackApplicationStart(unitId: string): void {
    this.track({
      unitId,
      type: 'application_start'
    })
  }

  public trackApplicationSubmit(unitId: string): void {
    this.track({
      unitId,
      type: 'application_submit'
    })
  }

  public trackLeaseSign(unitId: string): void {
    this.track({
      unitId,
      type: 'lease_signed'
    })
  }
}

// Global instance
export const signalTracker = new SignalTracker()

// Convenience functions
export const signals = {
  viewTrust: (unitId: string, metadata?: SignalMetadata) => 
    signalTracker.trackPageView(unitId, metadata),
    
  startPrecheck: (unitId: string) => 
    signalTracker.trackPrecheckStart(unitId),
    
  completePrecheck: (unitId: string, formData?: any) => 
    signalTracker.trackPrecheckComplete(unitId, formData),
    
  requestTour: (unitId: string) => 
    signalTracker.trackTourRequest(unitId),
    
  startApplication: (unitId: string) => 
    signalTracker.trackApplicationStart(unitId),
    
  submitApplication: (unitId: string) => 
    signalTracker.trackApplicationSubmit(unitId),
    
  signLease: (unitId: string) => 
    signalTracker.trackLeaseSign(unitId)
}

// React hook for easier integration
export function useSignalTracking(unitId: string) {
  return {
    track: (type: ConversionSignalType, metadata?: SignalMetadata) => 
      signalTracker.track({ unitId, type, metadata }),
    trackPageView: (metadata?: SignalMetadata) => 
      signalTracker.trackPageView(unitId, metadata),
    trackPrecheckStart: () => 
      signalTracker.trackPrecheckStart(unitId),
    trackPrecheckComplete: (formData?: any) => 
      signalTracker.trackPrecheckComplete(unitId, formData),
    trackTourRequest: () => 
      signalTracker.trackTourRequest(unitId),
    trackApplicationStart: () => 
      signalTracker.trackApplicationStart(unitId),
    trackApplicationSubmit: () => 
      signalTracker.trackApplicationSubmit(unitId),
    trackLeaseSign: () => 
      signalTracker.trackLeaseSign(unitId)
  }
}

// Auto-track page views for units
export function autoTrackPageView(unitId: string, source: string = 'direct') {
  if (typeof window === 'undefined') return
  
  // Track view on page load with delay to ensure page is loaded
  setTimeout(() => {
    signalTracker.trackPageView(unitId, { source })
  }, 1000)
}

// Export session management for debugging
export const sessionManager = {
  getSessionId: () => signalTracker['sessionId'],
  resetSession: () => {
    signalTracker['sessionId'] = signalTracker['generateSessionId']()
  }
}
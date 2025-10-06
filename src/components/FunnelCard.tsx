'use client'

import React from 'react'
import { Card } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'

export type FunnelCounts = {
  view_trust: number
  precheck_start: number
  precheck_submit: number
  tour_request: number
  application_open: number
  application_submit: number
  lease_open: number
  lease_signed: number
}

export type ActivityLevel = 'low' | 'medium' | 'high'

export interface FunnelCardProps {
  counts: FunnelCounts
  level: ActivityLevel
  lastUpdatedISO: string
}

const stageLabels = {
  view_trust: 'View Trust Badge',
  precheck_start: 'Start Pre-check',
  precheck_submit: 'Submit Pre-check',
  tour_request: 'Request Tour',
  application_open: 'Open Application',
  application_submit: 'Submit Application',
  lease_open: 'Open Lease',
  lease_signed: 'Sign Lease'
}

const levelColors = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-100 text-blue-700',
  high: 'bg-green-100 text-green-700'
}

export function FunnelCard({ counts, level, lastUpdatedISO }: FunnelCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Conversion Funnel</h3>
        <Badge variant="outline" className={levelColors[level]}>
          {level} activity
        </Badge>
      </div>
      
      <div className="space-y-3">
        {Object.entries(counts).map(([key, value]) => (
          <div key={key} className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">{stageLabels[key as keyof FunnelCounts]}</span>
            <span className="font-medium">{value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        Last updated {formatDistanceToNow(new Date(lastUpdatedISO))} ago
      </div>
    </Card>
  )
}
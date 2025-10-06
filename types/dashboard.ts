// Dashboard types for Wave 2 enhancements

export type TimeRange = '1d' | '7d' | '30d'

export type ConversionFunnelData = {
  step: string
  count: number
  conversionRate: number
  variant: 'low' | 'medium' | 'high'
}

export type DailyScoreData = {
  date: string
  score: number
  trend: 'up' | 'down' | 'stable'
}

export type SparklineData = {
  period: TimeRange
  data: DailyScoreData[]
  avg: number
  change: number
}

export type DashboardMetrics = {
  activeUnits: number
  totalViews: number
  totalPrechecks: number
  avgScore: number
  conversionRate: number
  recentActivity: number
  timeRange: TimeRange
  funnelData: ConversionFunnelData[]
  sparklineData: SparklineData
  lastUpdated: string
}

export type Unit = {
  id: string
  name: string
  description: string | null
  status: string
  publishedAt: string | null
  createdAt: string
  score?: number
  trend?: 'up' | 'down' | 'stable'
}

export type CreateUnitData = {
  name: string
  description: string
}
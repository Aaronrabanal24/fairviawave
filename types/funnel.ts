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

export type ActivityLevel = "low" | "medium" | "high"

export type FunnelResponse = {
  counts: FunnelCounts
  level: ActivityLevel
  lastUpdatedISO: string
}
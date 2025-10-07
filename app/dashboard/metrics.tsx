'use client'

import { useEffect, useState } from 'react'

type Summary = {
  total_units: number
  published_units: number
  units_last_7d: number
  units_last_24h: number
  total_events: number
  public_events: number
  events_last_7d: number
  events_last_24h: number
  avg_events_per_unit: string // numeric(10,2) comes back as string
  most_active_unit_id: string | null
  most_active_unit_events: number | null
  published_rate: number
  timestamp: string
}

export default function MetricsCard() {
  const [data, setData] = useState<Summary | null>(null)
  const [err, setErr] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/metrics/summary')
      .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
      .then((json) => {
        setData(json)
        setLoading(false)
      })
      .catch((e) => {
        setErr(String(e))
        setLoading(false)
      })
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetch('/api/metrics/summary')
        .then((r) => (r.ok ? r.json() : Promise.reject(r.statusText)))
        .then(setData)
        .catch(setErr)
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">📊 Wave-1 Metrics</h2>

      {err && <p className="text-red-600 text-sm">Error: {err}</p>}

      {loading && !err && (
        <p className="text-gray-500 animate-pulse">Loading metrics...</p>
      )}

      {data && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {/* Units Metrics */}
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-gray-600 text-xs">Total Units</div>
              <div className="text-2xl font-bold text-blue-700">
                {data.total_units}
              </div>
            </div>

            <div className="p-3 bg-green-50 rounded">
              <div className="text-gray-600 text-xs">Published</div>
              <div className="text-2xl font-bold text-green-700">
                {data.published_units}
                <span className="text-sm ml-1">
                  ({(data.published_rate * 100).toFixed(0)}%)
                </span>
              </div>
            </div>

            <div className="p-3 bg-purple-50 rounded">
              <div className="text-gray-600 text-xs">Units (7d)</div>
              <div className="text-2xl font-bold text-purple-700">
                {data.units_last_7d}
              </div>
            </div>

            <div className="p-3 bg-indigo-50 rounded">
              <div className="text-gray-600 text-xs">Units (24h)</div>
              <div className="text-2xl font-bold text-indigo-700">
                {data.units_last_24h}
              </div>
            </div>

            {/* Events Metrics */}
            <div className="p-3 bg-orange-50 rounded">
              <div className="text-gray-600 text-xs">Total Events</div>
              <div className="text-2xl font-bold text-orange-700">
                {data.total_events}
              </div>
            </div>

            <div className="p-3 bg-teal-50 rounded">
              <div className="text-gray-600 text-xs">Public Events</div>
              <div className="text-2xl font-bold text-teal-700">
                {data.public_events}
              </div>
            </div>

            <div className="p-3 bg-pink-50 rounded">
              <div className="text-gray-600 text-xs">Events (7d)</div>
              <div className="text-2xl font-bold text-pink-700">
                {data.events_last_7d}
              </div>
            </div>

            <div className="p-3 bg-cyan-50 rounded">
              <div className="text-gray-600 text-xs">Events (24h)</div>
              <div className="text-2xl font-bold text-cyan-700">
                {data.events_last_24h}
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 text-xs mb-1">
                Average Events per Unit
              </div>
              <div className="text-lg font-semibold text-gray-800">
                {parseFloat(data.avg_events_per_unit).toFixed(2)}
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded">
              <div className="text-gray-600 text-xs mb-1">Most Active Unit</div>
              <div className="text-sm text-gray-800 font-mono">
                {data.most_active_unit_id ? (
                  <>
                    {data.most_active_unit_id.substring(0, 12)}...
                    <span className="ml-2 text-green-600">
                      ({data.most_active_unit_events} events)
                    </span>
                  </>
                ) : (
                  <span className="text-gray-400">No activity yet</span>
                )}
              </div>
            </div>
          </div>

          {/* Health Indicators */}
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            {data.published_rate < 0.3 && data.total_units > 0 && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                ⚠️ Low publish rate ({(data.published_rate * 100).toFixed(0)}%)
              </span>
            )}
            {data.events_last_24h === 0 && data.published_units > 0 && (
              <span className="px-2 py-1 bg-red-100 text-red-800 rounded">
                🚨 No activity in 24h
              </span>
            )}
            {data.published_rate >= 0.3 &&
              data.events_last_24h > 0 &&
              data.total_units > 0 && (
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  ✅ Healthy activity
                </span>
              )}
          </div>

          {/* Last Updated */}
          <div className="mt-3 text-xs text-gray-400">
            Last updated: {new Date(data.timestamp).toLocaleTimeString()}
            <span className="ml-2 text-gray-500">(auto-refresh: 30s)</span>
          </div>
        </>
      )}
    </div>
  )
}

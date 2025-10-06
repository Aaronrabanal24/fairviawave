'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export type FunnelCounts = {
  view_trust: number;
  precheck_start: number;
  precheck_complete: number;
  tour_request: number;
  tour_scheduled: number;
  application_start: number;
  application_submit: number;
  lease_signed: number;
};

export type ActivityLevel = 'low' | 'medium' | 'high';

interface FunnelCardProps {
  unitId?: string;
  counts?: FunnelCounts;
  level?: ActivityLevel;
  lastUpdatedISO?: string;
  loading?: boolean;
}

const STAGE_LABELS = {
  view_trust: 'Trust Views',
  precheck_start: 'Precheck Started',
  precheck_complete: 'Precheck Complete',
  tour_request: 'Tour Requests',
  tour_scheduled: 'Tours Scheduled',
  application_start: 'Apps Started',
  application_submit: 'Apps Submitted',
  lease_signed: 'Leases Signed'
};

const LEVEL_CONFIG = {
  low: { color: 'bg-gray-100 text-gray-800', emoji: '📊' },
  medium: { color: 'bg-yellow-100 text-yellow-800', emoji: '📈' },
  high: { color: 'bg-green-100 text-green-800', emoji: '🚀' }
};

export function FunnelCard({ 
  unitId = 'demo-unit', 
  counts: propCounts,
  level: propLevel,
  lastUpdatedISO: propLastUpdated,
  loading: propLoading 
}: FunnelCardProps) {
  const [counts, setCounts] = useState<FunnelCounts | null>(propCounts || null);
  const [level, setLevel] = useState<ActivityLevel>(propLevel || 'low');
  const [lastUpdated, setLastUpdated] = useState(propLastUpdated || '');
  const [loading, setLoading] = useState(propLoading ?? !propCounts);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propCounts) return; // Skip fetch if data provided via props

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [countsRes, analyticsRes] = await Promise.all([
          fetch(`/api/signals/counts?unitId=${unitId}&timeframe=7d`),
          fetch('/api/signals/analytics')
        ]);

        if (!countsRes.ok || !analyticsRes.ok) {
          throw new Error('Failed to fetch funnel data');
        }

        const [countsData, analyticsData] = await Promise.all([
          countsRes.json(),
          analyticsRes.json()
        ]);

        setCounts(countsData.counts);
        setLevel(analyticsData.level);
        setLastUpdated(countsData.lastUpdated || new Date().toISOString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('FunnelCard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unitId, propCounts]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📊 Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="h-4 bg-gray-200 rounded w-32 animate-pulse" />
                <div className="h-4 bg-gray-200 rounded w-8 animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">⚠️ Funnel Data Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!counts) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>📊 Conversion Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
  const levelConfig = LEVEL_CONFIG[level];

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            📊 Conversion Funnel
          </CardTitle>
          <Badge className={levelConfig.color}>
            {levelConfig.emoji} {level.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            👥 {total} total signals
          </span>
          {lastUpdated && (
            <span className="flex items-center gap-1">
              🕒 {new Date(lastUpdated).toLocaleTimeString()}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {Object.entries(STAGE_LABELS).map(([stage, label]) => {
            const count = counts[stage as keyof FunnelCounts] || 0;
            const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
            
            return (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-sm font-medium min-w-0 flex-1">{label}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500 w-8 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>
                <span className="text-lg font-semibold text-gray-900 ml-3 min-w-[2rem] text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
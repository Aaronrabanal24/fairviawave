'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DailyScoreData {
  date: string;
  score: number;
  signals: number;
}

interface DailyScoreSparklineProps {
  unitId?: string;
  data?: DailyScoreData[];
  loading?: boolean;
}

export function DailyScoreSparkline({ 
  unitId = 'demo-unit', 
  data: propData,
  loading: propLoading 
}: DailyScoreSparklineProps) {
  const [data, setData] = useState<DailyScoreData[]>(propData || []);
  const [loading, setLoading] = useState(propLoading ?? !propData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propData) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Generate 7 days of mock data for now
        const mockData: DailyScoreData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockData.push({
            date: date.toISOString().split('T')[0],
            score: Math.floor(Math.random() * 100),
            signals: Math.floor(Math.random() * 20)
          });
        }
        setData(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unitId, propData]);

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>
            <span aria-hidden="true">📈</span>
            <span>Daily Activity Score</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 bg-gray-200 rounded animate-pulse" role="progressbar" aria-label="Loading daily activity data" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">
            <span aria-hidden="true">⚠️</span>
            <span>Score Data Error</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-red-600" role="alert">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const maxScore = Math.max(...data.map(d => d.score), 1);
  const avgScore = data.length > 0 ? Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length) : 0;
  const totalSignals = data.reduce((sum, d) => sum + d.signals, 0);
  
  // Helper function to get color based on score value
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-green-500';
    if (score >= 40) return 'bg-green-400';
    if (score >= 20) return 'bg-gray-500';
    return 'bg-gray-400';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <span aria-hidden="true">📈</span>
            <span>Daily Activity Score</span>
          </CardTitle>
          <div className="text-right text-sm text-gray-600">
            <div className="font-semibold text-lg text-gray-900 tabular-nums">{avgScore}</div>
            <div className="text-xs">7-day avg</div>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          <span aria-hidden="true">📊</span> {totalSignals.toLocaleString()} signals this week
        </div>
      </CardHeader>
      <CardContent>
        <div 
          className="h-24 flex items-end justify-between gap-1" 
          role="group" 
          aria-label="Daily activity scores chart"
        >
          {data.map((day, index) => {
            const height = maxScore > 0 ? Math.max((day.score / maxScore) * 100, 5) : 5;
            const isToday = index === data.length - 1;
            const scoreColor = getScoreColor(day.score);
            const dayDate = new Date(day.date);
            const formattedDate = dayDate.toLocaleDateString();
            const tooltip = `${formattedDate}: ${day.score} score, ${day.signals} signals`;
            
            return (
              <div 
                key={day.date} 
                className="flex flex-col items-center flex-1 group relative" 
                tabIndex={0} 
                aria-label={tooltip}
              >
                <div className="absolute bottom-full mb-1 bg-black text-white text-xs p-1 rounded opacity-0 group-hover:opacity-100 group-focus:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {tooltip}
                </div>
                <div 
                  className={`w-full rounded-t transition-all duration-300 ${
                    isToday ? `${scoreColor} ring-2 ring-offset-1 ring-offset-white ring-black` : `${scoreColor} group-hover:brightness-110`
                  }`}
                  style={{ height: `${height}%` }}
                  role="graphics-symbol"
                  aria-roledescription="bar"
                  aria-label={tooltip}
                />
                <div className="text-xs text-gray-500 mt-1 w-full text-center tabular-nums">
                  {dayDate.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="font-semibold text-gray-900 tabular-nums">{Math.max(...data.map(d => d.score))}</div>
            <div className="text-gray-500 text-xs">Peak</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 tabular-nums">{Math.min(...data.map(d => d.score))}</div>
            <div className="text-gray-500 text-xs">Low</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-900 tabular-nums">{data[data.length - 1]?.score || 0}</div>
            <div className="text-gray-500 text-xs">Today</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
// Wave 2 Enhanced Dashboard Component with comprehensive UX improvements
'use client'

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { TimeRange, DashboardMetrics, Unit, CreateUnitData, ConversionFunnelData, DailyScoreData } from '@/types/dashboard';

const Wave2Enhanced = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    activeUnits: 0,
    totalViews: 0,
    totalPrechecks: 0,
    avgScore: 0,
    conversionRate: 0,
    recentActivity: 0,
    timeRange: '7d',
    funnelData: [],
    sparklineData: { period: '7d', data: [], avg: 0, change: 0 },
    lastUpdated: new Date().toISOString()
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUnit, setNewUnit] = useState<CreateUnitData>({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('7d');
  const supabase = useMemo(() => createSupabaseClient(), []);

  // Persist time range selection to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dashboard-time-range') as TimeRange;
    if (saved && ['1d', '7d', '30d'].includes(saved)) {
      setSelectedTimeRange(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('dashboard-time-range', selectedTimeRange);
    // Refetch data when time range changes
    if (!loading) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      handleRefresh();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => setShowToast(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  const showNotification = useCallback((message: string) => {
    setToastMessage(message);
    setShowToast(true);
  }, []);

  // Generate realistic funnel data with variants
  const generateFunnelData = useCallback((views: number, variant: 'low' | 'medium' | 'high'): ConversionFunnelData[] => {
    const multipliers = {
      low: { precheck: 0.15, tour: 0.25, application: 0.40, lease: 0.60 },
      medium: { precheck: 0.35, tour: 0.45, application: 0.65, lease: 0.75 },
      high: { precheck: 0.55, tour: 0.70, application: 0.80, lease: 0.85 }
    };

    const rates = multipliers[variant];
    const prechecks = Math.floor(views * rates.precheck);
    const tours = Math.floor(prechecks * rates.tour);
    const applications = Math.floor(tours * rates.application);
    const leases = Math.floor(applications * rates.lease);

    return [
      { step: 'View Trust', count: views, conversionRate: 100, variant },
      { step: 'Precheck', count: prechecks, conversionRate: (prechecks / views) * 100, variant },
      { step: 'Tour Request', count: tours, conversionRate: (tours / prechecks) * 100, variant },
      { step: 'Application', count: applications, conversionRate: (applications / tours) * 100, variant },
      { step: 'Lease Signed', count: leases, conversionRate: (leases / applications) * 100, variant }
    ];
  }, []);

  // Generate daily score sparkline data
  const generateSparklineData = useCallback((period: TimeRange) => {
    const days = period === '1d' ? 1 : period === '7d' ? 7 : 30;
    const data: DailyScoreData[] = [];
    let baseScore = 75 + Math.random() * 20; // 75-95 base range
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      // Add some realistic variation
      const variation = (Math.random() - 0.5) * 10;
      baseScore = Math.max(50, Math.min(100, baseScore + variation));
      
      const prevScore = i === days - 1 ? baseScore : data[data.length - 1]?.score || baseScore;
      const trend = baseScore > prevScore + 2 ? 'up' : baseScore < prevScore - 2 ? 'down' : 'stable';
      
      data.push({
        date: date.toISOString().split('T')[0],
        score: Math.round(baseScore),
        trend
      });
    }

    const avg = Math.round(data.reduce((sum, d) => sum + d.score, 0) / data.length);
    const change = data.length > 1 ? data[data.length - 1].score - data[0].score : 0;

    return { period, data, avg, change };
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch('/api/units');
      if (res.ok) {
        const unitsData = await res.json();
        setUnits(unitsData);
        
        // Calculate enhanced metrics
        const activeUnits = unitsData.filter((unit: Unit) => unit.status === 'published').length;
        const totalViews = Math.floor(Math.random() * 200) + 100;
        const totalPrechecks = Math.floor(Math.random() * 80) + 30;
        const avgScore = Math.floor(Math.random() * 30) + 70;
        
        // Determine conversion variant based on performance
        const conversionRate = totalPrechecks > 0 ? (totalPrechecks / totalViews) * 100 : 0;
        const variant: 'low' | 'medium' | 'high' = 
          conversionRate < 25 ? 'low' : conversionRate < 45 ? 'medium' : 'high';
        
        const funnelData = generateFunnelData(totalViews, variant);
        const sparklineData = generateSparklineData(selectedTimeRange);
        
        setMetrics({
          activeUnits,
          totalViews,
          totalPrechecks,
          avgScore,
          conversionRate: Math.round(conversionRate),
          recentActivity: Math.floor(Math.random() * 20) + 5,
          timeRange: selectedTimeRange,
          funnelData,
          sparklineData,
          lastUpdated: new Date().toISOString()
        });
      }
    } catch (error) {
      showNotification('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
    showNotification('Dashboard refreshed');
  };

  const handleCreateUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/units', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUnit),
      });
      if (res.ok) {
        const unit = await res.json();
        setUnits([unit, ...units]);
        setNewUnit({ name: '', description: '' });
        setShowCreateModal(false);
        showNotification('Unit created successfully!');
        
        // Update metrics
        const activeUnits = unit.status === 'published' ? metrics.activeUnits + 1 : metrics.activeUnits;
        setMetrics(prev => ({ 
          ...prev, 
          activeUnits, 
          recentActivity: prev.recentActivity + 1,
          lastUpdated: new Date().toISOString()
        }));
      }
    } catch (error) {
      showNotification('Failed to create unit');
    } finally {
      setCreating(false);
    }
  };

  // Enhanced sparkline component with tooltips
  const Sparkline = ({ data, className = '' }: { data: DailyScoreData[], className?: string }) => {
    const [tooltip, setTooltip] = useState<{ x: number, y: number, data: DailyScoreData } | null>(null);
    
    if (data.length === 0) return <div className={`h-8 bg-gray-100 rounded ${className}`} />;
    
    const max = Math.max(...data.map(d => d.score));
    const min = Math.min(...data.map(d => d.score));
    const range = max - min || 1;
    
    const points = data.map((d, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: ((max - d.score) / range) * 100,
      data: d
    }));
    
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    return (
      <div className={`relative ${className}`} style={{ height: '32px' }}>
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full"
          onMouseLeave={() => setTooltip(null)}
        >
          <path
            d={pathData}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-blue-500"
          />
          {points.map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="2"
              className="text-blue-500 fill-current hover:r-3 cursor-pointer"
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setTooltip({
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10,
                  data: point.data
                });
              }}
            />
          ))}
        </svg>
        
        {!!tooltip && (
          <div 
            className="fixed z-50 bg-gray-900 text-white text-xs px-2 py-1 rounded shadow-lg pointer-events-none"
            style={{ 
              left: tooltip.x - 40, 
              top: tooltip.y - 35,
              transform: 'translateX(-50%)'
            }}
          >
            <div className="font-medium">{tooltip.data.score}</div>
            <div className="text-gray-300">{new Date(tooltip.data.date).toLocaleDateString()}</div>
          </div>
        )}
      </div>
    );
  };

  // Conversion funnel with variant styling
  const ConversionFunnelCard = ({ data }: { data: ConversionFunnelData[] }) => {
    const getVariantColor = (variant: 'low' | 'medium' | 'high') => {
      switch (variant) {
        case 'low': return 'border-red-200 bg-red-50';
        case 'medium': return 'border-yellow-200 bg-yellow-50';
        case 'high': return 'border-green-200 bg-green-50';
      }
    };

    const getBarColor = (variant: 'low' | 'medium' | 'high') => {
      switch (variant) {
        case 'low': return 'bg-red-400';
        case 'medium': return 'bg-yellow-400';
        case 'high': return 'bg-green-400';
      }
    };

    if (data.length === 0) return null;

    const variant = data[0].variant;
    const maxCount = Math.max(...data.map(d => d.count));

    return (
      <div className={`p-4 rounded-lg border-2 ${getVariantColor(variant)}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Conversion Funnel</h3>
          <span className={`px-2 py-1 text-xs font-medium rounded ${
            variant === 'low' ? 'bg-red-100 text-red-700' :
            variant === 'medium' ? 'bg-yellow-100 text-yellow-700' :
            'bg-green-100 text-green-700'
          }`}>
            {variant.toUpperCase()} Performance
          </span>
        </div>
        
        <div className="space-y-3">
          {data.map((step, index) => (
            <div key={step.step} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-gray-700">{step.step}</span>
                <span className="text-gray-500">{step.count} ({step.conversionRate.toFixed(1)}%)</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getBarColor(variant)}`}
                    style={{ width: `${(step.count / maxCount) * 100}%` }}
                  />
                </div>
                {index < data.length - 1 && (
                  <div className="text-xs text-gray-400 mt-1">
                    {((data[index + 1].count / step.count) * 100).toFixed(1)}% convert to next step
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Time range selector component
  const TimeRangeSelector = () => (
    <div 
      className="flex bg-gray-100 rounded-lg p-1"
      role="tablist"
      aria-label="Time range selection"
    >
      {(['1d', '7d', '30d'] as TimeRange[]).map((range) => (
        <button
          key={range}
          onClick={() => setSelectedTimeRange(range)}
          className={`px-3 py-1 text-sm font-medium rounded transition-all ${
            selectedTimeRange === range
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          }`}
          role="tab"
          aria-selected={selectedTimeRange === range}
          aria-label={`Select ${range} time range`}
        >
          {range === '1d' ? '24h' : range === '7d' ? '7 days' : '30 days'}
        </button>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Owner Dashboard</h1>
            <p className="mt-1 text-sm text-gray-600">
              Last updated: {new Date(metrics.lastUpdated).toLocaleTimeString()}
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <TimeRangeSelector />
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                refreshing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              aria-label="Refresh dashboard data"
            >
              {refreshing ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </span>
              ) : (
                'Refresh'
              )}
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              aria-label="Create new unit"
            >
              + Create Unit
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Active Units Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Units</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.activeUnits}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-2m-2 0H5m14 0v-2a2 2 0 00-2-2H7a2 2 0 00-2 2v2" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={metrics.sparklineData.data.map(d => ({ ...d, score: d.score * 0.8 }))} className="text-blue-500" />
            </div>
          </div>

          {/* Total Views Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.totalViews}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <Sparkline data={metrics.sparklineData.data} className="flex-1 text-green-500" />
              <span className={`ml-2 text-xs font-medium ${
                metrics.sparklineData.change > 0 ? 'text-green-600' : 
                metrics.sparklineData.change < 0 ? 'text-red-600' : 'text-gray-500'
              }`}>
                {metrics.sparklineData.change > 0 ? '+' : ''}{metrics.sparklineData.change}
              </span>
            </div>
          </div>

          {/* Average Score Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Daily Trust Score</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.sparklineData.avg}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <Sparkline data={metrics.sparklineData.data} className="text-purple-500" />
              <p className="text-xs text-gray-500 mt-1">
                {selectedTimeRange} average: {metrics.sparklineData.avg}
              </p>
            </div>
          </div>

          {/* Conversion Rate Card */}
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.conversionRate}%</p>
              </div>
              <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                <svg className="h-4 w-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <div className="text-xs text-gray-500">
                {metrics.totalPrechecks} prechecks / {metrics.totalViews} views
              </div>
              <div className={`text-xs font-medium mt-1 ${
                metrics.conversionRate > 40 ? 'text-green-600' : 
                metrics.conversionRate > 25 ? 'text-yellow-600' : 'text-red-600'
              }`}>
                {metrics.conversionRate > 40 ? 'High' : metrics.conversionRate > 25 ? 'Medium' : 'Low'} performance
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Analytics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Conversion Funnel */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Performance Analytics</h2>
                  <p className="text-sm text-gray-500">Conversion funnel and performance trends for {selectedTimeRange}</p>
                </div>
              </div>
              
              <ConversionFunnelCard data={metrics.funnelData} />
            </div>
          </div>

          {/* Units Table */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Units</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {units.map((unit) => (
                      <tr key={unit.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                            {!!unit.description && (
                              <div className="text-sm text-gray-500">{unit.description}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            unit.status === 'published' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {unit.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(unit.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900 mr-4">Edit</button>
                          <button className="text-green-600 hover:text-green-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Live Stats */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Live Activity</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Recent Activity</span>
                <span className="flex items-center">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                  <span className="text-sm font-medium text-gray-900">{metrics.recentActivity}</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published Units</span>
                <span className="text-sm font-medium text-gray-900">{metrics.activeUnits}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Draft Units</span>
                <span className="text-sm font-medium text-gray-900">{units.length - metrics.activeUnits}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Create Unit Modal */}
      {!!showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Unit</h3>
            <form onSubmit={handleCreateUnit}>
              <div className="mb-4">
                <label htmlFor="unit-name" className="block text-sm font-medium text-gray-700 mb-2">
                  Unit Name
                </label>
                <input
                  id="unit-name"
                  type="text"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  aria-describedby="unit-name-help"
                />
                <p id="unit-name-help" className="mt-1 text-xs text-gray-500">
                  Enter a descriptive name for your unit
                </p>
              </div>
              <div className="mb-6">
                <label htmlFor="unit-description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  id="unit-description"
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  aria-describedby="unit-description-help"
                />
                <p id="unit-description-help" className="mt-1 text-xs text-gray-500">
                  Optional description for your unit
                </p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors ${
                    creating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {creating ? 'Creating...' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {!!showToast && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-slide-in">
          <div className="flex items-center">
            <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {toastMessage}
          </div>
        </div>
      )}
    </div>
  );
};

export default Wave2Enhanced;
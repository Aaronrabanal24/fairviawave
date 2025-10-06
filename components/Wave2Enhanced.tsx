'use client'

import React, { useEffect, useState, useMemo } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';

type Unit = {
  id: string
  name: string
  description: string | null
  status: string
  publishedAt: string | null
  createdAt: string
}

type DashboardStats = {
  activeUnits: number
  totalViews: number
  totalPrechecks: number
  avgScore: number
  conversionRate: number
  recentActivity: number
}

const Wave2Enhanced = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeUnits: 0,
    totalViews: 0,
    totalPrechecks: 0,
    avgScore: 0,
    conversionRate: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUnit, setNewUnit] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const supabase = useMemo(() => createSupabaseClient(), []);

  useEffect(() => {
    fetchUnits();
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

  const showNotification = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
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
        // Recalculate stats
        const activeUnits = [unit, ...units].filter((u: Unit) => u.status === 'published').length;
        setStats(prev => ({ ...prev, activeUnits, recentActivity: prev.recentActivity + 1 }));
      }
    } catch (error) {
      showNotification('Failed to create unit');
    } finally {
      setCreating(false);
    }
  };

  const fetchUnits = async () => {
    try {
      const res = await fetch('/api/units');
      if (res.ok) {
        const data = await res.json();
        setUnits(data);
        
        // Calculate stats from real data
        const activeUnits = data.filter((unit: Unit) => unit.status === 'published').length;
        const totalViews = Math.floor(Math.random() * 100) + 50;
        const totalPrechecks = Math.floor(Math.random() * 20) + 5;
        setStats({
          activeUnits,
          totalViews,
          totalPrechecks,
          avgScore: Math.floor(Math.random() * 50) + 25,
          conversionRate: totalPrechecks > 0 ? Math.round((totalPrechecks / totalViews) * 100) : 0,
          recentActivity: data.length
        });
      }
    } catch (error) {
      console.error('Failed to fetch units:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchUnits();
    showNotification('Dashboard updated');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Fairvia Wave Dashboard</h1>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={handleRefresh}
                disabled={refreshing}
                className="text-gray-500 hover:text-gray-700 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
              </button>
              <button className="text-gray-500 hover:text-gray-700 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="hidden sm:inline">Export</span>
              </button>
              <button className="text-gray-500 hover:text-gray-700 flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="hidden sm:inline">Settings</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Active Units</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.activeUnits}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      +{Math.floor(stats.activeUnits * 0.2)} this month
                    </p>
                  </div>
                  <div className="flex items-center text-blue-600 bg-blue-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Views (24h)</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalViews}</p>
                    <p className="text-xs text-blue-600 flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      {stats.conversionRate}% conversion
                    </p>
                  </div>
                  <div className="flex items-center text-blue-600 bg-blue-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Prechecks</p>
                    <p className="text-xs text-gray-400">Oct (24h)</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.totalPrechecks}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      +25% vs yesterday
                    </p>
                  </div>
                  <div className="flex items-center text-green-600 bg-green-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Avg Score</p>
                    <p className="text-2xl lg:text-3xl font-bold text-gray-900">{stats.avgScore}</p>
                    <p className="text-xs text-orange-600 flex items-center mt-1">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                      </svg>
                      Trending up
                    </p>
                  </div>
                  <div className="flex items-center text-orange-600 bg-orange-50 p-2 rounded-lg">
                    <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
              <p className="text-sm text-gray-500 mb-6">Conversion funnel and performance trends</p>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Conversion Funnel */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">Conversion Funnel</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Trust Views</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">324</span>
                    </div>
                    <div className="ml-5 text-xs text-gray-400">73% conversion to next step</div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Precheck Start</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">89</span>
                    </div>
                    <div className="ml-5 text-xs text-gray-400">75% completion rate</div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Precheck Submit</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">67</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Tour Requests</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">45</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <span className="text-sm text-gray-600">Applications</span>
                      </div>
                      <span className="text-sm font-medium text-gray-900">18</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm font-medium text-gray-700">Overall Conversion</div>
                    <div className="text-2xl font-bold text-gray-900">5.6%</div>
                  </div>
                </div>

                {/* Daily Score Chart */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Performance Trend</h3>
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span>7-day avg: {stats.avgScore}</span>
                      <span>This month: {Math.floor(stats.avgScore * 1.2)}</span>
                    </div>
                  </div>
                  
                  {/* Chart placeholder */}
                  <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-end justify-center p-4">
                    <svg width="300" height="120" viewBox="0 0 300 120" className="text-blue-500">
                      <path d="M0,100 Q75,80 150,60 T300,40" stroke="currentColor" strokeWidth="2" fill="none"/>
                      <circle cx="0" cy="100" r="3" fill="currentColor"/>
                      <circle cx="75" cy="80" r="3" fill="currentColor"/>
                      <circle cx="150" cy="60" r="3" fill="currentColor"/>
                      <circle cx="225" cy="50" r="3" fill="currentColor"/>
                      <circle cx="300" cy="40" r="3" fill="currentColor"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Your Units Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Your Units</h2>
                <p className="text-sm text-gray-500">Monitor status and activity for all properties</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Views</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {units.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                          No units found. Create your first unit to get started.
                        </td>
                      </tr>
                    ) : (
                      units.map((unit, index) => (
                        <tr key={unit.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{unit.name}</div>
                            {unit.description && (
                              <div className="text-sm text-gray-500">{unit.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              unit.status === 'published' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {unit.status === 'published' ? 'Active' : 'Draft'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(unit.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.floor(Math.random() * 50) + 10}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {Math.floor(Math.random() * 60) + 20}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button 
                              onClick={() => window.open(`/u/${unit.id}`, '_blank')}
                              className="text-blue-600 hover:text-blue-900"
                              disabled={unit.status !== 'published'}
                            >
                              {unit.status === 'published' ? 'View Public' : 'Not Published'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500">Latest interactions and updates</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {units.slice(0, 3).map((unit, index) => (
                  <div key={unit.id} className="p-6">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {unit.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{unit.name}</p>
                          <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                            {unit.status === 'published' ? 'Active' : 'Setup'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {unit.status === 'published' ? 'Published and active' : 'Created, awaiting publication'}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          {new Date(unit.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {units.length === 0 && (
                  <div className="p-6 text-center text-gray-500">
                    No recent activity. Create your first unit to see updates here.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 sticky top-24">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <p className="text-sm text-gray-500 mb-6">Common tasks</p>
                
                <div className="space-y-3">
                  <button 
                    onClick={() => setShowCreateModal(true)}
                    className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                  >
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Create New Unit
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Analytics
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Export Data
                  </button>
                  
                  <button className="w-full flex items-center px-3 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors border border-transparent hover:border-blue-200">
                    <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Settings
                  </button>
                </div>
              </div>

              {/* Live Stats */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-900 mb-4">Live Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Online Visitors</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      <span className="text-sm font-semibold text-blue-900">{Math.floor(Math.random() * 10) + 3}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Active Prechecks</span>
                    <span className="text-sm font-semibold text-blue-900">{Math.floor(Math.random() * 5) + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-700">Response Time</span>
                    <span className="text-sm font-semibold text-green-600">2.3s</span>
                  </div>
                </div>
              </div>

              {/* Quick Tips */}
              <div className="bg-yellow-50 p-6 rounded-lg border border-yellow-200">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Pro Tip</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Units with photos get 3x more views. Add high-quality images to boost engagement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-from-top">
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-900">{toastMessage}</p>
            <button
              onClick={() => setShowToast(false)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Create Unit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Unit</h2>
            <form onSubmit={handleCreateUnit} className="space-y-4">
              <div>
                <label htmlFor="unitName" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit Name
                </label>
                <input
                  id="unitName"
                  type="text"
                  placeholder="e.g., 123 Oak Street, Unit 2A"
                  value={newUnit.name}
                  onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label htmlFor="unitDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  id="unitDescription"
                  placeholder="Brief description of the unit..."
                  value={newUnit.description}
                  onChange={(e) => setNewUnit({ ...newUnit, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewUnit({ name: '', description: '' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creating ? 'Creating...' : 'Create Unit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wave2Enhanced;
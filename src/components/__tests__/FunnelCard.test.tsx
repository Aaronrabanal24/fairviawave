/** @jest-environment jsdom */
import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { FunnelCard, type FunnelCounts } from '@/src/components/FunnelCard'
import React from 'react'

describe('FunnelCard Component', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  const mockCounts: FunnelCounts = {
    view_trust: 100,
    precheck_start: 80,
    precheck_submit: 60,
    tour_request: 40,
    application_open: 30,
    application_submit: 20,
    lease_open: 15,
    lease_signed: 10
  };

  it('should render funnel counts correctly', () => {
    render(
      <FunnelCard 
        counts={mockCounts}
        level="medium"
        lastUpdatedISO="2024-02-25T12:00:00Z"
      />
    );

    // Check stage labels are displayed
    expect(screen.getByText('View Trust Badge')).toBeInTheDocument();
    expect(screen.getByText('Start Pre-check')).toBeInTheDocument();
    expect(screen.getByText('Submit Pre-check')).toBeInTheDocument();
    expect(screen.getByText('Request Tour')).toBeInTheDocument();
    expect(screen.getByText('Open Application')).toBeInTheDocument();
    expect(screen.getByText('Submit Application')).toBeInTheDocument();
    expect(screen.getByText('Open Lease')).toBeInTheDocument();
    expect(screen.getByText('Sign Lease')).toBeInTheDocument();

    // Check values are displayed
    Object.values(mockCounts).forEach(value => {
      expect(screen.getByText(value.toString())).toBeInTheDocument();
    });

    // Check activity level badge
    expect(screen.getByText('medium activity')).toBeInTheDocument();
  });

  it('should handle empty counts gracefully', () => {
    const emptyCounts: FunnelCounts = {
      view_trust: 0,
      precheck_start: 0,
      precheck_submit: 0,
      tour_request: 0,
      application_open: 0,
      application_submit: 0,
      lease_open: 0,
      lease_signed: 0
    };

    render(
      <FunnelCard 
        counts={emptyCounts}
        level="low"
        lastUpdatedISO="2024-02-25T12:00:00Z"
      />
    );

    // Check values show as zeros
    const zeroElements = screen.getAllByText('0');
    expect(zeroElements).toHaveLength(Object.values(emptyCounts).length);

    // Check low activity badge
    expect(screen.getByText('low activity')).toBeInTheDocument();
  });
});
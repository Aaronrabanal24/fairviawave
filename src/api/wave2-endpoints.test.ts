import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

describe('API Endpoints - Counts', () => {
  it('returns eight conversion stages', async () => {
    const { GET } = await import('@/app/api/signals/counts/route');
    
    // Mock signalDelegate
    vi.doMock('@/lib/delegates/signal', () => ({
      signalDelegate: {
        count: vi.fn().mockResolvedValue(5)
      }
    }));

    const url = new URL('http://test/api/signals/counts?unitId=demo-unit');
    const request = new NextRequest(url);
    
    const response = await GET(request);
    const data = await response.json();
    
    expect(data.ok).toBe(true);
    expect(data.unitId).toBe('demo-unit');
    expect(data.stages).toHaveLength(8);
    expect(data.stages).toContain('view_trust');
    expect(data.stages).toContain('lease_signed');
    expect(data.counts).toHaveProperty('view_trust');
    expect(data.counts).toHaveProperty('lease_signed');
  });
});

describe('Score Bucket Function', () => {
  it('correctly categorizes activity levels', async () => {
    const { scoreBucket } = await import('@/lib/score');
    
    expect(scoreBucket(0)).toBe('low');
    expect(scoreBucket(5)).toBe('low');
    expect(scoreBucket(6)).toBe('medium');
    expect(scoreBucket(19)).toBe('medium');
    expect(scoreBucket(20)).toBe('high');
    expect(scoreBucket(100)).toBe('high');
  });
});
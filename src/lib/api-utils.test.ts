import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildURL, safeFetch, ApiResult } from '@/lib/api-utils';

describe('API Utils', () => {
  describe('buildURL', () => {
    it('builds URL with no parameters', () => {
      const url = buildURL('/api/test');
      expect(url).toBe('http://localhost:3000/api/test');
    });

    it('builds URL with parameters', () => {
      const url = buildURL('/api/test', { 
        unitId: 'demo-unit', 
        timeframe: '7d',
        limit: 20 
      });
      expect(url).toContain('unitId=demo-unit');
      expect(url).toContain('timeframe=7d');
      expect(url).toContain('limit=20');
    });

    it('skips undefined parameters', () => {
      const url = buildURL('/api/test', { 
        unitId: 'demo-unit', 
        timeframe: undefined 
      });
      expect(url).toContain('unitId=demo-unit');
      expect(url).not.toContain('timeframe');
    });
  });

  describe('safeFetch', () => {
    beforeEach(() => {
      // Mock fetch for testing
      global.fetch = vi.fn();
    });

    it('returns success result for ok response', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({ data: 'test' })
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const result = await safeFetch<{ data: string }>('/api/test');
      
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toEqual({ data: 'test' });
      }
    });

    it('returns error result for failed response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      
      (global.fetch as any).mockResolvedValueOnce(mockResponse);
      
      const result = await safeFetch('/api/test');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toContain('404');
      }
    });

    it('returns error result for network error', async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await safeFetch('/api/test');
      
      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toBe('Network error');
      }
    });
  });
});
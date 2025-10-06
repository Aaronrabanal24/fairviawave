import { describe, it, expect } from 'vitest';
import { scoreBucket, ActivityLevel } from '@/lib/score';

describe('scoreBucket', () => {
  it('returns low for counts under 6', () => {
    expect(scoreBucket(0)).toBe('low');
    expect(scoreBucket(1)).toBe('low');
    expect(scoreBucket(5)).toBe('low');
  });

  it('returns medium for counts 6-19', () => {
    expect(scoreBucket(6)).toBe('medium');
    expect(scoreBucket(10)).toBe('medium');
    expect(scoreBucket(19)).toBe('medium');
  });

  it('returns high for counts 20+', () => {
    expect(scoreBucket(20)).toBe('high');
    expect(scoreBucket(50)).toBe('high');
    expect(scoreBucket(100)).toBe('high');
  });

  it('handles edge cases', () => {
    expect(scoreBucket(-1)).toBe('low');
    expect(scoreBucket(0)).toBe('low');
  });
});
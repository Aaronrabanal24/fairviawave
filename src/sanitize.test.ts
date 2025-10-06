import { describe, it, expect } from 'vitest';
import { sanitizeMeta, ALLOWED_META_KEYS } from '@/lib/sanitize';

describe('sanitizeMeta', () => {
  it('allows only approved keys', () => {
    const input = {
      unitId: 'u1',
      source: 'organic',
      sneaky: 'blocked',
      userAgent: 'test-browser'
    };
    
    const result = sanitizeMeta(input);
    expect(result).toHaveProperty('unitId', 'u1');
    expect(result).toHaveProperty('source', 'organic');
    expect(result).toHaveProperty('userAgent', 'test-browser');
    expect(result).not.toHaveProperty('sneaky');
  });

  it('handles primitive types correctly', () => {
    const input = {
      unitId: 'test',
      value: 42,
      label: true,
      source: null
    };
    
    const result = sanitizeMeta(input);
    expect(result.unitId).toBe('test');
    expect(result.value).toBe(42);
    expect(result.label).toBe(true);
    expect(result.source).toBe(null);
  });

  it('filters non-JSON-safe values', () => {
    const badFunction = () => {};
    const input = {
      unitId: 'test',
      badFunc: badFunction,
      undef: undefined,
      sym: Symbol('test')
    };
    
    const result = sanitizeMeta(input);
    expect(result).toHaveProperty('unitId', 'test');
    expect(result).not.toHaveProperty('badFunc');
    expect(result).not.toHaveProperty('undef');
    expect(result).not.toHaveProperty('sym');
  });

  it('handles invalid input gracefully', () => {
    expect(sanitizeMeta(null)).toEqual({});
    expect(sanitizeMeta(undefined)).toEqual({});
    expect(sanitizeMeta('string')).toEqual({});
    expect(sanitizeMeta(42)).toEqual({});
  });

  it('preserves JSON-safe nested objects', () => {
    const input = {
      unitId: 'test',
      path: ['a', 'b', 'c'],
      ref: { page: 'home', section: 'hero' }
    };
    
    const result = sanitizeMeta(input);
    expect(result.unitId).toBe('test');
    expect(result.path).toEqual(['a', 'b', 'c']);
    expect(result.ref).toEqual({ page: 'home', section: 'hero' });
  });
});
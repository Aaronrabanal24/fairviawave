// Common API utilities to reduce code duplication
import { NextRequest, NextResponse } from 'next/server';

/**
 * Common error responses for API routes
 */
export const API_ERRORS = {
  INTERNAL_ERROR: { error: 'Internal server error' },
  NOT_FOUND: { error: 'Not found' },
  INVALID_REQUEST: { error: 'Invalid request' },
  UNAUTHORIZED: { error: 'Unauthorized' },
  PROD_DISABLED: { error: 'Disabled in production' },
} as const;

/**
 * Standard error response with logging
 */
export function errorResponse(
  message: string, 
  status: number = 500, 
  error?: unknown
): NextResponse {
  if (error && process.env.NODE_ENV === 'development') {
    console.error(`API Error (${status}):`, message, error);
  }
  
  const errorKey = Object.entries(API_ERRORS).find(([_, value]) => 
    value.error === message
  )?.[1] || API_ERRORS.INTERNAL_ERROR;
  
  return NextResponse.json(errorKey, { status });
}

/**
 * Production guard for development-only endpoints
 */
export function prodGuard(): NextResponse | null {
  if (process.env.NODE_ENV === 'production') {
    return errorResponse('Disabled in production', 403);
  }
  return null;
}

/**
 * Extract query parameters with defaults
 */
export function getQueryParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    get: (key: string, defaultValue?: string) => searchParams.get(key) || defaultValue,
    getInt: (key: string, defaultValue: number = 0) => {
      const value = searchParams.get(key);
      return value ? parseInt(value, 10) || defaultValue : defaultValue;
    },
    has: (key: string) => searchParams.has(key),
  };
}

/**
 * Standard success response
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json({ ok: true, ...data }, { status });
}

/**
 * Standard pagination parameters
 */
export function getPagination(request: NextRequest) {
  const params = getQueryParams(request);
  const page = Math.max(1, params.getInt('page', 1));
  const limit = Math.min(100, Math.max(1, params.getInt('limit', 20)));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}
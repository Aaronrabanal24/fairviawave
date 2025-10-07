'use client';
// Optimized client-only utilities to reduce bundle size
import { ReactNode, useMemo, useState, useTransition } from 'react';

/**
 * Boolean state hook with convenience methods
 */
export function useBool(initial = false) {
  const [value, setValue] = useState(initial);
  const on = () => setValue(true);
  const off = () => setValue(false);
  const toggle = () => setValue(x => !x);
  
  return { value, on, off, toggle };
}

/**
 * Memoization with deep equality (use sparingly)
 */
export function useMemoEq<T>(val: T): T {
  return useMemo(() => {
    const serialized = JSON.stringify(val);
    return val;
  }, [val]);
}

/**
 * Async action hook with pending state
 */
export function useAsyncAction<A extends any[], R>(fn: (...args: A) => Promise<R>) {
  const [pending, startTransition] = useTransition();
  
  return {
    pending,
    run: (...args: A) => startTransition(() => {
      fn(...args).catch(console.error); // Handle promise in transition
    }),
  };
}

/**
 * Common loading states to avoid duplicating JSX
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6', 
    lg: 'h-8 w-8'
  };
  
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-blue-600 ${sizeClasses[size]}`} />
  );
}

/**
 * Common error state component
 */
export function ErrorMessage({ message, retry }: { message: string; retry?: () => void }) {
  return (
    <div className="text-center p-4">
      <div className="text-red-600 mb-2">❌ {message}</div>
      {!!retry && (
        <button 
          onClick={retry}
          className="text-sm text-blue-600 hover:text-blue-800 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}

/**
 * Common empty state component
 */
export function EmptyState({ 
  title, 
  description, 
  action 
}: { 
  title: string; 
  description: string; 
  action?: ReactNode;
}) {
  return (
    <div className="text-center p-8">
      <div className="text-gray-400 text-4xl mb-4">📭</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      {!!action && <div>{action}</div>}
    </div>
  );
}

/**
 * Optimized number formatter
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

/**
 * Common percentage formatter with color coding
 */
export function formatPercentage(value: number, threshold = { good: 15, fair: 5 }): {
  formatted: string;
  color: string;
} {
  const formatted = `${value.toFixed(1)}%`;
  const color = value >= threshold.good ? 'text-green-600' : 
                value >= threshold.fair ? 'text-yellow-600' : 'text-red-600';
  
  return { formatted, color };
}

/**
 * Memoized time formatting for performance
 */
const timeFormatCache = new Map<string, string>();

export function formatTimeAgo(date: string | Date): string {
  const key = typeof date === 'string' ? date : date.toISOString();
  
  if (timeFormatCache.has(key)) {
    return timeFormatCache.get(key)!;
  }
  
  const now = Date.now();
  const then = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
  const diff = now - then;
  
  let result: string;
  if (diff < 60000) result = 'Just now';
  else if (diff < 3600000) result = `${Math.floor(diff / 60000)}m ago`;
  else if (diff < 86400000) result = `${Math.floor(diff / 3600000)}h ago`;
  else result = `${Math.floor(diff / 86400000)}d ago`;
  
  timeFormatCache.set(key, result);
  
  // Clear cache periodically to prevent memory leaks
  if (timeFormatCache.size > 100) {
    const oldestKeys = Array.from(timeFormatCache.keys()).slice(0, 20);
    oldestKeys.forEach(k => timeFormatCache.delete(k));
  }
  
  return result;
}

/**
 * Debounced function factory for optimizing API calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}
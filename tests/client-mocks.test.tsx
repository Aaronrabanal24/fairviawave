import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Ensure Next.js mocks are loaded
vi.mock('next/navigation');
vi.mock('@/lib/supabase/client');

describe('Client Component Testing Setup', () => {
  it('has access to browser APIs', () => {
    expect(window).toBeDefined();
    expect(document).toBeDefined();
    expect(window.matchMedia).toBeDefined();
  });

  it('has TextEncoder and TextDecoder', () => {
    expect(TextEncoder).toBeDefined();
    expect(TextDecoder).toBeDefined();
    const encoder = new TextEncoder();
    const encoded = encoder.encode('test');
    expect(encoded).toBeDefined();
    expect(encoded.length).toBe(4);
  });

  it('has crypto.getRandomValues', () => {
    expect(crypto.getRandomValues).toBeDefined();
    const array = new Uint8Array(10);
    crypto.getRandomValues(array);
    // Check that at least some values were filled
    expect(array.some(val => val !== 0)).toBe(true);
  });

  it('has ResizeObserver', () => {
    expect(ResizeObserver).toBeDefined();
    const observer = new ResizeObserver(() => {});
    expect(observer.observe).toBeDefined();
  });

  it('has IntersectionObserver', () => {
    expect(IntersectionObserver).toBeDefined();
    const observer = new IntersectionObserver(() => {});
    expect(observer.observe).toBeDefined();
  });

  it('can render a simple React component', () => {
    function TestComponent() {
      return <div>Hello Test</div>;
    }
    
    render(<TestComponent />);
    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });

  it('mocks next/navigation hooks', async () => {
    const { useRouter, usePathname, useSearchParams } = await import('next/navigation');
    
    const router = useRouter();
    expect(router.push).toBeDefined();
    expect(typeof router.push).toBe('function');
    
    const pathname = usePathname();
    expect(pathname).toBe('/');
    
    const searchParams = useSearchParams();
    expect(searchParams).toBeInstanceOf(URLSearchParams);
  });

  it('mocks Supabase client', async () => {
    // Create a manual mock for this test
    const mockClient = {
      auth: {
        getUser: vi.fn(),
        onAuthStateChange: vi.fn(),
      },
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        insert: vi.fn().mockReturnThis(),
      })),
    };
    
    vi.doMock('@/lib/supabase/client', () => ({
      createSupabaseClient: () => mockClient,
    }));
    
    const { createSupabaseClient } = await import('@/lib/supabase/client');
    const client = createSupabaseClient();
    
    expect(client).toBeDefined();
    expect(client.auth).toBeDefined();
    expect(client.auth.getUser).toBeDefined();
    expect(client.from).toBeDefined();
  });
});

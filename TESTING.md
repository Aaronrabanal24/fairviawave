# Testing Guide for Fairvia Wave

This document describes the comprehensive testing setup for the Fairvia Wave project, including configuration, patterns, and best practices for writing tests.

## Overview

The project uses **Vitest** as its testing framework with the following key features:
- **jsdom** environment for testing React components
- Comprehensive polyfills for browser APIs
- Manual mocks for Next.js modules
- Mocks for Supabase and Prisma clients
- TypeScript support with full type checking

## Running Tests

### Available Commands

```bash
# Run all tests once
npm test

# Run tests in watch/interactive mode
npm run test:ui

# Run only unit tests (tests in src directory)
npm run test:unit

# Run only e2e tests (Playwright)
npm run test:e2e
```

## Configuration

### Main Configuration File

The testing setup is configured in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",           // Browser-like environment
    setupFiles: ["./test/setup.ts"], // Global test setup
    globals: true,                   // Enable global test APIs
    css: false,                      // Don't process CSS
    pool: "threads",                 // Run tests in parallel
    coverage: {                      // Coverage reporting
      reporter: ["text", "lcov"],
      exclude: ["**/*.d.ts", "**/test/**", "**/e2e/**"],
    },
  },
})
```

### Global Test Setup

The `test/setup.ts` file provides:
- **Browser API Polyfills**: TextEncoder, TextDecoder, Crypto, fetch
- **DOM APIs**: matchMedia, ResizeObserver, IntersectionObserver
- **Next.js Mocks**: Automatic mocking of Next.js modules
- **Testing Library Matchers**: jest-dom matchers for better assertions

## Available Mocks

### Next.js Mocks

Located in `__mocks__/next/`:

#### Navigation (`next/navigation`)
```typescript
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

// In your test
const router = useRouter();
router.push('/new-path');  // Mocked function

const pathname = usePathname();  // Returns '/'
const searchParams = useSearchParams();  // Returns empty URLSearchParams
```

#### Link Component (`next/link`)
```typescript
import Link from 'next/link';

// Renders as a simple <a> tag in tests
<Link href="/path">Click me</Link>
```

#### Headers (`next/headers`)
```typescript
import { cookies, headers } from 'next/headers';

const cookieStore = cookies();  // Mock cookie store
const headerStore = headers();  // Mock headers (Map)
```

### Supabase Client Mock

Located in `__mocks__/@/lib/supabase/client.ts`:

```typescript
import { createSupabaseClient } from '@/lib/supabase/client';

// In your test - use vi.doMock for test-specific behavior
vi.doMock('@/lib/supabase/client', () => ({
  createSupabaseClient: () => ({
    auth: {
      getUser: vi.fn(async () => ({ data: { user: mockUser }, error: null })),
      signOut: vi.fn(async () => ({ error: null })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
    })),
  }),
}));
```

### Prisma Client Mock

Located in `__mocks__/@prisma/client.ts`:

```typescript
// Available for all Prisma models: unit, event, signal
import { vi } from 'vitest';

// In your test
vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => ({
    unit: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      // ... all CRUD methods
    },
    // event and signal models also available
  })),
}));
```

## Writing Tests

### Basic Component Test

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});
```

### Testing with Next.js Navigation

```typescript
import { vi } from 'vitest';
import { render } from '@testing-library/react';
import MyComponent from './MyComponent';

// Mock must be declared before importing component
vi.mock('next/navigation');

describe('MyComponent with navigation', () => {
  it('uses router', async () => {
    const { useRouter } = await import('next/navigation');
    render(<MyComponent />);
    
    const router = useRouter();
    expect(router.push).toBeDefined();
  });
});
```

### Testing with Supabase

```typescript
import { vi } from 'vitest';
import { render } from '@testing-library/react';

describe('Component with Supabase', () => {
  it('fetches data', async () => {
    const mockData = [{ id: '1', name: 'Test' }];
    
    // Setup mock before component import
    vi.doMock('@/lib/supabase/client', () => ({
      createSupabaseClient: () => ({
        from: vi.fn(() => ({
          select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
        })),
      }),
    }));
    
    // Now import and test your component
    const MyComponent = (await import('./MyComponent')).default;
    render(<MyComponent />);
    
    // Add assertions
  });
});
```

### Testing API Routes

```typescript
import { describe, it, expect } from 'vitest';
import { GET } from '@/app/api/my-route/route';

describe('API Route', () => {
  it('returns data', async () => {
    const request = new Request('http://test/api/my-route');
    const response = await GET(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data).toHaveProperty('result');
  });
});
```

## Best Practices

### 1. Import Order
Always mock modules before importing the component that uses them:

```typescript
// ✅ Correct
vi.mock('next/navigation');
import MyComponent from './MyComponent';

// ❌ Wrong
import MyComponent from './MyComponent';
vi.mock('next/navigation');  // Too late!
```

### 2. Async Imports for Dynamic Mocks
Use dynamic imports when you need to set up mocks differently per test:

```typescript
it('test with specific mock', async () => {
  vi.doMock('@/lib/supabase/client', () => ({
    // Test-specific mock
  }));
  
  const Component = (await import('./Component')).default;
  // Test the component
});
```

### 3. Clean Up Between Tests
Vitest automatically clears mocks between tests, but you can also:

```typescript
import { beforeEach, afterEach } from 'vitest';

beforeEach(() => {
  // Setup before each test
});

afterEach(() => {
  vi.clearAllMocks();  // Explicit cleanup
});
```

### 4. Use Testing Library Queries
Prefer queries that match how users interact with your app:

```typescript
// ✅ Good - accessible and user-focused
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)

// ❌ Avoid - implementation details
screen.getByClassName('btn-primary')
container.querySelector('.my-class')
```

### 5. Test User Interactions
Use `@testing-library/user-event` for realistic user interactions:

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('handles click', async () => {
  const user = userEvent.setup();
  render(<MyButton />);
  
  await user.click(screen.getByRole('button'));
  expect(mockHandler).toHaveBeenCalled();
});
```

## Troubleshooting

### Issue: "React is not defined"
**Solution**: Import React explicitly in your test file:
```typescript
import React from 'react';
```

### Issue: Mock not working
**Solution**: Ensure mock is declared before component import:
```typescript
vi.mock('module-name');  // Must come first
import Component from './Component';
```

### Issue: "Cannot read property of undefined"
**Solution**: Check that your mock returns the expected structure:
```typescript
vi.doMock('@/lib/client', () => ({
  default: mockClient,  // Default export
  namedExport: mockFn,   // Named export
}));
```

### Issue: Test hangs or times out
**Solution**: Ensure async operations are properly awaited:
```typescript
// ✅ Correct
await user.click(button);
await waitFor(() => expect(element).toBeInTheDocument());

// ❌ Wrong
user.click(button);  // Missing await
```

## Coverage Reports

Generate coverage reports:

```bash
npx vitest run --coverage
```

Coverage reports will be generated in:
- Terminal: Text summary
- `coverage/lcov-report/index.html`: Interactive HTML report

## CI/CD Integration

Tests run automatically in CI via:
```bash
npm test  # Runs all tests once and exits
```

## Additional Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Next.js Testing Guide](https://nextjs.org/docs/testing)

## Support

For issues or questions about testing:
1. Check this guide first
2. Review existing tests in `src/` and `tests/`
3. Check the [Vitest troubleshooting guide](https://vitest.dev/guide/troubleshooting.html)

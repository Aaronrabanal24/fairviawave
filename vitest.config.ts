import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: [
      '{app,lib}/**/*.{test,spec}.{ts,tsx}',
      'tests/**/*.{test,spec}.{ts,tsx}',
    ],
    exclude: ['e2e/**', 'node_modules/**', '.next/**', 'dist/**'],
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        pretendToBeVisual: true,
        url: 'http://localhost',
      },
    },
    setupFiles: ['tests/setup.ts'],
    css: false,
    pool: 'threads',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      reportsDirectory: 'coverage',
      include: ['app/**/*.{ts,tsx}', 'lib/**/*.{ts,tsx}'],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'next/navigation': path.resolve(__dirname, 'tests/__mocks__/next/navigation.ts'),
      'next/link': path.resolve(__dirname, 'tests/__mocks__/next/link.tsx'),
      'next/headers': path.resolve(__dirname, 'tests/__mocks__/next/headers.ts'),
      '@/lib/supabaseClient': path.resolve(
        __dirname,
        'tests/__mocks__/@/lib/supabaseClient.ts'
      ),
    },
  },
})

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    include: ['src/**/*.{test,spec}.ts?(x)', 'app/**/*.{test,spec}.ts?(x)'],
    exclude: ['e2e/**', 'tests/**', 'node_modules/**', '.next/**', 'dist/**'],
    environment: 'node',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './vitest-mocks/server-only.js'),
    },
  },
})

import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./test/setup.ts"],
    globals: true,
    css: false,
    pool: "threads",
    include: ['src/**/*.{test,spec}.ts?(x)', 'tests/**/*.{test,spec}.ts?(x)'],
    exclude: ['e2e/**', 'node_modules/**', '.next/**', 'dist/**'],
    coverage: {
      reporter: ["text", "lcov"],
      exclude: ["**/*.d.ts", "**/test/**", "**/e2e/**"],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      'server-only': path.resolve(__dirname, './vitest-mocks/server-only.js'),
    },
  },
})

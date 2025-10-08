import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || process.env.PRODUCTION_URL || 'http://localhost:3001',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
})

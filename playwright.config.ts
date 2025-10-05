import { defineConfig } from '@playwright/test'

export default defineConfig({
  timeout: 30_000,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
  },
})

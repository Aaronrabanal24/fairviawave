import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  retries: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:3000',
  },
})

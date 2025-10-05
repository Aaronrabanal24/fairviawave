import { test, expect } from '@playwright/test'

test('public timeline renders and paginates', async ({ page }) => {
  const unitId = process.env.PUBLIC_UNIT_ID
  if (!unitId) throw new Error('PUBLIC_UNIT_ID env var is missing')

  // First page should load
  await page.goto(`/u/${unitId}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  // Either a list is visible (events exist) or "No public activity" message
  const hasList = await page.getByRole('list').isVisible().catch(() => false)
  const hasEmptyMessage = await page.getByText(/no public activity yet/i).isVisible().catch(() => false)
  expect(hasList || hasEmptyMessage).toBeTruthy()

  // Test pagination navigation (if there are events)
  if (hasList) {
    const hasNavigation = await page.getByRole('navigation', { name: /pagination/i }).isVisible().catch(() => false)

    // If pagination exists, test page 2
    if (hasNavigation) {
      await page.goto(`/u/${unitId}?page=2&page_size=5`)
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
      // Page 2 might have list or empty message
      const hasListP2 = await page.getByRole('list').isVisible().catch(() => false)
      const hasEmptyP2 = await page.getByText(/no public activity yet/i).isVisible().catch(() => false)
      expect(hasListP2 || hasEmptyP2).toBeTruthy()
    }
  }
})

test('no PII leaks in public timeline', async ({ request }) => {
  const unitId = process.env.PUBLIC_UNIT_ID
  if (!unitId) throw new Error('PUBLIC_UNIT_ID env var is missing')

  const res = await request.get(`/api/units/${unitId}/timeline/public`)
  expect(res.ok()).toBeTruthy()

  const json = await res.json()
  const blob = JSON.stringify(json).toLowerCase()
  // safer pattern for emails
  expect(blob).not.toMatch(/\b[\w.+-]+@[\w.-]+\.\w{2,}\b/)
})

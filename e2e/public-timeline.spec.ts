import { test, expect } from '@playwright/test'

test('public timeline renders and paginates', async ({ page }) => {
  const unitId = process.env.PUBLIC_UNIT_ID!
  await page.goto(`/u/${unitId}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('list')).toBeVisible()

  await page.goto(`/u/${unitId}?page=2&page_size=5`)
  await expect(page.getByRole('list')).toBeVisible()
})

test('no PII leaks in public timeline', async ({ request }) => {
  const unitId = process.env.PUBLIC_UNIT_ID!
  const res = await request.get(`/api/units/${unitId}/timeline/public`)
  expect(res.ok()).toBeTruthy()

  const json = await res.json()
  const blob = JSON.stringify(json).toLowerCase()
  // safer pattern for emails
  expect(blob).not.toMatch(/\b[\w.+-]+@[\w.-]+\.\w{2,}\b/)
})

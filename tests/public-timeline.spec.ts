import { test, expect } from '@playwright/test'

test('public timeline renders and paginates', async ({ page }) => {
  const unitId = process.env.E2E_UNIT_ID!
  const token = process.env.E2E_UNIT_TOKEN!
  await page.goto(`/u/${unitId}?token=${token}`)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.getByRole('list')).toBeVisible()

  await page.goto(`/u/${unitId}?token=${token}&page=2&page_size=5`)
  await expect(page).toHaveURL(/page_size=5/)
})

test('no PII leaks in public timeline', async ({ request }) => {
  const unitId = process.env.E2E_UNIT_ID!
  const token = process.env.E2E_UNIT_TOKEN!
  const res = await request.get(`/api/units/${unitId}/timeline/public?token=${token}`)
  expect(res.ok()).toBeTruthy()
  const json = await res.json()
  const blob = JSON.stringify(json).toLowerCase()
  expect(blob).not.toMatch(/@/)
  expect(blob).not.toMatch(/\b\d{3}[-\s]?\d{3}[-\s]?\d{4}\b/)
})


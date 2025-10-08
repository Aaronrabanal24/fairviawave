import { test, expect } from '@playwright/test'

test('public timeline renders and paginates', async ({ page }) => {
  const unitId = process.env.PUBLIC_UNIT_ID
  if (!unitId) throw new Error('PUBLIC_UNIT_ID env var is missing')

  // First page should load
  const url = `/u/${unitId}`
  console.log('Loading URL:', url)
  const response = await page.goto(url, { waitUntil: 'networkidle' })
  console.log('Page loaded with status:', response?.status())
  
  // Log any errors in the console
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('Browser error:', msg.text())
    }
  })

  // Wait for content to load and log network requests
  page.on('request', req => console.log('Request:', req.url()))
  page.on('response', res => console.log('Response:', res.url(), res.status()))
  await new Promise(resolve => setTimeout(resolve, 5000))
  
  console.log('Checking for heading')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

  console.log('Checking for list or empty message')
  const hasList = await page.getByRole('list').isVisible().catch(() => false)
  const hasEmptyMessage = await page.getByText(/no public activity yet/i).isVisible().catch(() => false)

  // Log page content for debugging
  const content = await page.content()
  console.log('Page content:', content)

  console.log('List visible:', hasList, 'Empty message visible:', hasEmptyMessage)
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

import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('dashboard has no critical a11y issues', async ({ page }) => {
  // Note: This test requires authentication setup
  // For now, we'll skip if not authenticated
  await page.goto('/dashboard')
  
  // Check if redirected to login (not authenticated)
  const url = page.url()
  if (url.includes('/login') || url.includes('/auth')) {
    test.skip()
    return
  }

  // Run accessibility checks
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  const critical = results.violations.filter(v => v.impact === 'critical')
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
})

test('dashboard has proper keyboard navigation', async ({ page }) => {
  await page.goto('/dashboard')
  
  // Check if redirected to login
  const url = page.url()
  if (url.includes('/login') || url.includes('/auth')) {
    test.skip()
    return
  }

  // Test keyboard navigation on time range selector
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  await page.keyboard.press('Tab')
  
  // Check that focus is visible
  const focusedElement = await page.locator(':focus').count()
  expect(focusedElement).toBeGreaterThan(0)
})

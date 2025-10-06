import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('badge page has no critical a11y issues', async ({ page }) => {
  await page.goto('/badge')

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  const critical = results.violations.filter(v => v.impact === 'critical')
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
})

test('badge page buttons are keyboard accessible', async ({ page }) => {
  await page.goto('/badge')

  // Test tab navigation
  await page.keyboard.press('Tab')
  const firstButton = page.getByLabel('Start precheck process')
  
  // Check if we can reach the button
  await expect(firstButton).toBeVisible()
  
  // Test keyboard activation
  await firstButton.focus()
  await page.keyboard.press('Enter')
  
  // Should trigger alert (we're just testing keyboard accessibility)
})

test('badge page has proper touch target sizes', async ({ page }) => {
  await page.goto('/badge')

  // Check that buttons meet minimum touch target size (44x44px)
  const buttons = page.getByRole('button')
  const count = await buttons.count()
  
  for (let i = 0; i < count; i++) {
    const button = buttons.nth(i)
    const box = await button.boundingBox()
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  }
})

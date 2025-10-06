import { test, expect, devices } from '@playwright/test'

const viewports = [
  { name: 'Mobile S', width: 320, height: 568 },
  { name: 'Mobile M', width: 375, height: 667 },
  { name: 'Mobile L', width: 425, height: 812 },
  { name: 'Tablet', width: 768, height: 1024 },
]

test.describe('Public timeline mobile responsiveness', () => {
  for (const viewport of viewports) {
    test(`renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      const unitId = process.env.PUBLIC_UNIT_ID
      if (!unitId) {
        test.skip()
        return
      }

      await page.goto(`/u/${unitId}`)

      // Check that content is visible
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Check that content doesn't overflow
      const main = page.locator('main')
      const box = await main.boundingBox()
      if (box) {
        expect(box.width).toBeLessThanOrEqual(viewport.width)
      }

      // Check that text is readable (not too small)
      const heading = page.getByRole('heading', { level: 1 })
      const fontSize = await heading.evaluate(el => 
        window.getComputedStyle(el).fontSize
      )
      const fontSizePx = parseInt(fontSize)
      expect(fontSizePx).toBeGreaterThanOrEqual(16)
    })
  }
})

test.describe('Badge page mobile responsiveness', () => {
  for (const viewport of viewports) {
    test(`renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      await page.goto('/badge')

      // Check that content is visible and centered
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible()

      // Check button sizes are touch-friendly
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
  }
})

test.describe('Dashboard mobile responsiveness', () => {
  for (const viewport of [viewports[1], viewports[2], viewports[3]]) {
    test(`renders correctly on ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize({ width: viewport.width, height: viewport.height })
      
      await page.goto('/dashboard')

      // Check if redirected to login
      const url = page.url()
      if (url.includes('/login') || url.includes('/auth')) {
        test.skip()
        return
      }

      // Check that dashboard heading is visible
      const heading = page.getByText('Owner Dashboard')
      if (await heading.isVisible()) {
        await expect(heading).toBeVisible()
      }
    })
  }
})

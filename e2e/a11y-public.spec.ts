// e2e/a11y-public.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test('public timeline has no critical a11y issues', async ({ page }) => {
  const unitId = process.env.PUBLIC_UNIT_ID!
  await page.goto(`/u/${unitId}`)

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze()

  const critical = results.violations.filter(v => v.impact === 'critical')
  // helpful output if it ever fails again
  expect(critical, JSON.stringify(critical, null, 2)).toEqual([])
})

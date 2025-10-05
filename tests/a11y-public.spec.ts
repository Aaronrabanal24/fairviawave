import { test, expect } from '@playwright/test'
import { analyze } from '@axe-core/playwright'

test('public timeline has no critical a11y issues', async ({ page }) => {
  const unitId = process.env.E2E_UNIT_ID!
  const token = process.env.E2E_UNIT_TOKEN!
  await page.goto(`/u/${unitId}?token=${token}`)
  const results = await analyze(page, {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] },
  })
  const critical = results.violations.filter((v) => v.impact === 'critical')
  expect(critical, JSON.stringify(critical, null, 2)).toHaveLength(0)
})


// e2e/a11y-public.spec.ts
import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('Public timeline a11y', () => {
  test('has no critical a11y issues', async ({ page }) => {
    const unitId = process.env.PUBLIC_UNIT_ID
    expect(unitId, 'PUBLIC_UNIT_ID must be set').toBeTruthy()

    await page.goto(`/u/${unitId}`)

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    const critical = results.violations.filter(v => v.impact === 'critical')

    if (critical.length) {
      console.log(
        'Axe critical violations:\n' +
          critical
            .map(v => `- ${v.id}: ${v.help} (${v.impact}) on ${v.nodes.length} node(s)`)
            .join('\n')
      )
    }

    expect(critical).toEqual([])
  })
})

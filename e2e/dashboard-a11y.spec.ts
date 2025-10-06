import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Dashboard Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    // For now, we'll mock the login by directly navigating to the dashboard
    // In a real app, you would programmatically log in
    await page.goto('/dashboard');
    await page.waitForSelector('h1:has-text("Dashboard")');
  });

  test('Dashboard should have no critical accessibility issues', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('All interactive elements should be focusable and have accessible names', async ({ page }) => {
    const interactiveElements = await page.locator(
      'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ).all();

    for (const element of interactiveElements) {
      await expect(element).toBeVisible();
      await expect(element).toHaveAttribute('aria-label', /.+/);
    }
  });
});
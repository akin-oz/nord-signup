import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

test.describe('accessibility', () => {
  test('home page has no serious or critical axe violations', async ({ page }) => {
    await page.goto('/')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })

  test('success page has no serious or critical axe violations', async ({ page }) => {
    // Drive the form to reach /success — direct visit redirects per ADR-005.
    await page.goto('/')
    await page.getByLabel('Email').fill('test@example.com')
    await page.getByLabel('Password').fill('correct-horse-battery-staple-15')
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    await expect(page).toHaveURL('/success')

    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze()

    const serious = results.violations.filter(
      (v) => v.impact === 'serious' || v.impact === 'critical',
    )
    expect(serious, JSON.stringify(serious, null, 2)).toEqual([])
  })
})

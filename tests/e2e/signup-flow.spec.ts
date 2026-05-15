import { test, expect } from '@playwright/test'

const VALID_EMAIL = 'test@example.com'
const VALID_PASSWORD = 'correct-horse-battery-staple-15'
const SHORT_PASSWORD = 'fourteen-chars' // 14 chars, one below the NIST floor (ADR-004).
const INVALID_EMAIL = 'not-an-email'

test.describe('signup flow', () => {
  test('happy path: fill valid form, submit, land on /success with email displayed', async ({
    page,
  }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill(VALID_EMAIL)
    await page.getByLabel('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: /sign up|create account/i }).click()

    await expect(page).toHaveURL('/success')
    await expect(
      page.getByRole('heading', { name: new RegExp(`welcome,.*${VALID_EMAIL}`, 'i') }),
    ).toBeVisible()
  })

  test('empty form submit is blocked with required errors', async ({ page }) => {
    await page.goto('/')
    await page.getByRole('button', { name: /sign up|create account/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/email is required/i)).toBeVisible()
    await expect(page.getByText(/password is required/i)).toBeVisible()
  })

  test('password under 15 chars is blocked with length error', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill(VALID_EMAIL)
    await page.getByLabel('Password').fill(SHORT_PASSWORD)
    await page.getByRole('button', { name: /sign up|create account/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/at least 15 characters/i)).toBeVisible()
  })

  test('invalid email format is blocked with format error', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill(INVALID_EMAIL)
    await page.getByLabel('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: /sign up|create account/i }).click()

    await expect(page).toHaveURL('/')
    await expect(page.getByText(/valid email address/i)).toBeVisible()
  })

  test('direct visit to /success redirects to /', async ({ page }) => {
    // ADR-005 route guard: isComplete is false at app boot, middleware redirects.
    await page.goto('/success')
    await expect(page).toHaveURL('/')
  })

  test('refresh on /success after signup redirects to / (transient state)', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill(VALID_EMAIL)
    await page.getByLabel('Password').fill(VALID_PASSWORD)
    await page.getByRole('button', { name: /sign up|create account/i }).click()
    await expect(page).toHaveURL('/success')

    // ADR-005 + ADR-006: Pinia transient state, no persistence. Reload re-inits
    // the SPA with an empty store; middleware on /success sees isComplete=false
    // and redirects.
    await page.reload()
    await expect(page).toHaveURL('/')
  })

  test('Enter key on password field submits the form', async ({ page }) => {
    await page.goto('/')
    await page.getByLabel('Email').fill(VALID_EMAIL)
    await page.getByLabel('Password').fill(VALID_PASSWORD)
    await page.getByLabel('Password').press('Enter')

    await expect(page).toHaveURL('/success')
  })
})

import { test, expect } from '@playwright/test'

test('session survives page refresh', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/email/i).fill(
    'alice@example.com',
  )

  await page.getByLabel(/password/i).fill(
    'password123',
  )

  await page.getByRole('button', {
    name: /login|sign in|entrar/i,
  }).click()

  await expect(page).not.toHaveURL(/\/login/)

  await page.reload()

  await expect(page).not.toHaveURL(/\/login/)

  await page.goto('/checkout')

  await expect(page).toHaveURL(/\/checkout/)
})
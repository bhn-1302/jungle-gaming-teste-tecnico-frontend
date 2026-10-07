import { test, expect } from '@playwright/test'

test('cart exposes coupon controls', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/email/i).fill('alice@example.com')
  await page.getByLabel(/password/i).fill('password123')

  await page.getByRole('button', {
    name: /login|sign in|entrar/i,
  }).click()

  await expect(page).not.toHaveURL(/\/login/)

  await page.goto('/')

  await page.locator('a[href^="/nft/"]').first().click()

  await page.getByRole('button', {
    name: 'Add to cart',
  }).click()

  await page.goto('/cart')

  await expect(
    page.getByRole('heading', {
      name: 'Shopping cart',
    }),
  ).toBeVisible()

  await expect(page.getByLabel('Coupon')).toBeVisible()

  await expect(
    page.getByRole('button', {
      name: 'Apply',
    }),
  ).toBeVisible()
})
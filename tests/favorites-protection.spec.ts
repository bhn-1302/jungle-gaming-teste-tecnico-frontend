import { test, expect } from '@playwright/test'

test('authenticated user favorite persists after refresh', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/email/i).fill('alice@example.com')
  await page.getByLabel(/password/i).fill('password123')

  await page.getByRole('button', {
    name: /login|sign in|entrar/i,
  }).click()

  await expect(page).not.toHaveURL(/\/login/)

  await page.goto('/')

  const firstNft = page.locator('a[href^="/nft/"]').first()

  await expect(firstNft).toBeVisible()

  await firstNft.click()

  const favoriteButton = page.getByRole('button', {
    name: 'Add to favorites',
  })

  await expect(favoriteButton).toBeVisible()

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/favorites/') &&
        response.request().method() === 'POST' &&
        response.ok(),
    ),
    favoriteButton.click(),
  ])

  await page.reload()

  const favoritedButton = page.getByRole('button', {
    name: 'Remove from favorites',
  })

  await expect(favoritedButton).toBeVisible()
  await expect(favoritedButton).toHaveAttribute(
    'aria-pressed',
    'true',
  )
})
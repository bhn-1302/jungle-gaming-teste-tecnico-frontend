import { test, expect } from '@playwright/test'

test('profile requires authentication', async ({ page }) => {
  await page.goto('/profile')

  await expect(page).toHaveURL(/\/login/)
})
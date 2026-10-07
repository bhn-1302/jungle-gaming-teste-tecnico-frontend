import { test, expect } from '@playwright/test'

test('catalog loads NFTs', async ({ page }) => {
  await page.goto('/')

  await expect(
    page.locator('img').first(),
  ).toBeVisible()
})
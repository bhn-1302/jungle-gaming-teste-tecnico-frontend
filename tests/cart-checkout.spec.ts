import { test, expect } from '@playwright/test'

test('authenticated user can add, update, persist and remove an NFT from the cart', async ({
  page,
}) => {
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

  const addToCartButton = page.getByRole('button', {
    name: 'Add to cart',
  })

  await expect(addToCartButton).toBeVisible()

  const nftName = await page.getByRole('heading').first().textContent()

  await expect(
    page.getByLabel('Selected quantity'),
  ).toHaveText('1')

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.url().includes('/api/cart/items') &&
        response.request().method() === 'POST' &&
        response.ok(),
    ),
    addToCartButton.click(),
  ])

  await page.goto('/cart')

  await expect(page).toHaveURL(/\/cart/)

  await expect(
    page.getByRole('heading', {
      name: 'Shopping cart',
    }),
  ).toBeVisible()

  const cartItem = page.locator('article').first()

  await expect(cartItem).toBeVisible()

  if (nftName) {
    await expect(
      cartItem.getByRole('heading', {
        name: nftName,
      }),
    ).toBeVisible()
  }

  const cartQuantity = cartItem.locator(
    'span[aria-label^="Quantity of "]',
  )

  await expect(cartQuantity).toHaveText('1')

  const availabilityText =
    await cartItem.getByText(/\d+ available/).textContent()

  const availableQuantity = Number(
    availabilityText?.match(/\d+/)?.[0],
  )

  expect(availableQuantity).toBeGreaterThanOrEqual(1)

  const increaseButton = cartItem.getByRole('button', {
    name: /Increase quantity of/i,
  })

  const decreaseButton = cartItem.getByRole('button', {
    name: /Decrease quantity of/i,
  })

  if (availableQuantity > 1) {
    await increaseButton.click()

    await expect(cartQuantity).toHaveText('2')

    await decreaseButton.click()

    await expect(cartQuantity).toHaveText('1')
  } else {
    await expect(increaseButton).toBeDisabled()
  }

  await page.reload()

  await expect(
    page.getByRole('heading', {
      name: 'Shopping cart',
    }),
  ).toBeVisible()

  const persistedCartItem = page.locator('article').first()

  await expect(persistedCartItem).toBeVisible()

  await expect(
    persistedCartItem.locator(
      'span[aria-label^="Quantity of "]',
    ),
  ).toHaveText('1')

  await persistedCartItem.getByRole('button', {
    name: 'Remove',
  }).click()

  await expect(
    page.getByRole('heading', {
      name: 'Your cart is empty',
    }),
  ).toBeVisible()
})

test('checkout link is available from the cart', async ({ page }) => {
  await page.goto('/login')

  await page.getByLabel(/email/i).fill('alice@example.com')
  await page.getByLabel(/password/i).fill('password123')

  await page.getByRole('button', {
    name: /login|sign in|entrar/i,
  }).click()

  await expect(page).not.toHaveURL(/\/login/)

  await page.goto('/cart')

  const emptyCart = page.getByRole('heading', {
    name: 'Your cart is empty',
  })

  const shoppingCart = page.getByRole('heading', {
    name: 'Shopping cart',
  })

  if (await emptyCart.isVisible()) {
    await page.goto('/')
    await page.locator('a[href^="/nft/"]').first().click()

    await page.getByRole('button', {
      name: 'Add to cart',
    }).click()

    await page.goto('/cart')
  }

  await expect(shoppingCart).toBeVisible()

  await expect(
    page.getByRole('link', {
      name: 'Continue to checkout',
    }),
  ).toBeVisible()
})
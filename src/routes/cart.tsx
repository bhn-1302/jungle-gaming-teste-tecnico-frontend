import { createFileRoute } from '@tanstack/react-router'

import { CartPage } from './-cart-page'

export const Route = createFileRoute('/cart')({
  component: CartPage
})
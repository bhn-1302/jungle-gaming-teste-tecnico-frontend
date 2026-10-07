import { createFileRoute, redirect } from '@tanstack/react-router'

import { getAuthToken } from '../api/auth-token'
import { CheckoutPage } from './-checkout-page'

export const Route = createFileRoute('/checkout')({
  beforeLoad: () => {
    if (!getAuthToken()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: CheckoutPage,
})
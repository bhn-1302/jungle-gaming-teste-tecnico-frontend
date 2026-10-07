import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'

import { getAuthToken } from '../api/auth-token'
import { ConfirmationPage } from './-confirmation-page'

export const Route = createFileRoute('/confirmation')({
  beforeLoad: () => {
    if (!getAuthToken()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: ConfirmationPage,
})
import {
  createFileRoute,
  redirect,
} from '@tanstack/react-router'

import { getAuthToken } from '../api/auth-token'
import { ProfilePage } from './-profile-page'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    if (!getAuthToken()) {
      throw redirect({
        to: '/login',
      })
    }
  },
  component: ProfilePage,
})
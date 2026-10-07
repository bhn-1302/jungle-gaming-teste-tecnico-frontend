import { http, HttpResponse } from 'msw'

import { mockState } from '../data/state'

function getUserId(request: Request): string | null {
  const authorization = request.headers.get('Authorization')

  if (!authorization) {
    return null
  }

  const token = authorization.replace('Bearer ', '')

  const user = mockState.users.find(
    (item) => token === `mock-token-${item.id}`,
  )

  return user?.id ?? null
}

export const profileHandlers = [
  http.get('/api/profile', ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const profile = mockState.profiles.find(
      (item) => item.userId === userId,
    )

    if (!profile) {
      return HttpResponse.json(
        { message: 'Profile not found' },
        { status: 404 },
      )
    }

    return HttpResponse.json(profile)
  }),

  http.patch('/api/profile', async ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      displayName?: unknown
      bio?: unknown
    }

    const profile = mockState.profiles.find(
      (item) => item.userId === userId,
    )

    if (!profile) {
      return HttpResponse.json(
        { message: 'Profile not found' },
        { status: 404 },
      )
    }

    if (
      body.displayName !== undefined &&
      typeof body.displayName !== 'string'
    ) {
      return HttpResponse.json(
        { message: 'Invalid display name' },
        { status: 400 },
      )
    }

    if (
      body.bio !== undefined &&
      typeof body.bio !== 'string'
    ) {
      return HttpResponse.json(
        { message: 'Invalid bio' },
        { status: 400 },
      )
    }

    if (body.displayName !== undefined) {
      profile.displayName = body.displayName
    }

    if (body.bio !== undefined) {
      profile.bio = body.bio
    }

    return HttpResponse.json(profile)
  }),
]
import { http, HttpResponse } from 'msw'
import { mockState } from '../data/state'

export const authHandlers = [
  http.post('/api/session/login', async ({ request }) => {
    const body = (await request.json()) as {
      email?: string
      password?: string
    }

    const user = mockState.users.find(
      (item) => item.email === body.email,
    )

    if (!user || body.password !== 'password123') {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
      token: `mock-token-${user.id}`,
    })
  }),

  http.post('/api/session/register', async ({ request }) => {
    const body = (await request.json()) as {
      name?: unknown
      email?: unknown
      password?: unknown
    }

    if (
      typeof body.name !== 'string' ||
      typeof body.email !== 'string' ||
      typeof body.password !== 'string' ||
      body.name.trim() === '' ||
      body.email.trim() === '' ||
      body.password.length < 6
    ) {
      return HttpResponse.json(
        { message: 'Invalid registration data' },
        { status: 400 },
      )
    }

    const email = body.email.trim().toLowerCase()

    const existingUser = mockState.users.find(
      (user) => user.email.toLowerCase() === email,
    )

    if (existingUser) {
      return HttpResponse.json(
        { message: 'Email already registered' },
        { status: 409 },
      )
    }

    const user = {
      id: `user-${mockState.users.length + 1}`,
      name: body.name.trim(),
      email,
      passwordHash: 'mock-hash-generated',
      avatarUrl: null,
    }

    mockState.users.push(user)

    mockState.profiles.push({
      userId: user.id,
      displayName: user.name,
      bio: '',
    })

    return HttpResponse.json(
      {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          avatarUrl: user.avatarUrl,
        },
        token: `mock-token-${user.id}`,
      },
      { status: 201 },
    )
  }),

  http.get('/api/session', ({ request }) => {
    const authorization = request.headers.get('Authorization')

    if (!authorization) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const token = authorization.replace('Bearer ', '')

    const user = mockState.users.find(
      (item) => token === `mock-token-${item.id}`,
    )

    if (!user) {
      return HttpResponse.json(
        { message: 'Session expired' },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
      },
    })
  }),

  http.post('/api/session/logout', ({ request }) => {
    const authorization = request.headers.get('Authorization')

    if (!authorization) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    return HttpResponse.json({
      success: true,
    })
  }),
]

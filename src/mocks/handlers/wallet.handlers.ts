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

export const walletHandlers = [
  http.get('/api/wallets', ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const wallets = mockState.wallets.filter(
      (wallet) => wallet.userId === userId,
    )

    return HttpResponse.json({
      items: wallets,
    })
  }),

  http.post('/api/wallets', async ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      address?: unknown
      network?: unknown
      label?: unknown
    }

    if (
      typeof body.address !== 'string' ||
      typeof body.network !== 'string' ||
      typeof body.label !== 'string'
    ) {
      return HttpResponse.json(
        { message: 'Invalid wallet data' },
        { status: 400 },
      )
    }

    const wallet = {
      id: `wallet-${mockState.wallets.length + 1}`,
      userId,
      address: body.address,
      network: body.network,
      label: body.label,
    }

    mockState.wallets.push(wallet)

    return HttpResponse.json(wallet, { status: 201 })
  }),

  http.delete('/api/wallets/:id', ({ request, params }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const walletId = String(params.id)

    const index = mockState.wallets.findIndex(
      (wallet) =>
        wallet.id === walletId &&
        wallet.userId === userId,
    )

    if (index === -1) {
      return HttpResponse.json(
        { message: 'Wallet not found' },
        { status: 404 },
      )
    }

    mockState.wallets.splice(index, 1)

    return HttpResponse.json({
      success: true,
    })
  }),
]
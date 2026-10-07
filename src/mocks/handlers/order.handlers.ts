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

export const orderHandlers = [
  http.get('/api/orders', ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const userOrders = mockState.orders.filter(
      (order) => order.userId === userId,
    )

    return HttpResponse.json({
      items: userOrders,
    })
  }),

  http.get('/api/orders/:id', ({ request, params }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const orderId = String(params.id)

    const order = mockState.orders.find(
      (item) =>
        item.id === orderId &&
        item.userId === userId,
    )

    if (!order) {
      return HttpResponse.json(
        { message: 'Order not found' },
        { status: 404 },
      )
    }

    return HttpResponse.json(order)
  }),

  http.post('/api/orders', async ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        { message: 'Session required' },
        { status: 401 },
      )
    }

    const body = (await request.json()) as {
      idempotencyKey?: unknown
      quoteId?: unknown
    }

    if (
      typeof body.idempotencyKey !== 'string' ||
      body.idempotencyKey.trim() === '' ||
      typeof body.quoteId !== 'string' ||
      body.quoteId.trim() === ''
    ) {
      return HttpResponse.json(
        {
          message:
            'Idempotency key and quote ID are required',
        },
        { status: 400 },
      )
    }

    const existingOrder = mockState.orders.find(
      (order) =>
        order.userId === userId &&
        order.idempotencyKey === body.idempotencyKey,
    )

    if (existingOrder) {
      return HttpResponse.json(existingOrder)
    }

    const quote = mockState.quotes.find(
      (item) =>
        item.id === body.quoteId &&
        item.userId === userId,
    )

    if (!quote) {
      return HttpResponse.json(
        { message: 'Quote not found' },
        { status: 404 },
      )
    }

    if (
      new Date(quote.expiresAt).getTime() <= Date.now()
    ) {
      return HttpResponse.json(
        {
          message:
            'Quote expired. Request a new quote.',
        },
        { status: 409 },
      )
    }

    for (const item of quote.items) {
      const nft = mockState.nfts.find(
        (candidate) => candidate.id === item.nftId,
      )

      if (!nft) {
        return HttpResponse.json(
          {
            message:
              'NFT is no longer available. Request a new quote.',
            nftId: item.nftId,
          },
          { status: 409 },
        )
      }

      if (item.quantity > nft.availableQuantity) {
        return HttpResponse.json(
          {
            message:
              'NFT availability changed. Request a new quote.',
            nftId: item.nftId,
            availableQuantity:
              nft.availableQuantity,
          },
          { status: 409 },
        )
      }

      if (nft.priceEth !== item.unitPriceEth) {
        return HttpResponse.json(
          {
            message:
              'NFT price changed. Request a new quote.',
            nftId: item.nftId,
          },
          { status: 409 },
        )
      }
    }

    const orderItems = quote.items.map((item) => {
      const nft = mockState.nfts.find(
        (candidate) => candidate.id === item.nftId,
      )

      return {
        nftId: item.nftId,
        name: nft?.name ?? 'Unknown NFT',
        quantity: item.quantity,
        unitPriceEth: item.unitPriceEth,
      }
    })

    const order = {
      id: `order-${mockState.orders.length + 1}`,
      userId,
      status: 'pending' as const,
      items: orderItems,
      subtotalEth: quote.subtotalEth,
      discountEth: quote.discountEth,
      networkFeeEth: quote.networkFeeEth,
      totalEth: quote.totalEth,
      transactionId: null,
      idempotencyKey: body.idempotencyKey,
      version: 1,
    }

    mockState.orders.push(order)

    return HttpResponse.json(order, { status: 201 })
  }),
]
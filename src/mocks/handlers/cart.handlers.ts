import { http, HttpResponse } from 'msw'

import { mockState } from '../data/state'
import { persistCartItems } from '../data/carts'

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

export const cartHandlers = [
  http.get('/api/cart', ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        {
          message: 'Session required',
        },
        {
          status: 401,
        },
      )
    }

    const items = mockState.cartItems
      .filter((item) => item.userId === userId)
      .map((item) => {
        const nft = mockState.nfts.find(
          (nft) => nft.id === item.nftId,
        )

        return {
          ...item,
          nft,
        }
      })

    return HttpResponse.json({
      items,
    })
  }),

  http.post('/api/cart/items', async ({ request }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        {
          message: 'Session required',
        },
        {
          status: 401,
        },
      )
    }

    const body = (await request.json()) as {
      nftId?: unknown
      quantity?: unknown
    }

    if (
      typeof body.nftId !== 'string' ||
      typeof body.quantity !== 'number' ||
      !Number.isInteger(body.quantity) ||
      body.quantity < 1
    ) {
      return HttpResponse.json(
        {
          message: 'Invalid cart item',
        },
        {
          status: 400,
        },
      )
    }

    const nftId = body.nftId
    const quantity = body.quantity

    const nft = mockState.nfts.find(
      (item) => item.id === nftId,
    )

    if (!nft) {
      return HttpResponse.json(
        {
          message: 'NFT not found',
        },
        {
          status: 404,
        },
      )
    }

    if (quantity > nft.availableQuantity) {
      return HttpResponse.json(
        {
          message: 'Insufficient availability',
          availableQuantity: nft.availableQuantity,
        },
        {
          status: 409,
        },
      )
    }

    const existingItem = mockState.cartItems.find(
      (item) =>
        item.userId === userId &&
        item.nftId === nftId,
    )

    if (existingItem) {
      existingItem.quantity = quantity
    } else {
      mockState.cartItems.push({
        userId,
        nftId,
        quantity,
      })
    }

    persistCartItems()

    return HttpResponse.json({
      success: true,
    })
  }),

  http.delete('/api/cart/items/:nftId', ({
    request,
    params,
  }) => {
    const userId = getUserId(request)

    if (!userId) {
      return HttpResponse.json(
        {
          message: 'Session required',
        },
        {
          status: 401,
        },
      )
    }

    const nftId = String(params.nftId)

    const index = mockState.cartItems.findIndex(
      (item) =>
        item.userId === userId &&
        item.nftId === nftId,
    )

    if (index !== -1) {
      mockState.cartItems.splice(index, 1)
      persistCartItems()
    }

    return HttpResponse.json({
      success: true,
    })
  }),
]
import { http, HttpResponse } from 'msw'

import { mockState } from '../data/state'
import {
  addStoredFavorite,
  getStoredFavorites,
  removeStoredFavorite,
} from '../data/favorites'

function getUserId(request: Request) {
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

export const favoritesHandlers = [
  http.get('/api/favorites', ({ request }) => {
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

    const userFavorites = getStoredFavorites().filter(
      (favorite) => favorite.userId === userId,
    )

    return HttpResponse.json({
      items: userFavorites,
    })
  }),

  http.post('/api/favorites/:nftId', ({ request, params }) => {
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

    const nftExists = mockState.nfts.some(
      (nft) => nft.id === nftId,
    )

    if (!nftExists) {
      return HttpResponse.json(
        {
          message: 'NFT not found',
        },
        {
          status: 404,
        },
      )
    }

    addStoredFavorite({
      userId,
      nftId,
    })

    return HttpResponse.json({
      success: true,
      favorite: {
        userId,
        nftId,
      },
    })
  }),

  http.delete('/api/favorites/:nftId', ({ request, params }) => {
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

    removeStoredFavorite(userId, nftId)

    return HttpResponse.json({
      success: true,
    })
  }),
]
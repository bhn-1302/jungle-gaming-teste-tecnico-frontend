import { useState } from 'react'
import {
  useNavigate,
  useParams,
} from '@tanstack/react-router'

import { useCart } from '../api/queries/use-cart'
import { useFavorites } from '../api/queries/use-favorites'
import { useNft } from '../api/queries/use-nft'
import { useSession } from '../api/queries/use-session'

export function NftDetailPage() {
  const navigate = useNavigate()

  const { nftId } = useParams({
    from: '/nft/$nftId',
  })

  const session = useSession()
  const nftQuery = useNft(nftId)
  const favorites = useFavorites()
  const cart = useCart()

  const [quantity, setQuantity] = useState(1)

  if (nftQuery.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-xl bg-gray-100" />

          <div className="space-y-6">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-100" />
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-100" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
            <div className="h-8 w-40 animate-pulse rounded bg-gray-100" />
            <div className="h-12 animate-pulse rounded bg-gray-100" />
          </div>
        </div>
      </main>
    )
  }

  if (nftQuery.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div
          role="alert"
          className="mx-auto max-w-lg rounded-xl border p-8 text-center"
        >
          <h1 className="text-2xl font-semibold">NFT not found</h1>

          <p className="mt-3 text-gray-500">
            This NFT could not be found or is no longer available.
          </p>

          <button
            type="button"
            onClick={() => {
              void navigate({ to: '/' })
            }}
            className="mt-6 rounded-lg border px-5 py-3 font-medium"
          >
            Back to marketplace
          </button>
        </div>
      </main>
    )
  }

  const nft = nftQuery.data
  const favoriteItems = favorites.data ?? []
  const isAuthenticated = Boolean(session.data)
  const isFavorite = favoriteItems.some(
    (favorite) => favorite.nftId === nft.id,
  )
  const isUnavailable = nft.availableQuantity <= 0

  const favoriteError =
    favorites.addError ??
    favorites.removeError

  const decreaseQuantity = () => {
    setQuantity((current) => Math.max(1, current - 1))
  }

  const increaseQuantity = () => {
    setQuantity((current) =>
      Math.min(nft.availableQuantity, current + 1),
    )
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      await navigate({ to: '/login' })
      return
    }

    if (isFavorite) {
      await favorites.removeFavorite(nft.id)
      return
    }

    await favorites.addFavorite(nft.id)
  }

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      await navigate({ to: '/login' })
      return
    }

    await cart.updateCartItem({
      nftId: nft.id,
      quantity,
    })
  }

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border">
            <img
              src={nft.imageUrl}
              alt={nft.name}
              className="aspect-square w-full object-cover"
            />
          </div>
        </div>

        <section className="flex flex-col">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">
                {nft.collection}
              </p>

              <h1 className="mt-2 text-3xl font-semibold">
                {nft.name}
              </h1>
            </div>

            <button
              type="button"
              onClick={() => {
                void handleFavorite()
              }}
              disabled={
                favorites.isAdding ||
                favorites.isRemoving
              }
              className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              aria-pressed={isFavorite}
              aria-label={
                isFavorite
                  ? 'Remove from favorites'
                  : 'Add to favorites'
              }
            >
              {isFavorite
                ? '♥ Favorited'
                : '♡ Favorite'}
            </button>
          </div>

          {favoriteError && (
            <div
              role="alert"
              className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              Unable to update favorite. Please try again.
            </div>
          )}

          <p className="mt-6 text-gray-600">
            {nft.description}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <div>
              <p className="text-sm text-gray-500">
                Creator
              </p>

              <p className="mt-1 font-medium">
                {nft.creator}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Edition
              </p>

              <p className="mt-1 font-medium">
                {nft.edition} / {nft.maxEdition}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Available
              </p>

              <p className="mt-1 font-medium">
                {nft.availableQuantity}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Price
              </p>

              <p className="mt-1 text-xl font-semibold">
                {nft.priceEth} ETH
              </p>
            </div>
          </div>

          <div className="mt-8 border-t pt-8">
            {isUnavailable ? (
              <div
                role="alert"
                className="rounded-lg border p-4"
              >
                <p className="font-medium">
                  Edition unavailable
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  This NFT is currently sold out.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">
                  Quantity
                </p>

                <div className="mt-3 flex w-fit items-center rounded-lg border">
                  <button
                    type="button"
                    onClick={decreaseQuantity}
                    disabled={quantity <= 1}
                    className="px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>

                  <span
                    className="min-w-12 text-center"
                    aria-label="Selected quantity"
                  >
                    {quantity}
                  </span>

                  <button
                    type="button"
                    onClick={increaseQuantity}
                    disabled={
                      quantity >= nft.availableQuantity
                    }
                    className="px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                void handleAddToCart()
              }}
              disabled={
                cart.isUpdating ||
                isUnavailable
              }
              className="mt-6 w-full rounded-lg border px-6 py-3 font-medium disabled:cursor-not-allowed disabled:opacity-50"
            >
              {cart.isUpdating
                ? 'Adding...'
                : isUnavailable
                  ? 'Unavailable'
                  : 'Add to cart'}
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
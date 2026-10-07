import { useState } from 'react'
import axios from 'axios'
import { Link } from '@tanstack/react-router'

import { useCart } from '../api/queries/use-cart'
import { useQuote } from '../api/queries/use-quote'
import { addEth, multiplyEth } from '../mocks/utils/eth'

type QuoteErrorResponse = {
  message: string
  code?: string
}

export function CartPage() {
  const cart = useCart()
  const quoteQuery = useQuote()

  const [coupon, setCoupon] = useState('')
  const [appliedCoupon, setAppliedCoupon] = useState('')

  if (cart.isPending) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="space-y-6">
          <div className="h-10 w-48 animate-pulse rounded bg-gray-100" />

          <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl bg-gray-100"
                />
              ))}
            </div>

            <div className="h-80 animate-pulse rounded-xl bg-gray-100" />
          </div>
        </div>
      </main>
    )
  }

  if (cart.isError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div
          role="alert"
          className="mx-auto max-w-lg rounded-xl border p-8 text-center"
        >
          <h1 className="text-2xl font-semibold">
            Unable to load cart
          </h1>

          <p className="mt-3 text-gray-500">
            We could not load your cart. Please try again.
          </p>

          <button
            type="button"
            onClick={() => {
              void cart.refetch()
            }}
            className="mt-6 rounded-lg border px-5 py-3 font-medium"
          >
            Try again
          </button>
        </div>
      </main>
    )
  }

  const items = cart.data ?? []

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="text-3xl font-semibold">
            Your cart is empty
          </h1>

          <p className="mt-3 text-gray-500">
            Add an NFT to your cart to continue.
          </p>

          <Link
            to="/"
            className="mt-6 inline-flex rounded-lg border px-5 py-3 font-medium"
          >
            Back to marketplace
          </Link>
        </div>
      </main>
    )
  }

  const subtotal = addEth(
    ...items.map((item) =>
      multiplyEth(
        item.nft.priceEth,
        item.quantity,
      ),
    ),
  )

  const quote = quoteQuery.quote

  const updateQuantity = async (
    nftId: string,
    quantity: number,
  ) => {
    if (quantity < 1) {
      return
    }

    const item = items.find(
      (cartItem) => cartItem.nftId === nftId,
    )

    if (!item) {
      return
    }

    if (
      quantity >
      item.nft.availableQuantity
    ) {
      return
    }

    await cart.updateCartItem({
      nftId,
      quantity,
    })
  }

  const handleApplyCoupon = async () => {
    const normalizedCoupon =
      coupon.trim()

    if (!normalizedCoupon) {
      return
    }

    try {
      await quoteQuery.createQuote({
        items: items.map((item) => ({
          nftId: item.nftId,
          quantity: item.quantity,
        })),
        coupon: normalizedCoupon,
      })

      setAppliedCoupon(normalizedCoupon)
    } catch {
      setAppliedCoupon('')
    }
  }

  const handleRemoveCoupon = async () => {
    setAppliedCoupon('')
    setCoupon('')

    await quoteQuery.createQuote({
      items: items.map((item) => ({
        nftId: item.nftId,
        quantity: item.quantity,
      })),
    })
  }

  const cartError =
    cart.updateError ??
    cart.removeError

  const getCouponErrorMessage = () => {
    const error = quoteQuery.error

    if (
      !axios.isAxiosError<QuoteErrorResponse>(
        error,
      )
    ) {
      if (error) {
        return 'Unable to calculate the quote. Please try again.'
      }

      return null
    }

    const code =
      error.response?.data?.code

    if (
      code === 'COUPON_EXPIRED'
    ) {
      return 'This coupon has expired.'
    }

    if (
      code === 'COUPON_INVALID'
    ) {
      return 'This coupon is invalid.'
    }

    if (
      error.response?.status === 409
    ) {
      return 'The availability of an item in your cart has changed.'
    }

    return 'Unable to calculate the quote. Please try again.'
  }

  const couponError =
    getCouponErrorMessage()

  return (
    <main className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold">
          Shopping cart
        </h1>

        <p className="mt-2 text-gray-500">
          Review your NFTs before continuing
          to checkout.
        </p>
      </div>

      {cartError && (
        <div
          role="alert"
          className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Unable to update your cart. Please try again.
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          {items.map((item) => {
            const canIncrease =
              item.quantity <
              item.nft.availableQuantity

            return (
              <article
                key={item.nftId}
                className="rounded-xl border p-4"
              >
                <div className="flex gap-4">
                  <img
                    src={item.nft.imageUrl}
                    alt={item.nft.name}
                    className="h-24 w-24 rounded-lg object-cover"
                  />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {item.nft.collection}
                        </p>

                        <h2 className="mt-1 font-semibold">
                          {item.nft.name}
                        </h2>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          void cart.removeCartItem(
                            item.nftId,
                          )
                        }}
                        disabled={
                          cart.isRemoving
                        }
                        className="text-sm text-gray-500 underline disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          Unit price
                        </p>

                        <p className="font-medium">
                          {item.nft.priceEth} ETH
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Quantity
                        </p>

                        <div className="mt-1 flex w-fit items-center rounded-lg border">
                          <button
                            type="button"
                            onClick={() => {
                              void updateQuantity(
                                item.nftId,
                                item.quantity - 1,
                              )
                            }}
                            disabled={
                              item.quantity <= 1 ||
                              cart.isUpdating
                            }
                            className="px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Decrease quantity of ${item.nft.name}`}
                          >
                            −
                          </button>

                          <span
                            className="min-w-10 text-center"
                            aria-label={`Quantity of ${item.nft.name}`}
                          >
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              void updateQuantity(
                                item.nftId,
                                item.quantity + 1,
                              )
                            }}
                            disabled={
                              !canIncrease ||
                              cart.isUpdating
                            }
                            className="px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label={`Increase quantity of ${item.nft.name}`}
                          >
                            +
                          </button>
                        </div>

                        <p className="mt-1 text-xs text-gray-500">
                          {item.nft.availableQuantity}{' '}
                          available
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-sm text-gray-500">
                          Item total
                        </p>

                        <p className="font-semibold">
                          {multiplyEth(
                            item.nft.priceEth,
                            item.quantity,
                          )}{' '}
                          ETH
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            )
          })}
        </section>

        <aside className="h-fit rounded-xl border p-6">
          <h2 className="text-xl font-semibold">
            Order summary
          </h2>

          <div className="mt-6">
            <label
              htmlFor="coupon"
              className="text-sm font-medium"
            >
              Coupon
            </label>

            <div className="mt-2 flex gap-2">
              <input
                id="coupon"
                type="text"
                value={coupon}
                onChange={(event) => {
                  setCoupon(
                    event.target.value,
                  )
                }}
                placeholder="Enter coupon"
                disabled={
                  quoteQuery.isCreating
                }
                className="min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none focus:ring-2"
              />

              {appliedCoupon ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleRemoveCoupon()
                  }}
                  disabled={
                    quoteQuery.isCreating
                  }
                  className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    void handleApplyCoupon()
                  }}
                  disabled={
                    quoteQuery.isCreating ||
                    !coupon.trim()
                  }
                  className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Apply
                </button>
              )}
            </div>

            {appliedCoupon && (
              <p className="mt-2 text-sm text-gray-500">
                Coupon "{appliedCoupon}"
                applied.
              </p>
            )}

            {couponError && (
              <div
                role="alert"
                className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {couponError}
              </div>
            )}
          </div>

          <div className="mt-6 space-y-3 border-t pt-6 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Subtotal
              </span>

              <span>
                {quote?.subtotalEth ??
                  subtotal}{' '}
                ETH
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Discount
              </span>

              <span>
                {quote?.discountEth ??
                  '0.00000000'}{' '}
                ETH
              </span>
            </div>

            <div className="flex justify-between gap-4">
              <span className="text-gray-500">
                Network fee
              </span>

              <span>
                {quote?.networkFeeEth ??
                  '0.00000000'}{' '}
                ETH
              </span>
            </div>

            <div className="flex justify-between gap-4 border-t pt-4 text-base font-semibold">
              <span>Total</span>

              <span>
                {quote?.totalEth ??
                  subtotal}{' '}
                ETH
              </span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="mt-6 flex w-full items-center justify-center rounded-lg border px-6 py-3 font-medium"
          >
            Continue to checkout
          </Link>
        </aside>
      </div>
    </main>
  )
}
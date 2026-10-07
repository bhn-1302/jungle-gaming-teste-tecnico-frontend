import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getCart,
  removeCartItem,
  updateCartItem,
} from '../services/cart.service'
import type { ApiCartItem } from '../contracts'
import { queryKeys } from '../query-keys'
import {
  CURRENT_QUOTE_KEY,
} from './use-quote'
import { useSession } from './use-session'

export function useCart() {
  const queryClient = useQueryClient()

  const { data: user } = useSession()
  const userId = user?.id

  const cartQueryKey = userId
    ? [...queryKeys.cart, userId]
    : [...queryKeys.cart, 'anonymous']

  const cartQuery = useQuery({
    queryKey: cartQueryKey,
    queryFn: getCart,
    enabled: Boolean(userId),
  })

  const clearCurrentQuote = () => {
    queryClient.setQueryData<ApiCartItem[] | null>(
      CURRENT_QUOTE_KEY,
      null,
    )
  }

  const updateMutation = useMutation({
    mutationFn: updateCartItem,

    onMutate: async (updatedItem) => {
      if (!userId) {
        return { previousCart: undefined }
      }

      await queryClient.cancelQueries({
        queryKey: cartQueryKey,
      })

      const previousCart =
        queryClient.getQueryData<ApiCartItem[]>(
          cartQueryKey,
        )

      queryClient.setQueryData<ApiCartItem[]>(
        cartQueryKey,
        (currentCart) => {
          if (!currentCart) {
            return currentCart
          }

          return currentCart.map((item) => {
            if (item.nftId !== updatedItem.nftId) {
              return item
            }

            return {
              ...item,
              quantity: updatedItem.quantity,
            }
          })
        },
      )

      clearCurrentQuote()

      return { previousCart }
    },

    onError: (_error, _updatedItem, context) => {
      if (!context?.previousCart) {
        return
      }

      queryClient.setQueryData(
        cartQueryKey,
        context.previousCart,
      )
    },

    onSettled: () => {
      if (!userId) {
        return
      }

      void queryClient.invalidateQueries({
        queryKey: cartQueryKey,
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeCartItem,

    onSuccess: () => {
      clearCurrentQuote()

      if (!userId) {
        return
      }

      void queryClient.invalidateQueries({
        queryKey: cartQueryKey,
      })
    },
  })

  return {
    ...cartQuery,
    updateCartItem: updateMutation.mutateAsync,
    removeCartItem: removeMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    isRemoving: removeMutation.isPending,
    updateError: updateMutation.error,
    removeError: removeMutation.error,
  }
}
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createOrder,
  getOrder,
  getOrders,
} from '../services/order.service'
import { queryKeys } from '../query-keys'
import { useSession } from './use-session'

export function useOrders() {
  const queryClient = useQueryClient()
  const { data: user } = useSession()

  const userId = user?.id

  const ordersQueryKey = userId
    ? [...queryKeys.orders, userId]
    : [...queryKeys.orders, 'anonymous']

  const ordersQuery = useQuery({
    queryKey: ordersQueryKey,
    queryFn: getOrders,
    enabled: Boolean(userId),
  })

  const createMutation = useMutation({
    mutationFn: createOrder,

    onSuccess: (order) => {
      if (!userId) {
        return
      }

      queryClient.setQueryData(
        [...queryKeys.order(order.id), userId],
        order,
      )

      queryClient.invalidateQueries({
        queryKey: ordersQueryKey,
      })
    },
  })

  return {
    ...ordersQuery,
    createOrder: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
  }
}

export function useOrder(orderId: string) {
  const { data: user } = useSession()

  const userId = user?.id

  const orderQueryKey = userId
    ? [...queryKeys.order(orderId), userId]
    : [...queryKeys.order(orderId), 'anonymous']

  return useQuery({
  queryKey: orderQueryKey,
  queryFn: () => getOrder(orderId),
  enabled: Boolean(userId && orderId),
  refetchInterval: (query) => {
    const status = query.state.data?.status

    if (
      status === 'confirmed' ||
      status === 'rejected'
    ) {
      return false
    }

    return 2000
  },
  refetchOnReconnect: true,
})
}
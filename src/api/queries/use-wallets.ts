import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createWallet,
  getWallets,
  removeWallet,
} from '../services/wallet.service'
import { queryKeys } from '../query-keys'
import { useSession } from './use-session'

export function useWallets() {
  const queryClient = useQueryClient()
  const { data: user } = useSession()

  const userId = user?.id

  const walletsQueryKey = userId
    ? [...queryKeys.wallets, userId]
    : [...queryKeys.wallets, 'anonymous']

  const walletsQuery = useQuery({
    queryKey: walletsQueryKey,
    queryFn: getWallets,
    enabled: Boolean(userId),
  })

  const createMutation = useMutation({
    mutationFn: createWallet,

    onSuccess: () => {
      if (!userId) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: walletsQueryKey,
      })
    },
  })

  const removeMutation = useMutation({
    mutationFn: removeWallet,

    onSuccess: () => {
      if (!userId) {
        return
      }

      queryClient.invalidateQueries({
        queryKey: walletsQueryKey,
      })
    },
  })

  return {
    ...walletsQuery,
    createWallet: createMutation.mutateAsync,
    removeWallet: removeMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isRemoving: removeMutation.isPending,
  }
}
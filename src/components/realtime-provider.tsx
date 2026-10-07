import {
  useEffect,
  type PropsWithChildren,
} from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { queryKeys } from '../api/query-keys'
import {
  startRealtime,
  stopRealtime,
} from '../mocks/socket/realtimeManager'

export function RealtimeProvider({
  children,
}: PropsWithChildren) {
  const queryClient = useQueryClient()

  useEffect(() => {
    startRealtime({
      onNftUpdated: (event) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.nfts(),
        })

        void queryClient.invalidateQueries({
          queryKey: queryKeys.nft(event.id),
        })
      },

      onOrderUpdated: (event) => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.orders,
        })

        void queryClient.invalidateQueries({
          queryKey: queryKeys.order(event.id),
        })
      },

      onReconnect: () => {
        void queryClient.invalidateQueries({
          queryKey: queryKeys.nfts(),
        })

        void queryClient.invalidateQueries({
          queryKey: queryKeys.orders,
        })

        void queryClient.invalidateQueries({
          queryKey: queryKeys.cart,
        })
      },
    })

    return () => {
      stopRealtime()
    }
  }, [queryClient])

  return children
}
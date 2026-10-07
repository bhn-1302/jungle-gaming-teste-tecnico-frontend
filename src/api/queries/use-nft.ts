import { useQuery } from '@tanstack/react-query'

import { getNft } from '../services/nft.service'
import { queryKeys } from '../query-keys'

export function useNft(nftId: string) {
  return useQuery({
    queryKey: queryKeys.nft(nftId),
    queryFn: () => getNft(nftId),
    enabled: Boolean(nftId),
  })
}
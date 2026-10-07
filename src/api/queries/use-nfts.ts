import { useQuery } from '@tanstack/react-query'

import {
  getNfts,
  type NftListParams,
} from '../services/nft.service'
import { queryKeys } from '../query-keys'

export function useNfts(
  params: NftListParams = {},
) {
  return useQuery({
    queryKey: queryKeys.nfts(params),
    queryFn: () => getNfts(params),
  })
}
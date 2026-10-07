import { createFileRoute } from '@tanstack/react-router'

import { NftDetailPage } from './-nft-detail-page'

export const Route = createFileRoute('/nft/$nftId')({
  component: NftDetailPage
})
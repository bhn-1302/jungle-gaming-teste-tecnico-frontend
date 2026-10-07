export const queryKeys = {
  session: ['session'] as const,

  nfts: (params: unknown = {}) =>
    ['nfts', params] as const,

  nft: (nftId: string) =>
    ['nft', nftId] as const,

  favorites: ['favorites'] as const,

  cart: ['cart'] as const,

  profile: ['profile'] as const,

  wallets: ['wallets'] as const,

  orders: ['orders'] as const,

  order: (orderId: string) =>
    ['order', orderId] as const,

  quote: (quoteId: string) =>
  ['quote', quoteId] as const,
}
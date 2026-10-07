export type ApiUser = {
    id: string
    name: string
    email: string
    avatarUrl: string | null
}

export type ApiSessionResponse = {
    user: ApiUser
    token?: string
}

export type ApiRegistrationResponse = {
  user: ApiUser
  token: string
}

export type ApiNft = {
    id: string
    name: string
    description: string
    imageUrl: string
    creator: string
    collection: string
    priceEth: string
    availableQuantity: number
    edition: number
    maxEdition: number
    version: number
}

export type ApiNftListResponse = {
    items: ApiNft[]
    page: number
    limit: number
    total: number
    totalPages: number
}

export type ApiFavorite = {
    userId: string
    nftId: string
}

export type ApiFavoritesResponse = {
    items: ApiFavorite[]
}

export type ApiCartItem = {
    userId: string
    nftId: string
    quantity: number
    nft: ApiNft
}

export type ApiCartResponse = {
    items: ApiCartItem[]
}

export type ApiProfile = {
    userId: string
    displayName: string
    bio: string
}

export type ApiWallet = {
    id: string
    userId: string
    address: string
    network: string
    label: string
}

export type ApiWalletsResponse = {
    items: ApiWallet[]
}

export type ApiQuoteItem = {
    nftId: string
    quantity: number
    unitPriceEth: string
}

export type ApiQuote = {
    id: string
    userId: string
    items: ApiQuoteItem[]
    coupon?: string
    subtotalEth: string
    discountEth: string
    networkFeeEth: string
    totalEth: string
    version: number
    expiresAt: string
}

export type ApiOrderStatus = 
    | 'pending'
    | 'confirmed'
    | 'rejected'

export type ApiOrderItem = {
    nftId: string
    name: string
    quantity: number
    unitPriceEth: string
}

export type ApiOrder = {
    id: string
    userId: string
    status: ApiOrderStatus
    items: ApiOrderItem[]
    subtotalEth: string
    discountEth: string
    networkFeeEth: string
    totalEth: string
    transactionId: string | null
    idempotencyKey: string
    version: number
}

export type ApiOrdersResponse = {
    items: ApiOrder[]
}

export type ApiErrorResponse = {
    message: string
}
export type MockQuote = {
  id: string
  userId: string
  items: {
    nftId: string
    quantity: number
    unitPriceEth: string
  }[]
  subtotalEth: string
  discountEth: string
  networkFeeEth: string
  totalEth: string
  version: number
  expiresAt: string
}

export const quotes: MockQuote[] = []
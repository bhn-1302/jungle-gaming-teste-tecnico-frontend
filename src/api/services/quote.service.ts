import { apiClient } from '../client'
import type { ApiQuote } from '../contracts'

export type CreateQuoteRequest = {
  items: Array<{
    nftId: string
    quantity: number
  }>
  coupon?: string
}

export async function createQuote(
  data: CreateQuoteRequest,
): Promise<ApiQuote> {
  const response = await apiClient.post<ApiQuote>(
    '/quote',
    data,
  )

  return response.data
}
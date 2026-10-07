import { apiClient } from '../client'
import type {
  ApiCartItem,
  ApiCartResponse,
} from '../contracts'

export type UpdateCartItemRequest = {
  nftId: string
  quantity: number
}

export async function getCart(): Promise<ApiCartItem[]> {
  const response =
    await apiClient.get<ApiCartResponse>('/cart')

  return response.data.items
}

export async function updateCartItem(
  data: UpdateCartItemRequest,
): Promise<void> {
  await apiClient.post('/cart/items', data)
}

export async function removeCartItem(
  nftId: string,
): Promise<void> {
  await apiClient.delete(`/cart/items/${nftId}`)
}
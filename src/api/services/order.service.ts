import { apiClient } from '../client'
import type {
  ApiOrder,
  ApiOrdersResponse,
} from '../contracts'

export type CreateOrderRequest = {
  quoteId: string
  idempotencyKey: string
}

export async function getOrders(): Promise<
  ApiOrder[]
> {
  const response =
    await apiClient.get<ApiOrdersResponse>('/orders')

  return response.data.items
}

export async function getOrder(
  orderId: string,
): Promise<ApiOrder> {
  const response = await apiClient.get<ApiOrder>(
    `/orders/${orderId}`,
  )

  return response.data
}

export async function createOrder(
  data: CreateOrderRequest,
): Promise<ApiOrder> {
  const response = await apiClient.post<ApiOrder>(
    '/orders',
    data,
  )

  return response.data
}
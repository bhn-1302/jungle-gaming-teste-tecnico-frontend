import { apiClient } from '../client'
import type {
  ApiWallet,
  ApiWalletsResponse,
} from '../contracts'

export type CreateWallRequest = {
    address: string
    network: string
    label: string
}

export async function getWallets(): Promise<
    ApiWallet[]
> {
    const response = 
        await apiClient.get<ApiWalletsResponse>(
            '/wallets',
        )

        return response.data.items
}

export async function createWallet(
    data: CreateWallRequest,
): Promise<ApiWallet> {
    const response = 
        await apiClient.post<ApiWallet>(
            '/wallet',
            data,
        )

        return response.data
}

export async function removeWallet(
    walletId: string,
): Promise<void> {
    await apiClient.delete(`/wallets/${walletId}`)
}
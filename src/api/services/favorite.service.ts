import { apiClient } from '../client'
import type {
  ApiFavorite,
  ApiFavoritesResponse,
} from '../contracts'

export async function getFavorites(): Promise<
ApiFavorite[]
> {
    const response = 
    await apiClient.get<ApiFavoritesResponse>(
        '/favorites',
    )

    return response.data.items
}

export async function addFavorite(
    nftId: string,
): Promise<ApiFavorite> {
    const response = await apiClient.post<{
        success: boolean
        favorite: ApiFavorite
    }>(`/favorites/${nftId}`)

    return response.data.favorite
}

export async function removeFavorite(
    nftId: string,
): Promise<void> {
    await apiClient.delete(`/favorites/${nftId}`)
}
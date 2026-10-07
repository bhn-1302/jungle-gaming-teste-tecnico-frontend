import { apiClient } from "../client";
import type {
    ApiNft,
    ApiNftListResponse, 
} from '../contracts'

export type NftListParams = {
    search?: string
    collection?: string
    sort?: string
    page?: number
    limit?: number
}

export async function getNfts(
    params: NftListParams = {},
): Promise<ApiNftListResponse> {
    const response = await apiClient.get<ApiNftListResponse>(
        '/nfts',
        {
            params,
        },
    )

    return response.data
}

export async function getNft(
    nftId: string,
): Promise<ApiNft> {
    const response = await apiClient.get<ApiNft>(
        `/nfts/${nftId}`,
    )

    return response.data
}
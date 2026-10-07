import { apiClient } from "../client";
import type { ApiProfile } from "../contracts";

export type UpdateProfileRequest = {
    displayName?: string
    bio?: string
}

export async function getProfile(): Promise<ApiProfile> {
    const response = 
    await apiClient.get<ApiProfile>('/profile')

    return response.data
}

export async function updateProfile(
    data: UpdateProfileRequest,
): Promise<ApiProfile> {
    const response = 
    await apiClient.patch<ApiProfile>(
        '/profile',
        data,
    )

    return response.data
}
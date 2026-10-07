const AUTH_TOKEN_KEY = 'nft-marketplace-auth-token'

export function getAuthToken(): string | null {
    return sessionStorage.getItem(AUTH_TOKEN_KEY)
}

export function setAuthToken(token: string): void {
    sessionStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearAuthToken(): void {
    sessionStorage.removeItem(AUTH_TOKEN_KEY)
}


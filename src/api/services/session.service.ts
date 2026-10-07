import { apiClient } from '../client'
import type {
  ApiRegistrationResponse,
  ApiSessionResponse,
  ApiUser,
} from '../contracts'

export type LoginRequest = {
  email: string
  password: string
}

export type RegisterRequest = {
  name: string
  email: string
  password: string
}

export async function login(
  data: LoginRequest,
): Promise<ApiSessionResponse> {
  const response = await apiClient.post<ApiSessionResponse>(
    '/session/login',
    data,
  )

  return response.data
}

export async function register(
  data: RegisterRequest,
): Promise<ApiRegistrationResponse> {
  const response =
    await apiClient.post<ApiRegistrationResponse>(
      '/session/register',
      data,
    )

  return response.data
}

export async function getSession(): Promise<ApiUser> {
  const response = await apiClient.get<ApiSessionResponse>(
    '/session',
  )

  return response.data.user
}

export async function logout(): Promise<void> {
  await apiClient.post('/session/logout')
}
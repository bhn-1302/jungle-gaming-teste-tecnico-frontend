import axios from 'axios'

import type { ApiErrorResponse } from './contracts'

export type ApiError = {
  status: number | null
  message: string
}

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return {
      status: error.response?.status ?? null,
      message:
        error.response?.data?.message ??
        'Unexpected API error',
    }
  }

  if (error instanceof Error) {
    return {
      status: null,
      message: error.message,
    }
  }

  return {
    status: null,
    message: 'Unexpected error',
  }
}
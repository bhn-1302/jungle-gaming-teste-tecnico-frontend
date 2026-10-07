import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createQuote,
  type CreateQuoteRequest,
} from '../services/quote.service'
import type { ApiQuote } from '../contracts'
import { queryKeys } from '../query-keys'

export const CURRENT_QUOTE_KEY = [
  'quote',
  'current',
] as const

export function useQuote(quoteId?: string) {
  const queryClient = useQueryClient()

  const quoteQuery = useQuery<ApiQuote | null>({
    queryKey: quoteId
      ? queryKeys.quote(quoteId)
      : CURRENT_QUOTE_KEY,

    queryFn: async () => {
      if (!quoteId) {
        return (
          queryClient.getQueryData<ApiQuote>(
            CURRENT_QUOTE_KEY,
          ) ?? null
        )
      }

      return (
        queryClient.getQueryData<ApiQuote>(
          queryKeys.quote(quoteId),
        ) ?? null
      )
    },

    enabled: Boolean(quoteId),

    initialData: quoteId
      ? undefined
      : null,

    staleTime: Infinity,
  })

  const createMutation = useMutation({
    mutationFn: (
      data: CreateQuoteRequest,
    ) => createQuote(data),

    onSuccess: (quote) => {
      queryClient.setQueryData<ApiQuote>(
        queryKeys.quote(quote.id),
        quote,
      )

      queryClient.setQueryData<ApiQuote>(
        CURRENT_QUOTE_KEY,
        quote,
      )
    },
  })

  return {
    quote: quoteQuery.data ?? null,

    createQuote: createMutation.mutateAsync,

    isCreating: createMutation.isPending,

    isLoadingQuote: quoteQuery.isLoading,

    error:
      quoteQuery.error ??
      createMutation.error,

    isError:
      quoteQuery.isError ||
      createMutation.isError,

    reset: createMutation.reset,
  }
}
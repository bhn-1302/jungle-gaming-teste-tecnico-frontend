import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getProfile,
  updateProfile,
} from '../services/profile.service'
import { queryKeys } from '../query-keys'
import { useSession } from './use-session'

export function useProfile() {
  const queryClient = useQueryClient()
  const { data: user } = useSession()

  const userId = user?.id

  const profileQueryKey = userId
    ? [...queryKeys.profile, userId]
    : [...queryKeys.profile, 'anonymous']

  const profileQuery = useQuery({
    queryKey: profileQueryKey,
    queryFn: getProfile,
    enabled: Boolean(userId),
  })

  const updateMutation = useMutation({
    mutationFn: updateProfile,

    onSuccess: (profile) => {
      if (!userId) {
        return
      }

      queryClient.setQueryData(
        profileQueryKey,
        profile,
      )
    },
  })

  return {
    ...profileQuery,
    updateProfile: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
  }
}
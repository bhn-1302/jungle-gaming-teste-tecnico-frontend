import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
} from "../services/favorite.service";
import { queryKeys } from "../query-keys";
import { useSession } from "./use-session";

export function useFavorites() {
  const queryClient = useQueryClient();
  const { data: user } = useSession();
  const userId = user?.id;

  const favoritesQueryKey = userId
    ? [...queryKeys.favorites, userId]
    : [...queryKeys.favorites, "anonymous"];

  const favoritesQuery = useQuery({
    queryKey: favoritesQueryKey,
    queryFn: getFavorites,
    enabled: Boolean(userId),
  });

  const addMutation = useMutation({
  mutationFn: addFavorite,
  onSuccess: () => {
    if (!userId) {
      return
    }

    void queryClient.invalidateQueries({
      queryKey: favoritesQueryKey,
    })
  },
})

  const removeMutation = useMutation({
    mutationFn: removeFavorite,
    onSuccess: () => {
      if (!userId) {
        return;
      }

      void queryClient.invalidateQueries({
        queryKey: favoritesQueryKey,
      });
    },
  });

  return {
    ...favoritesQuery,
    addFavorite: addMutation.mutateAsync,
    removeFavorite: removeMutation.mutateAsync,
    isAdding: addMutation.isPending,
    isRemoving: removeMutation.isPending,
    addError: addMutation.error,
    removeError: removeMutation.error,
  };
}

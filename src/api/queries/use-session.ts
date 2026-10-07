import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getSession,
  login,
  logout,
  register,
  type LoginRequest,
  type RegisterRequest,
} from "../services/session.service";
import { clearAuthToken, getAuthToken, setAuthToken } from "../auth-token";
import { queryKeys } from "../query-keys";

export function useSession() {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: queryKeys.session,
    queryFn: getSession,
    enabled: Boolean(getAuthToken()),
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginRequest) => {
      const response = await login(data);

      if (!response.token) {
        throw new Error("Login response did not contain a token");
      }

      setAuthToken(response.token);
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session, user);
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterRequest) => {
      const response = await register(data);

      if (!response.token) {
        throw new Error("Registration response did not contain a token");
      }

      setAuthToken(response.token);
      return response.user;
    },
    onSuccess: (user) => {
      queryClient.clear();
      queryClient.setQueryData(queryKeys.session, user);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.clear();
      clearAuthToken();
    },
  });

  return {
    ...sessionQuery,

    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,

    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,

    isAuthenticated: Boolean(getAuthToken()),
  };
}

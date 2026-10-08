import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { AuthUser } from '@shared/types';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api<{ user: AuthUser }>('/auth/me'),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { email: string; password: string }) =>
      api<{ user: AuthUser }>('/auth/login', { method: 'POST', body: JSON.stringify(input) }),
    onSuccess: (data) => queryClient.setQueryData(['me'], data),
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api<{ ok: boolean }>('/auth/logout', { method: 'POST' }),
    onSuccess: () => queryClient.removeQueries({ queryKey: ['me'] }),
  });
}
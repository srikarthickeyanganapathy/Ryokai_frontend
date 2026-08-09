import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000, // 15 seconds — data considered fresh for this duration
      gcTime: 300000, // 5 minutes — keep inactive cache for quick re-mount
      retry: 1,
      refetchOnWindowFocus: false, // Redundant — STOMP real-time + polling cover freshness
      retryOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

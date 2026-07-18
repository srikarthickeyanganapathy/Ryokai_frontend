import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000, // 15 seconds — data considered fresh for this duration
      gcTime: 300000, // 5 minutes — keep inactive cache for quick re-mount
      retry: 1,
      refetchOnWindowFocus: true, // Re-fetch when user switches back to tab
      retryOnMount: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

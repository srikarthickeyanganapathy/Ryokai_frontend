import { QueryClient } from '@tanstack/react-query'

// NOTE: This file is NOT used by the app. The actual QueryClient is in @/lib/queryClient.
// Keeping this file in sync for reference. See src/lib/queryClient.js for the active config.

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 15000,
      gcTime: 300000,
      retry: 1,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      throwOnError: false, 
    },
    mutations: {
      retry: 0,
      throwOnError: false,
    },
  },
})

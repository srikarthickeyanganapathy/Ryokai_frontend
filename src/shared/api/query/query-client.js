import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 5 minutes
      staleTime: 5 * 60 * 1000, 
      
      // Keep unused data in cache for 30 minutes
      gcTime: 30 * 60 * 1000, 
      
      // Retry failing requests exactly once
      retry: 1, 
      
      // Don't refetch every time the user tabs back to the app
      refetchOnWindowFocus: false,
      
      // In a strict enterprise app, we want predictable fetching
      refetchOnMount: true,
      
      // Global error boundary handling (Phase 2 integration)
      throwOnError: false, 
    },
    mutations: {
      retry: 0, // Never retry mutations automatically to prevent duplicate actions
      throwOnError: false,
    },
  },
})

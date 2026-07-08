import { useQuery } from '@tanstack/react-query'
import { workspaceAPI } from './api'
import { useDashboardStats as useAnalyticsDashboardStats } from '@/features/analytics/hooks/useDashboard'

// Delegates to centralized analytics hook (was a duplicate with different query key)
export const useDashboardStats = () => {
  return useAnalyticsDashboardStats()
}


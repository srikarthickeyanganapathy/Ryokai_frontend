import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { queryKeys } from '@/lib/queryKeys';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: queryKeys.dashboard.stats(),
    queryFn: () => dashboardApi.getDashboardStats(),
    staleTime: 30000, // Stats don't need instant refresh
  });
};

export const useDashboardActivity = (params = { page: 0, size: 10 }) => {
  return useQuery({
    queryKey: queryKeys.dashboard.activity(params),
    queryFn: () => dashboardApi.getDashboardActivity(params),
    select: (data) => data?.content || data || [],
    staleTime: 15000,
  });
};

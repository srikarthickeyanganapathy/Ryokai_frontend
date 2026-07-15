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

export const useTaskActivity = (taskId, params = { page: 0, size: 10 }) => {
  return useQuery({
    queryKey: [...queryKeys.dashboard.all, 'activity', 'task', taskId, { params }],
    queryFn: () => dashboardApi.getTaskActivity(taskId, params),
    select: (data) => data?.content || data || [],
    enabled: !!taskId,
    staleTime: 15000,
  });
};

export const useExportActivity = () => {
  return useMutation({
    mutationFn: (params) => dashboardApi.exportActivity(params),
  });
};


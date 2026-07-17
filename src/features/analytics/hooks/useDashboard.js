import { useQuery, useMutation } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { queryKeys } from '@/lib/queryKeys';

import { useWorkspace } from '@/context/WorkspaceContext';

export const useDashboardStats = () => {
  const { workspaceMode, activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;

  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), workspaceMode, orgId],
    queryFn: () => dashboardApi.getDashboardStats({ scope: workspaceMode, orgId }),
    staleTime: 30000,
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


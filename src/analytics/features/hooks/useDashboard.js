import { useQuery, useMutation } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';

import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export const useDashboardStats = (customParams = {}) => {
  const { workspaceMode, activeOrganization } = useWorkspace();
  const scope = customParams.scope || workspaceMode;
  const orgId = customParams.orgId !== undefined ? customParams.orgId : (scope === 'ORG' ? activeOrganization?.id : undefined);
  const crewId = customParams.crewId;

  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), scope, orgId, crewId],
    queryFn: () => dashboardApi.getDashboardStats({ scope, orgId, crewId }),
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


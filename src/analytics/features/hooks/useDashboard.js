import { useQuery } from '@tanstack/react-query';
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



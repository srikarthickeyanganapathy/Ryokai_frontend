import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';

import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export const useDashboardStats = (customParams = {}) => {
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace();
  
  const hasCustomScope = !!customParams.scope;
  const rawScope = hasCustomScope ? customParams.scope : workspaceMode;
  
  const orgId = hasCustomScope ? customParams.orgId : (rawScope === 'ORG' ? activeOrganization?.id : undefined);
  const crewId = hasCustomScope ? customParams.crewId : (rawScope === 'CREWS' ? activeCrew?.id : undefined);

  // Do not fall back to personal if a scoped id is missing (e.g. during workspace switch).
  // Instead, disable the query until the id resolves.
  const isReady = (rawScope === 'ORG' ? !!orgId && orgId !== 'pending' : rawScope === 'CREWS' ? !!crewId && crewId !== 'pending' : true);

  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), rawScope, orgId, crewId],
    queryFn: () => dashboardApi.getDashboardStats({ ...(rawScope ? { scope: rawScope } : {}), orgId, crewId }),
    staleTime: 30000,
    enabled: isReady,
  });
};


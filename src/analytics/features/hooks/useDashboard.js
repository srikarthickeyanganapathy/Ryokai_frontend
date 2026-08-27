import { useQuery } from '@tanstack/react-query';
import * as dashboardApi from '../api/dashboard.api';
import { queryKeys } from '@/shared/api/queryKeys';

import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export const useDashboardStats = (customParams = {}) => {
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace();
  const rawScope = customParams.scope || workspaceMode;
  const orgId = customParams.orgId !== undefined ? customParams.orgId : (rawScope === 'ORG' ? activeOrganization?.id : undefined);
  // CREWS stats need a concrete crew id — previously crewId was never derived
  // from the active workspace, so every CREWS-mode call hit the backend's
  // "Crew ID is required when scope is CREWS" validation and returned 400.
  const crewId = customParams.crewId !== undefined ? customParams.crewId : (rawScope === 'CREWS' ? activeCrew?.id : undefined);

  // The backend rejects ORG/CREWS scopes without their matching id. Only send
  // a scope when its workspace id actually resolved; otherwise drop the scope
  // so the request falls back to the personal (default) stats view.
  let scope = rawScope;
  if (scope === 'ORG' && !orgId) scope = undefined;
  if ((scope === 'CREWS' || scope === 'CREW') && !crewId) scope = undefined;

  return useQuery({
    queryKey: [...queryKeys.dashboard.stats(), scope, orgId, crewId],
    queryFn: () => dashboardApi.getDashboardStats({ ...(scope ? { scope } : {}), orgId, crewId }),
    staleTime: 30000,
  });
};



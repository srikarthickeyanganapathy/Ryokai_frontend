import { useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { useTaskList } from '@/task';

export function useMissionControlViewModel() {
  const { workspaceMode, operatingMode, activeOrganization, activeCrew } = useWorkspace();
  const queryClient = useQueryClient();

  // While an org/crew scope is still resolving (e.g. right after reload), the
  // list hook would fall back to an unscoped query and leak tasks from other
  // workspaces into Home. Suppress the fallback until the scope is ready.
  const scopeReady = !!(
    workspaceMode === 'PERSONAL' ||
    (workspaceMode === 'ORG' && activeOrganization?.id) ||
    (workspaceMode === 'CREWS' && activeCrew?.id)
  );

  const { data: taskListData } = useTaskList();
  const fallbackTasks = scopeReady ? (taskListData?.tasks || []) : [];

  const { data: context, isLoading: contextLoading, error: contextError } = useQuery({
    queryKey: [
      'mission-context',
      workspaceMode,
      activeOrganization?.id ?? null,
      activeCrew?.id ?? null,
    ],
    queryFn: async () => {
      let endpoint = '';
      if (workspaceMode === 'ORG' && activeOrganization?.id) {
        endpoint = `mission-control/organizations/${activeOrganization.id}/context`;
      } else if (workspaceMode === 'CREWS' && activeCrew?.id) {
        endpoint = `mission-control/crews/${activeCrew.id}/context`;
      } else if (workspaceMode === 'PERSONAL') {
        endpoint = `mission-control/personal/context`;
      }

      if (!endpoint) return null;

      const response = await api.get(endpoint);
      return response.data;
    },
    enabled: !!(
      workspaceMode === 'PERSONAL' || 
      (workspaceMode === 'ORG' && activeOrganization?.id) || 
      (workspaceMode === 'CREWS' && activeCrew?.id)
    )
  });

  return {
    pageState: contextLoading ? 'loading' : contextError ? 'error' : 'ready',
    context: context, // The aggregated MissionControlDTO
    fallbackTasks,
    workspaceMode,
    operatingMode,
    
    focusTask: context?.focusPanel,
    focus: context?.focusPanel,
    interrupts: context?.signalStrip?.actions || [],
    signals: context?.signalStrip?.actions || [],
    queueOrdering: context?.executionQueue?.tasks || [],
    queue: context?.executionQueue?.tasks || [],
    resumeContext: context?.resumeContext,
  };
}

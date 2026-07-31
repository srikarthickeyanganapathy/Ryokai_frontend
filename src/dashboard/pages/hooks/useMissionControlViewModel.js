import { useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/api';

export function useMissionControlViewModel() {
  const { workspaceMode, operatingMode, activeOrganization, activeCrew } = useWorkspace();
  const queryClient = useQueryClient();

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
    workspaceMode,
    operatingMode,
    
    // Fallbacks for widgets that haven't been fully refactored yet,
    // though the goal is to just pass `context` directly.
    focusTask: context?.focusPanel,
    focus: context?.focusPanel,
    interrupts: context?.signalStrip?.actions || [],
    signals: context?.signalStrip?.actions || [],
    queueOrdering: context?.executionQueue?.tasks || [],
    queue: context?.executionQueue?.tasks || [],
    resumeContext: context?.resumeContext,
  };
}

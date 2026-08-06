import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/identity';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useMissionControlViewModel } from '../pages/hooks/useMissionControlViewModel';
import { MissionControlV2 } from './MissionControlv2';
import { PageState } from '@/shared/ui/PageState';
import { PageShell } from '@/shared/ui/PageShell';

export function DashboardPage() {
  const vm = useMissionControlViewModel();
  const { user } = useAuth();
  const { workspaceMode, activeCrew, activeOrganization } = useWorkspace();
  const navigate = useNavigate();

  return (
    <PageShell workspaceMode={workspaceMode} maxWidth="wide">
      <PageState state={vm.pageState || 'ready'} moduleId="tasks">
        <MissionControlV2 {...vm} />
      </PageState>
    </PageShell>
  );
}

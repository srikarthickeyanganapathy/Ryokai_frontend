import React from 'react';
import { FocusPanel } from '../features/FocusPanel';
import { SignalStrip } from '../features/SignalStrip';
import { ExecutionQueue } from '../features/ExecutionQueue';
import { WorkloadBrief } from '../features/WorkloadBrief';
import { PersonalContextRail } from '../features/PersonalContextRail';
import { CrewContextRail } from '../features/CrewContextRail';
import { OrgContextRail } from '../features/OrgContextRail';
import { useMissionControlViewModel } from './hooks/useMissionControlViewModel';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { ModeSelector } from '../features/ModeSelector';
import { WIDGET_REGISTRY } from '../config/WidgetRegistry';
import { usePermissions } from '@/identity/features/authentication/hooks/usePermissions';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useAuth } from '@/identity';

import { DailyBriefWidget } from '../features/DailyBriefWidget';
import { AICopilotPanel } from '../features/AICopilotPanel';

const WIDGET_COMPONENTS = {
  SignalStrip,
  ExecutionQueue,
  FocusPanel,
  WorkloadBrief,
  PersonalContextRail,
  CrewContextRail,
  OrgContextRail,
  DailyBriefWidget,
  AICopilotPanel
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export function MissionControlPage() {
  const vm = useMissionControlViewModel();
  const { can } = usePermissions();
  const { activeCrew, activeOrganization } = useWorkspace();
  const { user } = useAuth();

  const activeRegistry = WIDGET_REGISTRY.filter(widget => 
    widget.workspaceModes.includes(vm.workspaceMode) && widget.visible
  );

  const renderWidgets = (placement) => {
    return activeRegistry
      .filter((widget) => widget.placement === placement)
      .sort((a, b) => a.order - b.order)
      .filter((widget) => {
        if (!widget.requiredPermissions || widget.requiredPermissions.length === 0) return true;
        return widget.requiredPermissions.every((perm) => can(perm));
      })
      .map((widget) => {
        const Component = WIDGET_COMPONENTS[widget.component];
        if (!Component) return null;
        return <Component key={widget.id} {...vm} />;
      });
  };

  const getHeaderConfig = () => {
    switch (vm.workspaceMode) {
      case 'CREWS':
        return {
          eyebrow: activeCrew ? `Crew · ${activeCrew.name}` : 'Crew Space',
          title: `${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username || ''}`,
          subtitle: activeCrew
            ? `Executing with ${activeCrew.name}. Stay in sync with your crew.`
            : 'Select a crew from the sidebar to get started.',
        };
      case 'ORG':
        return {
          eyebrow: activeOrganization ? `Organization · ${activeOrganization.name}` : 'Organization Space',
          title: 'Mission Control',
          subtitle: activeOrganization
            ? `Organization-wide overview for ${activeOrganization.name}.`
            : 'Organization-wide execution context.',
        };
      default:
        return {
          eyebrow: 'Personal Space',
          title: `${getGreeting()}, ${user?.name?.split(' ')[0] || user?.username || ''}`,
          subtitle: 'Your private execution space. Focus on what matters.',
        };
    }
  };

  const headerConfig = getHeaderConfig();

  return (
    <PageShell maxWidth="wide">
      <PageHero
        eyebrow={headerConfig.eyebrow}
        title={headerConfig.title}
        subtitle={headerConfig.subtitle}
        actions={<ModeSelector />}
      />

      <PageContent>
        <PageState
          state={vm.pageState}
          stateProps={{ loadingVariant: 'dashboard' }}
        >
          <div className="flex flex-col lg:flex-row gap-6 w-full h-full">
            {/* Primary Execution Column */}
            <div className="flex-1 flex flex-col space-y-8 min-w-0">
              {renderWidgets('header')}
              {renderWidgets('primary')}
            </div>

            {/* Context Rail Column */}
            <div className="w-full lg:w-80 flex-shrink-0">
              {renderWidgets('context')}
            </div>
          </div>
        </PageState>
      </PageContent>
    </PageShell>
  );
}

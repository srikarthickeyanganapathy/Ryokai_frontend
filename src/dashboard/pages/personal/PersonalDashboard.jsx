import React from 'react';
import { usePersonalDashboardViewModel } from './hooks/usePersonalDashboardViewModel';
import { RecommendationHero, Agenda, ExecutionQueue, Projects, MyWork, Insights, Capture } from '@/dashboard';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  WorkspaceShell,
  CommandLayout,
  PageStateContainer,
} from '@/shared/workspace-framework';

export default function PersonalDashboard() {
  const vm = usePersonalDashboardViewModel();

  const pageState = vm.isLoading ? 'loading' : 'ready';

  return (
    <WorkspaceShell maxWidth="wide">
      <CommandLayout
        hero={
          <PageHeader
            eyebrow="Personal"
            title="Good morning."
            subtitle="Here's your personal overview."
          />
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'dashboard' }}
        >
          {/* Hero: Orchestrated recommendation */}
          <RecommendationHero recommendation={vm.recommendation} />

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column (Main content) */}
            <div className="lg:col-span-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExecutionQueue queueGroups={vm.executionQueueGroups} />
                <MyWork groups={vm.myWorkGroups} />
              </div>
              
              <Projects overview={vm.projectOverview} />
            </div>

            {/* Right Column (Sidebar-like content) */}
            <div className="lg:col-span-4 space-y-6">
              <Agenda agenda={vm.agenda} />
              <Capture />
              <Insights summary={vm.todaySummary} />
            </div>
          </div>
        </PageStateContainer>
      </CommandLayout>
    </WorkspaceShell>
  );
}

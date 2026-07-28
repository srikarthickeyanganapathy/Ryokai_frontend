import React from 'react';
import { usePersonalDashboardViewModel } from './hooks/usePersonalDashboardViewModel';
import { RecommendationHero, Agenda, ExecutionQueue, Projects, MyWork, Insights, Capture } from '@/dashboard';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Heading, Text } from '@/shared/ui/Typography';

export default function PersonalDashboard() {
  const vm = usePersonalDashboardViewModel();

  if (vm.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      
      {/* Header section (greeting could go here, omitting for now as topbar/sidebar provide context) */}
      <div className="mb-6">
        <Heading level={2}>Good morning.</Heading>
        <Text variant="muted">Here's your personal overview.</Text>
      </div>

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
    </div>
  );
}

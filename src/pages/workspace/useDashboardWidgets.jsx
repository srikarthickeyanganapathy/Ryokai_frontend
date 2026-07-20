import React from 'react';
import { FocusWidget } from '@/features/focus/components/FocusWidget';
import { TodayProgressWidget } from '@/widgets/workspace/TodayProgressWidget';
import { TaskTimelineWidget } from '@/widgets/workspace/TaskTimelineWidget';
import { ChecklistProgressWidget } from '@/widgets/workspace/ChecklistProgressWidget';
import { ProjectsOverview } from '@/widgets/workspace/ProjectsOverview';
import { WorkloadMatrix } from '@/features/analytics/components/Charts';
import { RecentTasksList } from '@/widgets/workspace/RecentTasksList';
import { UpcomingDeadlines } from '@/widgets/workspace/UpcomingDeadlines';

export function useDashboardWidgets(workspaceMode) {
  
  if (workspaceMode === 'PERSONAL') {
    return [
      { id: 'focus', Component: FocusWidget, span: 'col-span-1 md:col-span-2 lg:col-span-1' },
      { id: 'timeline', Component: TaskTimelineWidget, span: 'col-span-1 md:col-span-2 lg:col-span-1 h-full' },
      { id: 'progress', Component: TodayProgressWidget, span: 'col-span-1' },
      { 
        id: 'projects', 
        Component: (props) => <ProjectsOverview {...props} title="Creative & Study Projects" filterPersonal={true} />, 
        span: 'col-span-1' 
      },
      { id: 'checklist', Component: ChecklistProgressWidget, span: 'col-span-1' }
    ];
  }
  
  if (workspaceMode === 'ORG') {
    return [
      { id: 'focus', Component: FocusWidget, span: 'col-span-1 md:col-span-2 lg:col-span-1' },
      { id: 'workload', Component: WorkloadMatrix, span: 'col-span-1 md:col-span-2 lg:col-span-1' },
      { id: 'deadlines', Component: UpcomingDeadlines, span: 'col-span-1' },
      { id: 'projects', Component: ProjectsOverview, span: 'col-span-1' },
      { id: 'recent', Component: RecentTasksList, span: 'col-span-1 md:col-span-2 lg:col-span-1' }
    ];
  }

  // CREWS
  return [
    { id: 'focus', Component: FocusWidget, span: 'col-span-1 md:col-span-2 lg:col-span-1' },
    { id: 'recent', Component: RecentTasksList, span: 'col-span-1 md:col-span-2 lg:col-span-1' },
    { id: 'projects', Component: ProjectsOverview, span: 'col-span-1' }
  ];
}

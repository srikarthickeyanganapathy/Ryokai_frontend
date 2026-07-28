import React from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import PersonalDashboard from './personal/PersonalDashboard';
import OrganizationDashboard from './organization/OrganizationDashboard';
import CrewDashboard from './crew/CrewDashboard';

export function DashboardRouter() {
  const { workspaceMode } = useWorkspace();

  if (workspaceMode === 'ORG') {
    return <OrganizationDashboard />;
  }

  if (workspaceMode === 'CREWS') {
    return <CrewDashboard />;
  }

  return <PersonalDashboard />;
}

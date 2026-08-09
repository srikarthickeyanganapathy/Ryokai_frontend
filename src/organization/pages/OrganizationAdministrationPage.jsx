import React, { useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { Building2, Home, Settings, ShieldAlert, Key } from '@/shared/ui/Icons';
import { useOrganization, useOrgMembers, useOrgTeams, useLeaveRequests } from '../features/hooks/useOrganizations';
import { usePermissions } from '@/identity';
import { PageHeader } from '@/shared/ui/PageHeader';
import { PageShell } from '@/shared/ui/PageShell';
import {
  ConfigurationLayout,
  PageStateContainer,
} from '@/shared/workspace-framework';
import { useProjects } from '@/project';
import { useTaskList } from '@/task';
import { useGoals } from '@/organization/goals/features/hooks/useGoals';

import { OrganizationOverview } from '../components/Administration/OrganizationOverview';
import { OrganizationAdministrationHub } from '../components/Administration/OrganizationAdministrationHub';
import { DangerZone } from '../components/Administration/DangerZone';

export function OrganizationAdministrationPage() {
  const { orgId } = useParams();
  
  const { data: org, isLoading: orgLoading, isError, error } = useOrganization(orgId);
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(orgId);
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId);
  const { data: leaveRequests = [], isLoading: leaveLoading } = useLeaveRequests(orgId);
  
  const { data: projects = [], isLoading: projectsLoading } = useProjects({ organizationId: orgId });
  const { data: { tasks = [] } = {}, isLoading: tasksLoading } = useTaskList({ organizationId: orgId });
  const { data: goals = [], isLoading: goalsLoading } = useGoals(orgId);
  
  const { isOrgAdmin, can } = usePermissions();

  const [activeTab, setActiveTab] = useState('overview');

  // Compute aggregated stats for the Command Center
  const counts = {
    members: members.length,
    teams: teams.length,
    projects: projects.length || 0,
    tasks: tasks.length || 0,
    goals: goals.length || 0,
    pendingInvites: 0, // Fallback until invite endpoint exists
    pendingLeave: leaveRequests.filter(r => r.status === 'PENDING').length,
    leaveRequests,
    goalsData: goals,
    isLoading: membersLoading || teamsLoading || leaveLoading || projectsLoading || tasksLoading || goalsLoading
  };

  const pageState = orgLoading ? 'loading' : isError ? 'error' : !org ? 'empty' : 'ready';

  // Command Center Vertical Navigation
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'administration', label: 'Administration', icon: Settings },
    { id: 'danger', label: 'Danger Zone', icon: ShieldAlert },
  ];

  return (
    <PageShell maxWidth="narrow">
      <PageStateContainer
        state={pageState}
        loadingConfig={{ variant: 'default' }}
        errorConfig={{
          title: 'Failed to load organization',
          description: error?.message || 'An unexpected error occurred.',
        }}
        emptyConfig={{
          icon: Building2,
          title: 'Organization not found',
          description: "The organization you're looking for doesn't exist.",
        }}
      >
        <ConfigurationLayout
          header={
            <PageHeader
              eyebrow="Workspace Command Center"
              title={`${org?.name || 'Organization'} Administration`}
              subtitle="Manage operational health, configure identity, and administer teams and resources."
            />
          }
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        >
          {activeTab === 'overview' && (
            <OrganizationOverview org={org} counts={counts} />
          )}

          {activeTab === 'administration' && (
            <OrganizationAdministrationHub orgId={orgId} counts={counts} />
          )}

          {activeTab === 'danger' && (
            <DangerZone orgId={orgId} members={members} isOrgAdmin={isOrgAdmin} />
          )}
        </ConfigurationLayout>
      </PageStateContainer>
    </PageShell>
  );
}
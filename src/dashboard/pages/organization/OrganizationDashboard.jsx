import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { useOrganizationDashboardViewModel } from './hooks/useOrganizationDashboardViewModel';
import { Skeleton } from '@/shared/ui/Skeleton';

function OrganizationHealth({ health }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Organization Health</Heading>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="muted" size="xs">Overall Status</Text>
          <Text className={`text-xl font-bold ${health.status === 'Healthy' ? 'text-emerald-500' : 'text-amber-500'}`}>{health.status}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Total Tasks</Text>
          <Text className="text-xl font-bold">{health.totalTasks}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">At Risk / Rejected</Text>
          <Text className="text-xl font-bold text-[var(--danger)]">{health.atRisk}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Completion Rate</Text>
          <Text className="text-xl font-bold text-emerald-500">{health.velocity}</Text>
        </div>
      </div>
    </div>
  );
}

function TaskKPIs({ kpis }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Task Status Breakdown</Heading>
      {kpis.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No task metrics available.</Text>
      ) : (
        <div className="space-y-3">
          {kpis.map(kpi => (
            <div key={kpi.label} className="flex items-center justify-between">
              <Text className="text-sm font-medium">{kpi.label}</Text>
              <div className="flex items-center gap-2">
                <Text className="font-bold">{kpi.value}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Approvals({ pendingApprovals }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Pending Approvals / In Review</Heading>
      {pendingApprovals.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No tasks pending approval.</Text>
      ) : (
        <div className="space-y-3">
          {pendingApprovals.map(app => (
            <div key={app.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
              <div className="truncate mr-2">
                <Text className="text-sm font-medium truncate">{app.amount}</Text>
                <Text variant="muted" size="xs">Assigned to: {app.requester}</Text>
              </div>
              <div className="text-right shrink-0">
                <Text variant="muted" size="xs">{app.date}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RiskCenter({ risks }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--danger-border,#ef444433)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4 text-[var(--danger)]">Risk & Revision Center</Heading>
      {risks.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No high-risk or rejected tasks identified.</Text>
      ) : (
        <div className="space-y-3">
          {risks.map(risk => (
            <div key={risk.id} className="p-3 bg-[var(--danger-soft)]/10 rounded-lg border border-[var(--danger)]/30">
              <Text className="text-xs font-bold text-[var(--danger)] uppercase mb-1">{risk.severity} Risk</Text>
              <Text className="text-xs text-[var(--text-primary)]">{risk.issue}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActivityStream({ stream }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Activity Stream</Heading>
      {stream.length === 0 ? (
        <Text variant="muted" size="xs" className="py-6 text-center">No recent activity recorded.</Text>
      ) : (
        <div className="space-y-3">
          {stream.map(act => (
            <div key={act.id} className="flex items-start gap-3 border-b border-[var(--color-border-subtle)] pb-2.5 last:border-0 last:pb-0">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                {act.user ? act.user.charAt(0).toUpperCase() : 'U'}
              </div>
              <div>
                <Text className="text-xs text-[var(--text-primary)]">
                  <span className="font-semibold">{act.user}</span> {act.action} <span className="font-medium text-[var(--text-secondary)]">{act.target}</span>
                </Text>
                <Text variant="muted" size="xs" className="mt-0.5">{act.time}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function OrganizationDashboard() {
  const vm = useOrganizationDashboardViewModel();

  if (vm.isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-[1400px] mx-auto space-y-6">
      <div className="mb-6">
        <Heading level={2}>{vm.organization?.name || 'Organization'} Dashboard</Heading>
        <Text variant="muted">Live overview of organization health & task activities.</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrganizationHealth health={vm.health} />
            <TaskKPIs kpis={vm.kpis} />
          </div>
          <ActivityStream stream={vm.activityStream} />
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <RiskCenter risks={vm.riskCenter} />
          <Approvals pendingApprovals={vm.pendingApprovals} />
        </div>
      </div>
    </div>
  );
}

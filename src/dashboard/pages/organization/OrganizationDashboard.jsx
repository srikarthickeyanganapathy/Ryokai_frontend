import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { useOrganizationDashboardViewModel } from './hooks/useOrganizationDashboardViewModel';
import { Skeleton } from '@/shared/ui/Skeleton';

// Inline simple components for the org dashboard
function OrganizationHealth({ health }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Organization Health</Heading>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="muted" size="xs">Overall Status</Text>
          <Text className="text-xl font-bold text-emerald-500">{health.status}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Active Projects</Text>
          <Text className="text-xl font-bold">{health.activeProjects}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">At Risk</Text>
          <Text className="text-xl font-bold text-[var(--danger)]">{health.atRisk}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Velocity</Text>
          <Text className="text-xl font-bold text-emerald-500">{health.velocity}</Text>
        </div>
      </div>
    </div>
  );
}

function DepartmentKPIs({ kpis }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Department KPIs</Heading>
      <div className="space-y-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className="flex items-center justify-between">
            <Text className="text-sm font-medium">{kpi.label}</Text>
            <div className="flex items-center gap-2">
              <Text className="font-bold">{kpi.value}%</Text>
              <span className={kpi.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}>
                {kpi.trend === 'up' ? '↑' : '↓'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Approvals({ pendingApprovals }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Pending Approvals</Heading>
      <div className="space-y-3">
        {pendingApprovals.map(app => (
          <div key={app.id} className="flex items-center justify-between p-2 rounded bg-[var(--bg-subtle)]">
            <div>
              <Text className="text-sm font-medium">{app.requester}</Text>
              <Text variant="muted" size="xs">{app.type}</Text>
            </div>
            <div className="text-right">
              <Text className="text-sm font-medium">{app.amount}</Text>
              <Text variant="muted" size="xs">{app.date}</Text>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RiskCenter({ risks }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--danger-soft)]/20 border-[var(--danger)] h-full">
      <Heading level={4} className="mb-4 text-[var(--danger)]">Risk Center</Heading>
      <div className="space-y-3">
        {risks.map(risk => (
          <div key={risk.id} className="p-3 bg-[var(--bg-elevated)] rounded border border-[var(--danger)]/30">
            <Text className="text-xs font-bold text-[var(--danger)] uppercase mb-1">{risk.severity} Risk</Text>
            <Text className="text-sm">{risk.issue}</Text>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityStream({ stream }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Activity Stream</Heading>
      <div className="space-y-4">
        {stream.map(act => (
          <div key={act.id} className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-3 last:border-0 last:pb-0">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] shrink-0" />
            <div>
              <Text className="text-sm">
                <span className="font-semibold">{act.user}</span> {act.action} <span className="font-medium text-[var(--text-secondary)]">{act.target}</span>
              </Text>
              <Text variant="muted" size="xs" className="mt-1">{act.time}</Text>
            </div>
          </div>
        ))}
      </div>
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
        <Text variant="muted">High-level overview of company health.</Text>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <OrganizationHealth health={vm.health} />
            <DepartmentKPIs kpis={vm.kpis} />
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

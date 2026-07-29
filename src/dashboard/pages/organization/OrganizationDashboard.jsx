import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { useOrganizationDashboardViewModel } from './hooks/useOrganizationDashboardViewModel';
import {
  WorkspaceShell,
  CommandLayout,
  PageStateContainer,
} from '@/shared/workspace-framework';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  TrendingUp,
  Users,
} from 'lucide-react';

// ── Metric Card ───────────────────────────────────────────
function MetricCard({ icon: Icon, iconColor, iconBg, label, value, subtext }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--accent-border)] transition-colors duration-200">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-[var(--radius-md)] ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} strokeWidth={1.5} />
        </div>
        <Text variant="muted" size="sm">{label}</Text>
      </div>
      <span className="text-3xl font-bold text-[var(--text-primary)] tabular-nums">{value}</span>
      {subtext && (
        <Text variant="muted" size="xs" className="mt-1">{subtext}</Text>
      )}
    </div>
  );
}

// ── Hero Section ──────────────────────────────────────────
function DashboardHero({ organization, health }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-[var(--border-subtle)]">
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
            Mission Control
          </span>
        </div>
        <Heading level={2} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 truncate">
          {organization?.name || 'Organization'} Dashboard
        </Heading>
        <Text variant="muted" className="text-[13px] leading-relaxed">
          Live overview of organization health & task activities.
        </Text>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
          health.status === 'Healthy'
            ? 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30'
            : 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            health.status === 'Healthy' ? 'bg-[var(--success)]' : 'bg-[var(--warning)]'
          }`} />
          {health.status}
        </span>
      </div>
    </div>
  );
}

// ── Metrics Strip ─────────────────────────────────────────
function DashboardMetrics({ health, kpis }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <MetricCard
        icon={ClipboardCheck}
        iconColor="text-[var(--accent)]"
        iconBg="bg-[var(--accent-soft)]"
        label="Total Tasks"
        value={health.totalTasks}
      />
      <MetricCard
        icon={CheckCircle2}
        iconColor="text-[var(--success)]"
        iconBg="bg-[var(--success-soft)]"
        label="Completed"
        value={health.completedTasks}
      />
      <MetricCard
        icon={TrendingUp}
        iconColor="text-[var(--accent)]"
        iconBg="bg-[var(--accent-soft)]"
        label="Completion Rate"
        value={health.velocity}
      />
      <MetricCard
        icon={AlertTriangle}
        iconColor="text-[var(--danger)]"
        iconBg="bg-[var(--danger-soft)]"
        label="At Risk"
        value={health.atRisk}
      />
    </div>
  );
}

// ── Task Status Breakdown ─────────────────────────────────
function TaskKPIs({ kpis }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 h-full">
      <Heading level={4} className="mb-4 text-[15px]">Task Status Breakdown</Heading>
      {kpis.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No task metrics available.</Text>
      ) : (
        <div className="space-y-3">
          {kpis.map(kpi => (
            <div key={kpi.label} className="flex items-center justify-between">
              <Text className="text-sm font-medium">{kpi.label}</Text>
              <Text className="font-bold tabular-nums">{kpi.value}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Pending Approvals ─────────────────────────────────────
function Approvals({ pendingApprovals }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 h-full">
      <Heading level={4} className="mb-4 text-[15px]">Pending Approvals</Heading>
      {pendingApprovals.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No tasks pending approval.</Text>
      ) : (
        <div className="space-y-3">
          {pendingApprovals.map(app => (
            <div key={app.id} className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
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

// ── Risk Center ───────────────────────────────────────────
function RiskCenter({ risks }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 h-full">
      <Heading level={4} className="mb-4 text-[15px] text-[var(--danger)]">Risk & Revision Center</Heading>
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

// ── Activity Stream ───────────────────────────────────────
function ActivityStream({ stream }) {
  return (
    <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 h-full">
      <Heading level={4} className="mb-4 text-[15px]">Activity Stream</Heading>
      {stream.length === 0 ? (
        <Text variant="muted" size="xs" className="py-6 text-center">No recent activity recorded.</Text>
      ) : (
        <div className="space-y-3">
          {stream.map(act => (
            <div key={act.id} className="flex items-start gap-3 border-b border-[var(--border-subtle)] pb-2.5 last:border-0 last:pb-0">
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

// ── Page Component (WEF Migration) ────────────────────────
export default function OrganizationDashboard() {
  const vm = useOrganizationDashboardViewModel();

  const pageState = vm.isLoading ? 'loading' : 'ready';

  return (
    <WorkspaceShell maxWidth="wide">
      <PageStateContainer
        state={pageState}
        loadingConfig={{ variant: 'cards' }}
      >
        <CommandLayout
          hero={
            <DashboardHero
              organization={vm.organization}
              health={vm.health}
            />
          }
          metrics={
            <DashboardMetrics health={vm.health} kpis={vm.kpis} />
          }
        >
          {/* Widget Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TaskKPIs kpis={vm.kpis} />
                <Approvals pendingApprovals={vm.pendingApprovals} />
              </div>
              <ActivityStream stream={vm.activityStream} />
            </div>
            <div className="lg:col-span-1">
              <RiskCenter risks={vm.riskCenter} />
            </div>
          </div>
        </CommandLayout>
      </PageStateContainer>
    </WorkspaceShell>
  );
}

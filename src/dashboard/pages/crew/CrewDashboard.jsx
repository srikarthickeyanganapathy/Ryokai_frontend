import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { useCrewDashboardViewModel } from './hooks/useCrewDashboardViewModel';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icons } from '@/shared/ui/Icons';

function SprintStatus({ status }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Crew Overview: {status.name}</Heading>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Text variant="muted" size="xs">Overdue Tasks</Text>
          <Text className="text-xl font-bold text-[var(--accent)]">{status.daysLeft}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Completion Progress</Text>
          <Text className="text-xl font-bold">{status.progress}%</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">Tasks (Completed / Total)</Text>
          <Text className="text-xl font-bold">{status.completedPoints} / {status.totalPoints}</Text>
        </div>
        <div>
          <Text variant="muted" size="xs">My Active Tasks</Text>
          <Text className="text-xl font-bold text-emerald-500">{status.myTaskCount}</Text>
        </div>
      </div>
      <div className="mt-4 h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${status.progress}%` }} />
      </div>
    </div>
  );
}

function CrewMembers({ members }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Crew Members</Heading>
      {members.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No crew members found.</Text>
      ) : (
        <div className="space-y-3">
          {members.map(member => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <Text className="text-sm font-semibold">{member.name}</Text>
                  <Text variant="muted" size="xs">{member.role}</Text>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <Text variant="muted" size="xs">{member.status}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ActiveTasks({ tasks }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Active Tasks</Heading>
      {tasks.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No active tasks pending.</Text>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div key={task.id} className="p-3 border border-[var(--color-border-subtle)] rounded-lg bg-[var(--bg-subtle)]">
              <div className="flex justify-between items-start mb-2">
                <Text className="text-sm font-medium">{task.title}</Text>
                <Text className="text-xs font-bold text-[var(--accent)] uppercase">{task.priority}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Icons.user className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                <Text variant="muted" size="xs">{task.assignee}</Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentActivity({ activity }) {
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Recent Activity</Heading>
      {activity.length === 0 ? (
        <Text variant="muted" size="xs" className="py-4 text-center">No recent crew activity.</Text>
      ) : (
        <div className="space-y-3">
          {activity.map(act => (
            <div key={act.id} className="flex items-start gap-2 border-b border-[var(--color-border-subtle)] pb-2 last:border-0 last:pb-0">
              <Icons.zap className="w-4 h-4 text-[var(--accent)] mt-0.5 shrink-0" />
              <Text className="text-xs text-[var(--text-secondary)]">{act.text}</Text>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CrewDashboard() {
  const vm = useCrewDashboardViewModel();

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <Heading level={2}>Crew Dashboard</Heading>
          <Text variant="muted">Collaborative workspace for your squad.</Text>
        </div>

        {vm.crews.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            <Text size="xs" variant="muted" className="font-semibold uppercase tracking-wider shrink-0 mr-1">Your Crews:</Text>
            {vm.crews.map(c => (
              <button
                key={c.id}
                type="button"
                onClick={() => vm.setSelectedCrewId(c.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all shrink-0 ${
                  (vm.selectedCrewId === c.id || (!vm.selectedCrewId && vm.activeCrew?.id === c.id))
                    ? 'bg-[var(--accent)] text-white font-semibold'
                    : 'bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <SprintStatus status={vm.sprintStatus} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ActiveTasks tasks={vm.activeTasks} />
            <RecentActivity activity={vm.recentActivity} />
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <CrewMembers members={vm.members} />
        </div>
      </div>
    </div>
  );
}

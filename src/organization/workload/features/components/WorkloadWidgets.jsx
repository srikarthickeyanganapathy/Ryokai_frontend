import React, { useState } from 'react';
import {
  Activity,
  Users,
  AlertCircle,
  CheckCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  Wand2,
} from '@/shared/ui/Icons';
import { Text, Heading } from '@/shared/ui/Typography';
import { cn } from '@/shared/lib/cn';
import { AnimatedNumber, CapacityRing } from './ProgressVisuals';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/shared/ui/Select';

export function OrgSnapshotBanner({ stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
      <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
          <Users className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div>
          <Text
            size="xs"
            variant="muted"
            className="text-[10px] uppercase tracking-wider font-mono"
          >
            Total Members
          </Text>
          <AnimatedNumber
            value={stats.memberCount}
            className="text-lg font-semibold font-mono"
          />
        </div>
      </div>
      <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center">
          <Activity className="w-4 h-4 text-blue-500" />
        </div>
        <div>
          <Text
            size="xs"
            variant="muted"
            className="text-[10px] uppercase tracking-wider font-mono"
          >
            Active Tasks
          </Text>
          <AnimatedNumber
            value={stats.totalActive}
            className="text-lg font-semibold font-mono"
          />
        </div>
      </div>
      <div className="glass-panel rounded-xl p-3 flex items-center justify-center border border-[var(--color-border-subtle)] flex-col gap-1">
        <Text
          size="xs"
          variant="muted"
          className="text-[10px] uppercase tracking-wider font-mono"
        >
          Avg Utilization
        </Text>
        <CapacityRing value={stats.avgUtilization} size={60} stroke={6} />
      </div>
      <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--danger-soft)] flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
        </div>
        <div>
          <Text
            size="xs"
            variant="muted"
            className="text-[10px] uppercase tracking-wider font-mono"
          >
            Overloaded
          </Text>
          <AnimatedNumber
            value={stats.overAllocated}
            className="text-lg font-semibold font-mono text-[var(--danger)]"
          />
        </div>
      </div>
      <div className="glass-panel rounded-xl p-3 flex items-center gap-3 border border-[var(--color-border-subtle)]">
        <div className="w-9 h-9 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Plus className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div>
          <Text
            size="xs"
            variant="muted"
            className="text-[10px] uppercase tracking-wider font-mono"
          >
            Available Cap.
          </Text>
          <AnimatedNumber
            value={stats.availableTasks}
            className="text-lg font-semibold font-mono text-[var(--accent)]"
            suffix=" tasks"
          />
        </div>
      </div>
    </div>
  );
}

export function AIInsightsPanel({ stats }) {
  const insights = [];

  if (stats.overAllocated > 0) {
    insights.push({
      icon: AlertCircle,
      text: `${stats.overAllocated} ${stats.overAllocated === 1 ? 'member is' : 'members are'} currently overloaded.`,
      tone: 'danger',
    });
  } else {
    insights.push({
      icon: CheckCircle,
      text: `No members are currently overloaded.`,
      tone: 'accent',
    });
  }

  if (stats.availableTasks > 0 && stats.overAllocated > 0) {
    insights.push({
      icon: Wand2,
      text: `${stats.availableTasks} tasks can be assigned to available members to balance load.`,
      tone: 'accent',
    });
  }

  if (stats.avgUtilization > 85) {
    insights.push({
      icon: TrendingUp,
      text: `Team utilization is high at ${stats.avgUtilization}%. Consider expanding capacity.`,
      tone: 'warning',
    });
  } else if (stats.avgUtilization < 50) {
    insights.push({
      icon: TrendingDown,
      text: `Team utilization is low at ${stats.avgUtilization}%. Capacity is available for more tasks.`,
      tone: 'accent',
    });
  } else {
    insights.push({
      icon: CheckCircle,
      text: `Average utilization is healthy at ${stats.avgUtilization}%.`,
      tone: 'accent',
    });
  }

  return (
    <div className="glass-panel rounded-xl p-4 border border-[var(--color-border-subtle)] h-full">
      <div className="flex items-center gap-2 mb-3">
        <Wand2 className="w-4 h-4 text-[var(--accent)]" />
        <Heading level={4} className="text-sm font-semibold">
          AI Insights & Risk Prediction
        </Heading>
      </div>
      <div className="space-y-2.5">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2 text-xs">
            <ins.icon
              className={cn(
                'w-3.5 h-3.5 mt-0.5 shrink-0',
                ins.tone === 'danger'
                  ? 'text-[var(--danger)]'
                  : ins.tone === 'warning'
                    ? 'text-[var(--warning)]'
                    : 'text-[var(--accent)]',
              )}
            />
            <Text size="xs" className="text-[var(--text-secondary)]">
              {ins.text}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TeamHealthCard({ score }) {
  const tone = score > 80 ? 'accent' : score > 50 ? 'warning' : 'danger';
  const label =
    score > 80 ? 'Excellent' : score > 50 ? 'Needs Attention' : 'Critical';

  return (
    <div className="glass-panel rounded-xl p-4 border border-[var(--color-border-subtle)] h-full flex flex-col items-center justify-center text-center">
      <CapacityRing value={score} size={90} stroke={8} />
      <Heading level={4} className="text-sm font-semibold mt-2">
        Team Health Score
      </Heading>
      <Text
        size="xs"
        variant="muted"
        className={cn(
          'font-medium uppercase tracking-wider mt-1',
          tone === 'accent'
            ? 'text-[var(--accent)]'
            : tone === 'warning'
              ? 'text-[var(--warning)]'
              : 'text-[var(--danger)]',
        )}
      >
        {label}
      </Text>
    </div>
  );
}

export function DistributionChart({ rows, threshold }) {
  const dist = { idle: 0, light: 0, normal: 0, heavy: 0, critical: 0 };
  rows.forEach((row) => {
    const count = row.totalActiveCount ?? 0;
    const pct = threshold > 0 ? count / threshold : 0;
    if (pct === 0) dist.idle++;
    else if (pct <= 0.5) dist.light++;
    else if (pct <= 0.8) dist.normal++;
    else if (pct <= 1.0) dist.heavy++;
    else dist.critical++;
  });

  const max = Math.max(...Object.values(dist), 1);
  const bars = [
    { label: 'Idle', count: dist.idle, color: 'bg-[var(--bg-subtle)]' },
    { label: 'Light', count: dist.light, color: 'bg-blue-500/50' },
    { label: 'Normal', count: dist.normal, color: 'bg-emerald-500/50' },
    { label: 'Heavy', count: dist.heavy, color: 'bg-amber-500/50' },
    { label: 'Critical', count: dist.critical, color: 'bg-red-500/60' },
  ];

  return (
    <div className="glass-panel rounded-xl p-4 border border-[var(--color-border-subtle)] h-full">
      <Heading level={4} className="text-sm font-semibold mb-3">
        Workload Distribution
      </Heading>
      <div className="space-y-2">
        {bars.map((bar) => (
          <div key={bar.label} className="flex items-center gap-2">
            <Text size="xs" className="w-12 text-[var(--text-muted)]">
              {bar.label}
            </Text>
            <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  bar.color,
                )}
                style={{ width: `${(bar.count / max) * 100}%` }}
              />
            </div>
            <Text
              size="xs"
              className="w-6 text-right font-mono text-[var(--text-secondary)]"
            >
              {bar.count}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPanel({ rows, threshold }) {
  const topOver = [...rows]
    .filter((r) => (r.totalActiveCount ?? 0) > threshold)
    .sort((a, b) => (b.totalActiveCount ?? 0) - (a.totalActiveCount ?? 0))
    .slice(0, 3);
  const topUnder = [...rows]
    .filter((r) => (r.totalActiveCount ?? 0) < threshold * 0.5)
    .sort((a, b) => (a.totalActiveCount ?? 0) - (b.totalActiveCount ?? 0))
    .slice(0, 3);

  const Panel = ({ title, icon: Icon, users, tone }) => (
    <div className="glass-panel rounded-xl p-4 border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-2 mb-3">
        <Icon
          className={cn(
            'w-4 h-4',
            tone === 'danger'
              ? 'text-[var(--danger)]'
              : 'text-[var(--accent)]',
          )}
        />
        <Heading level={4} className="text-sm font-semibold">
          {title}
        </Heading>
      </div>
      {users.length === 0 ? (
        <Text size="xs" variant="muted">
          No members found in this threshold.
        </Text>
      ) : (
        <div className="space-y-2">
          {users.map((row) => (
            <div
              key={row.user?.id || row.user?.username}
              className="flex items-center justify-between"
            >
              <Text size="xs" className="font-medium">
                {row.user?.fullName || row.user?.username || 'Member'}
              </Text>
              <div className="text-right">
                <Text
                  size="xs"
                  className={cn(
                    'font-mono font-bold',
                    tone === 'danger'
                      ? 'text-[var(--danger)]'
                      : 'text-[var(--accent)]',
                  )}
                >
                  {row.totalActiveCount ?? 0} / {threshold}
                </Text>
                <Text size="10px" variant="muted" className="block">
                  {tone === 'danger'
                    ? `+${(row.totalActiveCount ?? 0) - threshold} over`
                    : `Can take ${threshold - (row.totalActiveCount ?? 0)}`}
                </Text>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Panel
        title="Most Overloaded"
        icon={AlertCircle}
        users={topOver}
        tone="danger"
      />
      <Panel
        title="Available Capacity"
        icon={CheckCircle}
        users={topUnder}
        tone="accent"
      />
    </div>
  );
}

export function RebalanceSimulator({ rows, threshold }) {
  const over = rows.filter((r) => (r.totalActiveCount ?? 0) > threshold);
  const under = rows.filter((r) => (r.totalActiveCount ?? 0) < threshold);

  const getUserId = (r) => String(r?.user?.id ?? r?.user?.username ?? '');

  const [fromId, setFromId] = useState(() => (over[0] ? getUserId(over[0]) : ''));
  const [toId, setToId] = useState(() => (under[0] ? getUserId(under[0]) : ''));
  const [tasks, setTasks] = useState(1);

  const fromUser =
    rows.find((r) => getUserId(r) === String(fromId)) || over[0];
  const toUser = rows.find((r) => getUserId(r) === String(toId)) || under[0];

  if (!fromUser || !toUser) {
    return (
      <div className="glass-panel rounded-xl p-4 border border-[var(--color-border-subtle)] bg-[var(--accent-soft)]/5 flex flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] h-full min-h-[220px]">
        <Wand2 className="w-6 h-6 mb-2 text-[var(--accent)] opacity-70" />
        <Text className="font-semibold text-[var(--text-primary)] mb-1">
          Team Workload is Balanced
        </Text>
        <Text size="xs" variant="muted" className="max-w-[240px]">
          No rebalance simulation is needed as there are currently no over-allocated team members.
        </Text>
      </div>
    );
  }

  const maxMove = Math.max(
    1,
    Math.min(
      (fromUser.totalActiveCount ?? 0) - threshold,
      threshold - (toUser.totalActiveCount ?? 0),
    ),
  );
  const clampedTasks = Math.min(tasks, maxMove);

  const fromAfter = (fromUser.totalActiveCount ?? 0) - clampedTasks;
  const toAfter = (toUser.totalActiveCount ?? 0) + clampedTasks;

  return (
    <div className="glass-panel rounded-xl p-4 border border-[var(--accent-border)] bg-[var(--accent-soft)]/10 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-4 h-4 text-[var(--accent)]" />
          <Heading level={4} className="text-sm font-semibold">
            Rebalance Simulator
          </Heading>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <Text size="xs" variant="muted" className="block mb-1">
              From (Overloaded)
            </Text>
            <Select
              value={String(getUserId(fromUser))}
              onValueChange={(val) => setFromId(val)}
            >
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--bg-base)]">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {over.map((r) => {
                  const uid = getUserId(r);
                  const name = r.user?.fullName || r.user?.username || 'Member';
                  return (
                    <SelectItem key={uid} value={uid}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Text size="xs" variant="muted" className="block mb-1">
              To (Available)
            </Text>
            <Select
              value={String(getUserId(toUser))}
              onValueChange={(val) => setToId(val)}
            >
              <SelectTrigger className="w-full h-8 text-xs bg-[var(--bg-base)]">
                <SelectValue placeholder="Select member" />
              </SelectTrigger>
              <SelectContent>
                {under.map((r) => {
                  const uid = getUserId(r);
                  const name = r.user?.fullName || r.user?.username || 'Member';
                  return (
                    <SelectItem key={uid} value={uid}>
                      {name}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between mb-1">
            <Text size="xs" variant="muted">
              Tasks to move
            </Text>
            <Text size="xs" className="font-mono font-bold">
              {clampedTasks}
            </Text>
          </div>
          <input
            type="range"
            min="1"
            max={maxMove}
            value={clampedTasks}
            onChange={(e) => setTasks(Number(e.target.value))}
            className="w-full accent-[var(--accent)] cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-base)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
          <Text size="xs" className="font-medium mb-2 truncate block">
            {fromUser.user?.fullName || fromUser.user?.username || 'Member'}
          </Text>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Before:</span>
            <span className="font-mono font-bold text-[var(--danger)]">
              {fromUser.totalActiveCount ?? 0} / {threshold}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-[var(--text-muted)]">After:</span>
            <span
              className={cn(
                'font-mono font-bold',
                fromAfter > threshold
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--accent)]',
              )}
            >
              {fromAfter} / {threshold}
            </span>
          </div>
        </div>
        <div className="bg-[var(--bg-base)] rounded-lg p-3 border border-[var(--color-border-subtle)]">
          <Text size="xs" className="font-medium mb-2 truncate block">
            {toUser.user?.fullName || toUser.user?.username || 'Member'}
          </Text>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[var(--text-muted)]">Before:</span>
            <span className="font-mono font-bold text-[var(--accent)]">
              {toUser.totalActiveCount ?? 0} / {threshold}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs mt-1">
            <span className="text-[var(--text-muted)]">After:</span>
            <span
              className={cn(
                'font-mono font-bold',
                toAfter > threshold
                  ? 'text-[var(--danger)]'
                  : 'text-[var(--accent)]',
              )}
            >
              {toAfter} / {threshold}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

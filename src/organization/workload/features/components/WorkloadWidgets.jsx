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
  ArrowRight,
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
import { StatKPI } from '@/organization/teams/components/StatKPI';

/* --- KpiTile / OrgSnapshotBanner: StatKPI tile strip --- */
export function KpiTile({ icon: Icon, label, value, caption, tone, hue, suffix, ring }) {
  const defaultHue = tone === 'danger' ? 0 : tone === 'warning' ? 38 : tone === 'success' ? 145 : 215;
  const currentHue = hue ?? defaultHue;
  return (
    <StatKPI
      icon={Icon}
      label={label}
      value={value}
      suffix={suffix}
      caption={caption}
      hue={currentHue}
      ring={ring ? <CapacityRing value={ring.value} size={36} stroke={4} color={`hsl(${currentHue} 70% 50%)`} showValue={false} /> : null}
    />
  );
}

export function OrgSnapshotBanner({ stats, threshold }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
      <KpiTile
        icon={Users}
        hue={215}
        label="Members"
        value={stats.memberCount}
        caption={<>across <b className="font-mono font-bold text-[var(--text-secondary)]">{Math.max(1, Math.ceil(stats.memberCount / 3))} teams</b></>}
        tone="accent"
      />
      <KpiTile
        icon={Activity}
        hue={190}
        label="Active tasks"
        value={stats.totalActive}
        caption="today"
        tone="accent"
      />
      <KpiTile
        icon={TrendingUp}
        hue={270}
        label="Avg utilization"
        value={stats.avgUtilization}
        suffix="%"
        caption={<>capacity used of <b className="font-mono font-bold text-[var(--text-secondary)]">{stats.memberCount * (threshold || 8)}</b> slots</>}
        tone="accent"
        ring={{ value: stats.avgUtilization }}
      />
      <KpiTile
        icon={AlertCircle}
        hue={0}
        label="Overloaded"
        value={stats.overAllocated}
        caption={<>above <b className="font-mono font-bold text-[var(--text-secondary)]">{threshold || 8}</b> active tasks</>}
        tone="danger"
      />
      <KpiTile
        icon={Plus}
        hue={145}
        label="Available capacity"
        value={stats.availableTasks}
        suffix=" tasks"
        caption="slots free to assign"
        tone="success"
      />
    </div>
  );
}

/* --- AIInsightsPanel: tagged insight rows --- */
export function AIInsightsPanel({ stats }) {
  const insights = [];

  if (stats.overAllocated > 0) {
    insights.push({
      icon: AlertCircle,
      text: `${stats.overAllocated} ${stats.overAllocated === 1 ? 'member is' : 'members are'} currently overloaded.`,
      tone: 'danger',
      tag: 'action',
    });
  } else {
    insights.push({
      icon: CheckCircle,
      text: `No members are currently overloaded.`,
      tone: 'accent',
      tag: 'ok',
    });
  }

  if (stats.availableTasks > 0 && stats.overAllocated > 0) {
    insights.push({
      icon: Wand2,
      text: `${stats.availableTasks} tasks can be assigned to available members to balance load.`,
      tone: 'accent',
      tag: 'suggest',
    });
  }

  if (stats.avgUtilization > 85) {
    insights.push({
      icon: TrendingUp,
      text: `Team utilization is high at ${stats.avgUtilization}%. Consider expanding capacity.`,
      tone: 'warning',
      tag: 'watch',
    });
  } else if (stats.avgUtilization < 50) {
    insights.push({
      icon: TrendingDown,
      text: `Team utilization is low at ${stats.avgUtilization}%. Capacity is available for more tasks.`,
      tone: 'accent',
      tag: 'ok',
    });
  } else {
    insights.push({
      icon: CheckCircle,
      text: `Average utilization is healthy at ${stats.avgUtilization}%.`,
      tone: 'accent',
      tag: 'ok',
    });
  }

  const tagCls = {
    action: 'bg-[var(--danger-soft)] text-[var(--danger)]',
    suggest: 'bg-[var(--accent-soft)] text-[var(--accent)]',
    watch: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    ok: 'bg-[var(--success-soft,var(--accent-soft))] text-[var(--success)]',
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-2">
        <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <Wand2 className="w-3.5 h-3.5 text-[var(--accent)]" />
        </span>
        <Heading level={4} className="text-[13px] font-semibold tracking-tight">
          AI Insights &amp; Risk Prediction
        </Heading>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)] border border-[var(--border-subtle)] rounded-full px-2 py-0.5 bg-[var(--bg-subtle)]">
          auto
        </span>
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {insights.map((ins, i) => (
          <div key={i} className="flex items-start gap-2.5 py-2.5 text-xs">
            <span
              className={cn(
                'w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                ins.tone === 'danger'
                  ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                  : ins.tone === 'warning'
                    ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                    : 'bg-[var(--accent-soft)] text-[var(--accent)]',
              )}
            >
              <ins.icon className="w-3.5 h-3.5" />
            </span>
            <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed flex-1">
              {ins.text}
            </Text>
            <span className={cn('font-mono text-[8.5px] uppercase tracking-[0.08em] px-1.5 py-0.5 rounded shrink-0 mt-0.5', tagCls[ins.tag])}>
              {ins.tag}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* --- TeamHealthCard: gauge + breakdown bars --- */
export function TeamHealthCard({ score, stats }) {
  const tone = score > 80 ? 'accent' : score > 50 ? 'warning' : 'danger';
  const toneColor =
    tone === 'accent' ? 'var(--accent)' : tone === 'warning' ? 'var(--warning)' : 'var(--danger)';
  const label = score > 80 ? 'Excellent' : score > 50 ? 'Needs Attention' : 'Critical';

  const parts = [
    { label: 'Balanced', count: stats?.balanced ?? 0, color: 'var(--success)' },
    { label: 'Near capacity', count: stats?.nearCapacity ?? 0, color: 'var(--warning)' },
    { label: 'Overloaded', count: stats?.overAllocated ?? 0, color: 'var(--danger)' },
  ];
  const total = Math.max(1, parts.reduce((a, p) => a + p.count, 0));

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm h-full flex flex-col justify-center">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-[var(--success-soft,var(--accent-soft))] flex items-center justify-center">
          <span className="w-3 h-3 rounded-full" style={{ background: toneColor }} />
        </span>
        <Heading level={4} className="text-[13px] font-semibold tracking-tight">
          Team Health Score
        </Heading>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
          0-100
        </span>
      </div>
      <div className="flex items-center gap-5">
        <div className="shrink-0">
          <CapacityRing value={score} size={104} stroke={10} color={toneColor}>
            <span className="font-mono text-[26px] font-bold leading-none" style={{ color: toneColor }}>
              {score}
            </span>
            <span className="font-mono text-[9px] text-[var(--text-muted)] mt-0.5">/ 100</span>
          </CapacityRing>
        </div>
        <div className="flex-1 min-w-0 space-y-2.5">
          <span
            className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold',
              tone === 'accent'
                ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                : tone === 'warning'
                  ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                  : 'bg-[var(--danger-soft)] text-[var(--danger)]',
            )}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: toneColor }} />
            {label}
          </span>
          {parts.map((p) => (
            <div key={p.label} className="flex items-center gap-2">
              <span className="text-[11px] text-[var(--text-secondary)] w-[86px] shrink-0">{p.label}</span>
              <div className="flex-1 h-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${(p.count / total) * 100}%`, background: p.color }}
                />
              </div>
              <span className="font-mono text-[11px] font-bold text-[var(--text-secondary)] w-5 text-right">
                {p.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* --- DistributionChart --- */
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
    { label: 'Idle', count: dist.idle, color: 'bg-[var(--bg-elevated)]' },
    { label: 'Light', count: dist.light, color: 'bg-emerald-500/50' },
    { label: 'Normal', count: dist.normal, color: 'bg-emerald-500' },
    { label: 'Heavy', count: dist.heavy, color: 'bg-amber-500/60' },
    { label: 'Critical', count: dist.critical, color: 'bg-red-500/60' },
  ];

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm h-full">
      <div className="flex items-center gap-2 mb-3">
        <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
          <span className="w-3 h-3 rounded-[3px] bg-[var(--accent)]" />
        </span>
        <Heading level={4} className="text-[13px] font-semibold tracking-tight">
          Workload Distribution
        </Heading>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
          vs threshold
        </span>
      </div>
      <div className="space-y-2.5">
        {bars.map((bar) => (
          <div key={bar.label} className="grid grid-cols-[58px_1fr_24px] items-center gap-2.5">
            <Text size="xs" className="text-[var(--text-secondary)]">{bar.label}</Text>
            <div className="h-2.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
              <div
                className={cn('h-full rounded-full transition-all duration-500', bar.color)}
                style={{ width: `${(bar.count / max) * 100}%` }}
              />
            </div>
            <Text size="xs" className="font-mono text-[var(--text-secondary)] text-right font-bold">
              {bar.count}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}

/* LeaderboardPanel removed -- not in V1 Capacity Command demo */

/* --- RebalanceSimulator --- */
export function RebalanceSimulator({ rows, threshold }) {
  const over = rows.filter((r) => (r.totalActiveCount ?? 0) > threshold);
  const under = rows.filter((r) => (r.totalActiveCount ?? 0) < threshold);

  const getUserId = (r) => String(r?.user?.id ?? r?.user?.username ?? '');

  const [fromId, setFromId] = useState(() => (over[0] ? getUserId(over[0]) : ''));
  const [toId, setToId] = useState(() => (under[0] ? getUserId(under[0]) : ''));
  const [tasks, setTasks] = useState(1);

  const fromUser = rows.find((r) => getUserId(r) === String(fromId)) || over[0];
  const toUser = rows.find((r) => getUserId(r) === String(toId)) || under[0];

  if (!fromUser || !toUser) {
    return (
      <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4 shadow-sm flex flex-col items-center justify-center text-center text-xs text-[var(--text-muted)] h-full min-h-[220px]">
        <span className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2">
          <Wand2 className="w-4 h-4" />
        </span>
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
  const pct = (c) => Math.min(100, Math.round((c / threshold) * 100));

  return (
    <div className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/10 p-4 shadow-sm h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
            <Wand2 className="w-3.5 h-3.5" />
          </span>
          <Heading level={4} className="text-[13px] font-semibold tracking-tight">
            Rebalance Simulator
          </Heading>
          <span className="ml-auto font-mono text-[9px] uppercase tracking-[0.1em] text-[var(--text-muted)]">
            what-if
          </span>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center mb-3">
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-2">
            <Text size="10px" variant="muted" className="block mb-1 font-mono uppercase tracking-wider">
              From   Overloaded
            </Text>
            <Select value={String(getUserId(fromUser))} onValueChange={(val) => setFromId(val)}>
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
          <span className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center shrink-0">
            <ArrowRight className="w-3.5 h-3.5" />
          </span>
          <div className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] p-2">
            <Text size="10px" variant="muted" className="block mb-1 font-mono uppercase tracking-wider">
              To   Available
            </Text>
            <Select value={String(getUserId(toUser))} onValueChange={(val) => setToId(val)}>
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

        <div className="mb-3">
          <div className="flex justify-between mb-1">
            <Text size="xs" variant="muted">
              Tasks to move
            </Text>
            <Text size="xs" className="font-mono font-bold text-[var(--accent)]">
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

      <div className="grid grid-cols-2 gap-2.5">
        {[
          {
            user: fromUser,
            after: fromAfter,
            tone: 'danger',
            delta: `   ${clampedTasks}`,
            verdict: fromAfter > threshold ? 'still over' : 'under threshold',
          },
          {
            user: toUser,
            after: toAfter,
            tone: 'success',
            delta: `  +${clampedTasks}`,
            verdict: toAfter > threshold ? 'near limit' : 'headroom left',
          },
        ].map(({ user, after, tone, delta, verdict }) => {
          const isBad = tone === 'danger' ? after > threshold : after > threshold;
          const before = user.totalActiveCount ?? 0;
          return (
            <div key={getUserId(user)} className="rounded-lg bg-[var(--bg-base)] border border-[var(--border-subtle)] p-2.5">
              <Text size="xs" className="font-medium truncate block mb-1.5 text-[var(--text-primary)]">
                {user.user?.fullName || user.user?.username || 'Member'}
              </Text>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)] mb-1">
                <span className="shrink-0">Before</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct(before)}%`, background: tone === 'danger' ? 'var(--danger)' : 'var(--accent)' }}
                  />
                </div>
                <b className="font-mono text-[var(--text-secondary)]">{before}</b>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-[var(--text-muted)]">
                <span className="shrink-0">After</span>
                <div className="flex-1 h-1.5 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct(after)}%`,
                      background: isBad ? 'var(--danger)' : 'var(--success)',
                    }}
                  />
                </div>
                <b className={cn('font-mono', isBad ? 'text-[var(--danger)]' : 'text-[var(--success)]')}>{after}</b>
              </div>
              <div className="flex justify-between mt-1 font-mono text-[9px] text-[var(--text-muted)]">
                <span>{delta}</span>
                <span>{verdict}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

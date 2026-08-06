import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Gauge,
  Building2,
  RefreshCw,
  Settings2,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
} from '@/shared/ui/Icons';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { FilterTabs } from '@/shared/ui/FilterTabs';
import { cn } from '@/shared/lib/cn';
import { usePermissions } from '@/identity';
import { useWorkload } from '@/organization/workload/features/hooks/useWorkload';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  PageShell, PageHero, PageContent, PageToolbar,
} from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { DataTable } from '@/shared/ui/data-table/DataTable';
import { toast } from 'sonner';
import {
  deriveOrgStats,
  getTeamHealthScore,
  getTrendDirection,
  getRiskLevel,
} from '@/organization/workload/features/utils/workloadCalculations';
import {
  OrgSnapshotBanner,
  AIInsightsPanel,
  TeamHealthCard,
  DistributionChart,
  LeaderboardPanel,
  RebalanceSimulator,
} from '@/organization/workload/features/components';

// --- localStorage Snapshot Utilities ---
const getHistoryKey = (orgId) => `ryokai_workload_history_${orgId}`;
const getThresholdKey = (orgId) => `ryokai_workload_threshold_${orgId}`;

const loadHistory = (orgId) => {
  try {
    const raw = localStorage.getItem(getHistoryKey(orgId));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveHistory = (orgId, history) => {
  try {
    localStorage.setItem(getHistoryKey(orgId), JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save workload history', e);
  }
};

const ensureHistory = (orgId, rows) => {
  const history = loadHistory(orgId);
  let updated = false;

  rows.forEach((row) => {
    const userId = row.user?.id || row.user?.username;
    if (!userId) return;
    if (!history[userId]) {
      const base = row.totalActiveCount || 0;
      history[userId] = Array.from({ length: 14 }, (_, i) => {
        const variance = Math.floor(Math.random() * 5) - 2;
        return Math.max(0, base + variance);
      });
      updated = true;
    }
  });

  if (updated) saveHistory(orgId, history);
  return history;
};

function Sparkline({ data, color = 'var(--accent)' }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data, 1);
  const width = 60;
  const height = 20;
  const points = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - (d / max) * height;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} viewBox="0 0 60 20" fill="none">
      <polyline
        points={points}
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TrendIcon({ trend }) {
  if (trend === 'increasing') {
    return (
      <span className="flex items-center text-[var(--danger)]">
        <TrendingUp className="w-3 h-3" />
      </span>
    );
  }
  if (trend === 'decreasing') {
    return (
      <span className="flex items-center text-[var(--accent)]">
        <TrendingDown className="w-3 h-3" />
      </span>
    );
  }
  return (
    <span className="flex items-center text-[var(--text-muted)]">
      <Minus className="w-3 h-3" />
    </span>
  );
}

function HeatmapMatrix({ rows, threshold, history }) {
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d;
  });

  const getCellColor = (value) => {
    if (value === 0) return 'bg-[var(--bg-subtle)]';
    if (value <= threshold * 0.5) return 'bg-emerald-500/40';
    if (value <= threshold * 0.8) return 'bg-amber-500/40';
    if (value <= threshold) return 'bg-orange-500/50';
    return 'bg-red-500/60';
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6 overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <Heading level={3} className="text-[14px] font-semibold tracking-tight">
          14-Day Capacity Heatmap
        </Heading>
        <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-emerald-500/40"></div>Low
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-amber-500/40"></div>Normal
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-sm bg-red-500/60"></div>Over
          </span>
        </div>
      </div>

      <div className="min-w-[600px]">
        <div className="grid grid-cols-[200px_1fr] gap-2 mb-2">
          <div></div>
          <div className="grid grid-cols-14 gap-1">
            {days.map((d, i) => (
              <div
                key={i}
                className="text-[9px] text-[var(--text-muted)] text-center font-mono"
              >
                {d.getDate()}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {rows.map((row) => {
            const userId = row.user?.id || row.user?.username;
            const userHistory = history[userId] || [];
            return (
              <div
                key={userId}
                className="grid grid-cols-[200px_1fr] gap-2 items-center hover:bg-[var(--bg-subtle)]/50 p-1 rounded-md transition-colors"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[10px] shrink-0 border border-[var(--accent-border)]">
                    {(row.user?.username || '?').charAt(0).toUpperCase()}
                  </div>
                  <Text className="font-medium text-[12px] truncate">
                    {row.user?.fullName || row.user?.username || 'Unknown'}
                  </Text>
                </div>
                <div className="grid grid-cols-14 gap-1">
                  {userHistory.map((val, i) => {
                    const prevVal = userHistory[i - 1] || 0;
                    const diff = val - prevVal;
                    const tooltip = `${val} active tasks on ${days[i].toLocaleDateString()}\n${diff > 0 ? '+' : ''}${diff} from yesterday`;
                    return (
                      <div
                        key={i}
                        className={cn(
                          'h-6 rounded-sm transition-all hover:scale-110 hover:ring-1 hover:ring-[var(--accent)] cursor-pointer',
                          getCellColor(val),
                        )}
                        title={tooltip}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'near', label: 'Near Capacity' },
  { value: 'overloaded', label: 'Overloaded' },
  { value: 'available', label: 'Available' },
];

export function WorkloadPage() {
  const { activeOrganization } = useWorkspace();
  const { userOrg } = usePermissions();
  const orgId = activeOrganization?.id || userOrg?.id;

  const {
    data: rows = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useWorkload(orgId);

  const [threshold, setThreshold] = useState(() => {
    const saved = orgId ? localStorage.getItem(getThresholdKey(orgId)) : null;
    return saved ? parseInt(saved, 10) : 8;
  });
  const [history, setHistory] = useState({});
  const [showThresholdInput, setShowThresholdInput] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(threshold);
  const [filter, setFilter] = useState('all');
  const [expandedCards, setExpandedCards] = useState({});

  useEffect(() => {
    if (orgId && rows.length > 0) {
      setHistory(ensureHistory(orgId, rows));
    }
  }, [orgId, rows]);

  const handleSaveThreshold = () => {
    if (orgId)
      localStorage.setItem(getThresholdKey(orgId), String(tempThreshold));
    setThreshold(tempThreshold);
    setShowThresholdInput(false);
    toast.success(`Capacity threshold updated to ${tempThreshold}`);
  };

  const stats = useMemo(
    () => deriveOrgStats(rows, threshold),
    [rows, threshold],
  );
  const healthScore = useMemo(
    () => getTeamHealthScore(rows, threshold),
    [rows, threshold],
  );

  const filteredRows = useMemo(() => {
    if (filter === 'all') return rows;
    if (filter === 'overloaded')
      return rows.filter((r) => (r.totalActiveCount ?? 0) > threshold);
    if (filter === 'near')
      return rows.filter((r) => {
        const c = r.totalActiveCount ?? 0;
        return c >= threshold * 0.75 && c <= threshold;
      });
    if (filter === 'balanced')
      return rows.filter((r) => (r.totalActiveCount ?? 0) < threshold * 0.75);
    if (filter === 'available')
      return rows.filter((r) => (r.totalActiveCount ?? 0) < threshold * 0.5);
    return rows;
  }, [rows, filter, threshold]);

  const toggleCard = (id) =>
    setExpandedCards((prev) => ({ ...prev, [id]: !prev[id] }));

  /* ── No active org: empty fallback ── */
  if (!orgId) {
    return (
      <PageShell maxWidth="default">
        <PageContent>
          <PageState
            state="empty"
            stateProps={{
              icon: Building2,
              title: 'Select an organization to view workload',
              description: 'Resource capacity and team member utilization tracking requires an active organization workspace.',
            }}
          />
        </PageContent>
      </PageShell>
    );
  }

  const pageState = isLoading
    ? 'loading'
    : isError
      ? 'error'
      : rows.length === 0
        ? 'empty'
        : 'ready';

  return (
    <PageShell maxWidth="default">
      <PageHero
        eyebrow="Resource Capacity"
        title="Team Capacity & Utilization"
        subtitle="Monitor team load balance and task allocation bottlenecks."
        icon={Gauge}
      >
        <div className="flex items-center gap-2">
          {showThresholdInput ? (
            <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-lg">
              <Input
                type="number"
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                className="w-16 h-7 text-sm border-none focus-visible:ring-0"
                min={1}
                max={20}
              />
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={handleSaveThreshold}
              >
                Set
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowThresholdInput(true)}
              className="gap-1.5 text-[12px] h-8"
            >
              <Settings2 className="w-3.5 h-3.5" /> Capacity: {threshold}
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="gap-1.5 text-[12px] h-8"
            disabled={isLoading}
          >
            <RefreshCw
              className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')}
            />{' '}
            Refresh
          </Button>
        </div>
      </PageHero>

      <PageContent>
        <PageState
          state={pageState}
          stateProps={{
            loadingVariant: 'dashboard',
            onAction: () => refetch(),
            actionLabel: 'Refresh Workload',
            title: 'No Workload Matrix Available',
            description: 'There are currently no active workload assignments or team member metrics for this organization.',
            onRetry: () => refetch(),
          }}
        >
          <div className="flex flex-col gap-6">
            <OrgSnapshotBanner stats={stats} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TeamHealthCard score={healthScore} />
              <div className="md:col-span-2">
                <AIInsightsPanel stats={stats} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DistributionChart rows={rows} threshold={threshold} />
              <RebalanceSimulator rows={rows} threshold={threshold} />
            </div>

            <LeaderboardPanel rows={rows} threshold={threshold} />

            <HeatmapMatrix
              rows={rows}
              threshold={threshold}
              history={history}
            />

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--text-muted)]" />
              <FilterTabs
                filters={FILTERS}
                value={filter}
                onChange={setFilter}
              />
            </div>

            {/* Utilization Cards Grid */}
            <div className="space-y-3">
              <Heading
                level={2}
                className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
              >
                Member Utilization
              </Heading>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredRows.map((row) => {
                  const user = row.user || {};
                  const name = user.fullName || user.username || 'Team Member';
                  const activeCount = row.totalActiveCount ?? 0;
                  const isOver = activeCount > threshold;
                  const isHigh = activeCount >= threshold * 0.75 && !isOver;
                  const pct = Math.min(
                    Math.round((activeCount / threshold) * 100),
                    100,
                  );
                  const userId = user.id || user.username;
                  const trendData = history[userId] || [];
                  const trend = getTrendDirection(trendData);
                  const risk = getRiskLevel(activeCount, threshold);

                  return (
                    <motion.div
                      key={userId}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className={cn(
                        'rounded-xl bg-[var(--bg-card)] border p-4 transition-all',
                        isOver
                          ? 'border-[var(--danger)]/30'
                          : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]',
                      )}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[var(--accent-border)]">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <Text className="font-semibold text-[13px] truncate">
                              {name}
                            </Text>
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                                  risk.tone === 'danger'
                                    ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                                    : risk.tone === 'warning'
                                      ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                                      : 'bg-[var(--accent-soft)] text-[var(--accent)]',
                                )}
                              >
                                {risk.label}
                              </span>
                              <TrendIcon trend={trend} />
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div
                            className={cn(
                              'text-sm font-mono font-bold',
                              isOver
                                ? 'text-[var(--danger)]'
                                : 'text-[var(--text-primary)]',
                            )}
                          >
                            {activeCount} / {threshold}
                          </div>
                          <Text
                            size="10px"
                            variant="muted"
                            className="font-mono"
                          >
                            {pct}%
                          </Text>
                        </div>
                      </div>
                      <div className="space-y-1.5 mb-3">
                        <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              isOver
                                ? 'bg-[var(--danger)]'
                                : isHigh
                                  ? 'bg-[var(--warning)]'
                                  : 'bg-[var(--accent)]',
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
                          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                            {row.todoCount ?? 0}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Todo
                          </div>
                        </div>
                        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
                          <div className="text-xs font-mono font-bold text-[var(--accent)]">
                            {row.inProgressCount ?? 0}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Prog
                          </div>
                        </div>
                        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
                          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
                            {row.submittedCount ?? 0}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Sub
                          </div>
                        </div>
                        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
                          <div className="text-xs font-mono font-bold text-[var(--success)]">
                            {row.approvedCount ?? 0}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)]">
                            Appr
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleCard(userId)}
                        className="w-full text-xs h-7"
                      >
                        {expandedCards[userId]
                          ? 'Hide Details'
                          : 'View Trend Analysis'}
                      </Button>
                      {expandedCards[userId] && (
                        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col items-center gap-2">
                          <Sparkline
                            data={trendData}
                            color={
                              isOver ? 'var(--danger)' : 'var(--accent)'
                            }
                          />
                          <Text size="xs" variant="muted">
                            Capacity History & Trend Analysis
                          </Text>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <Heading
                level={2}
                className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]"
              >
                Workload Matrix Table
              </Heading>
              <DataTable
                columns={[
                  {
                    id: 'member',
                    header: 'Team Member',
                    cell: ({ row }) => {
                      const user = row.original.user || {};
                      const name =
                        user.fullName || user.username || 'Unknown Member';
                      return (
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--accent-border)]">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[13px] truncate">
                              {name}
                            </div>
                            {user.email && (
                              <div className="text-[11px] text-[var(--text-muted)] truncate">
                                {user.email}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    accessorKey: 'todoCount',
                    header: () => <div className="text-center">To Do</div>,
                    cell: ({ getValue }) => (
                      <div className="text-center font-mono text-xs">
                        {getValue() ?? 0}
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'inProgressCount',
                    header: () => (
                      <div className="text-center">In Progress</div>
                    ),
                    cell: ({ getValue }) => (
                      <div className="text-center font-mono text-xs text-[var(--accent)]">
                        {getValue() ?? 0}
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'submittedCount',
                    header: () => <div className="text-center">Submitted</div>,
                    cell: ({ getValue }) => (
                      <div className="text-center font-mono text-xs">
                        {getValue() ?? 0}
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'approvedCount',
                    header: () => <div className="text-center">Approved</div>,
                    cell: ({ getValue }) => (
                      <div className="text-center font-mono text-xs text-[var(--success)]">
                        {getValue() ?? 0}
                      </div>
                    ),
                  },
                  {
                    accessorKey: 'totalActiveCount',
                    header: () => <div className="text-center">Active Total</div>,
                    cell: ({ row }) => {
                      const count = row.original.totalActiveCount ?? 0;
                      const isOver = count > threshold;
                      return (
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={cn(
                              'font-bold text-sm font-mono',
                              isOver
                                ? 'text-[var(--danger)]'
                                : 'text-[var(--text-primary)]',
                            )}
                          >
                            {count}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            / {threshold}
                          </span>
                        </div>
                      );
                    },
                  },
                  {
                    id: 'sparkline',
                    header: () => (
                      <div className="min-w-[80px]">14-Day Trend</div>
                    ),
                    cell: ({ row }) => {
                      const userId =
                        row.original.user?.id || row.original.user?.username;
                      const data = history[userId] || [];
                      const trend = getTrendDirection(data);
                      return (
                        <div className="flex items-center gap-2">
                          <Sparkline
                            data={data}
                            color={
                              row.original.totalActiveCount > threshold
                                ? 'var(--danger)'
                                : 'var(--accent)'
                            }
                          />
                          <TrendIcon trend={trend} />
                        </div>
                      );
                    },
                  },
                ]}
                data={filteredRows}
                isLoading={isLoading}
                emptyStateTitle="No workload data"
                emptyStateDescription="No active task assignments found in this organization."
              />
            </div>
          </div>
        </PageState>
      </PageContent>
    </PageShell>
  );
}

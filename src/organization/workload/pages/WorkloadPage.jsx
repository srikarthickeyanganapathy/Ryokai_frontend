import React, { useMemo, useState, useEffect } from 'react';
import {
  Gauge,
  Building2,
} from '@/shared/ui/Icons';
import { toast } from 'sonner';
import { usePermissions } from '@/identity';
import { useWorkload } from '@/organization/workload/features/hooks/useWorkload';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  PageShell, PageHero, PageContent,
} from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import {
  deriveOrgStats,
  getTeamHealthScore,
} from '@/organization/workload/features/utils/workloadCalculations';
import {
  OrgSnapshotBanner,
  AIInsightsPanel,
  TeamHealthCard,
  DistributionChart,
  LeaderboardPanel,
  RebalanceSimulator,
} from '@/organization/workload/features/components';
import {
  getThresholdKey,
  ensureHistory,
} from '../features/utils/workloadHistoryStorage';
import { CapacityThresholdControl } from '../components/CapacityThresholdControl';
import { HeatmapMatrix } from '../components/HeatmapMatrix';
import { WorkloadFilters } from '../components/WorkloadFilters';
import { MemberUtilizationGrid } from '../components/MemberUtilizationGrid';
import { WorkloadMatrixTable } from '../components/WorkloadMatrixTable';
import { Skeleton } from '@/shared/ui/Skeleton';

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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate org-scoped history init
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
        <CapacityThresholdControl
          threshold={threshold}
          showThresholdInput={showThresholdInput}
          tempThreshold={tempThreshold}
          isLoading={isLoading}
          onOpenThresholdInput={() => setShowThresholdInput(true)}
          onTempThresholdChange={setTempThreshold}
          onSaveThreshold={handleSaveThreshold}
          onRefresh={() => refetch()}
        />
      </PageHero>

      <PageContent>
        <PageState
          state={pageState}
          stateProps={{skeleton: <WorkloadSkeleton />, 
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
            <WorkloadFilters value={filter} onChange={setFilter} />

            {/* Utilization Cards Grid */}
            <MemberUtilizationGrid
              rows={filteredRows}
              threshold={threshold}
              history={history}
              expandedCards={expandedCards}
              onToggleCard={toggleCard}
            />

            {/* Workload Matrix Table */}
            <WorkloadMatrixTable
              rows={filteredRows}
              threshold={threshold}
              history={history}
              isLoading={isLoading}
            />
          </div>
        </PageState>
      </PageContent>
    </PageShell>
  );
}

function WorkloadSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton className="h-24 w-full rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-52 rounded-2xl" />
        <div className="md:col-span-2 space-y-3"><Skeleton className="h-52 rounded-2xl" /></div>
      </div>
      <div className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] overflow-hidden">
        <div className="h-10 bg-[var(--bg-subtle)]" />
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-none border-b border-[var(--border-subtle)]" />)}
      </div>
    </div>
  );
}

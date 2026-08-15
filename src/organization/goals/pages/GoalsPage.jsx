import React, { useState, useMemo } from 'react';
import { Plus } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import { usePermissions } from '@/identity';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/organization/goals/features/hooks/useGoals';
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import {
  GoalCard,
  GoalStatsHeader,
  GoalControls,
  GoalModal,
} from '@/organization/goals/features/components';
import {
  deriveGoalStats,
  filterGoalsByStatus,
  sortGoals,
} from '@/organization/goals/features/utils/goalCalculations';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Building2, Target } from 'lucide-react';

export function GoalsPage() {
  const { workspaceMode } = useWorkspace();
  const { userOrg, canManageGoals } = usePermissions();
  const orgId = userOrg?.id;
  const { data: goals = [], isLoading } = useGoals(orgId);
  const createGoal = useCreateGoal(orgId);
  const updateGoal = useUpdateGoal(orgId);
  const deleteGoal = useDeleteGoal(orgId);

  const [expanded, setExpanded] = useState({});
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('progress_desc');

  const toggle = (id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const openNew = () =>
    setEditing({
      title: '',
      description: '',
      period: '',
      status: 'ON_TRACK',
      startDate: '',
      endDate: '',
      keyResults: [{ title: '', currentValue: 0, targetValue: 100, unit: '%' }],
    });

  const handleSave = () => {
    const payload = {
      ...editing,
      startDate: editing.startDate || null,
      endDate: editing.endDate || null,
    };

    if (editing.id) {
      updateGoal.mutate(
        { goalId: editing.id, payload },
        {
          onSuccess: () => {
            setEditing(null);
          },
        },
      );
    } else {
      createGoal.mutate(payload, {
        onSuccess: (data) => {
          setEditing(null);
          // Auto-expand the newly created goal so the user can immediately
          // see and interact with its key results.
          if (data?.id) {
            setExpanded((prev) => ({ ...prev, [data.id]: true }));
          }
        },
      });
    }
  };

  const updateKeyResultValue = (goal, krId, newValue) => {
    const payload = {
      ...goal,
      startDate: goal.startDate || null,
      endDate: goal.endDate || null,
      keyResults: (goal.keyResults || []).map((kr) =>
        kr.id === krId ? { ...kr, currentValue: newValue } : kr,
      ),
    };
    updateGoal.mutate({ goalId: goal.id, payload });
  };

  // ── Derived statistics (no extra API calls) ──
  const stats = useMemo(() => deriveGoalStats(goals), [goals]);

  // ── Filter counts for tab badges ──
  const filterCounts = useMemo(
    () => ({
      ALL: goals.length,
      ON_TRACK: goals.filter((g) => g.status === 'ON_TRACK').length,
      AT_RISK: goals.filter((g) => g.status === 'AT_RISK').length,
      OFF_TRACK: goals.filter((g) => g.status === 'OFF_TRACK').length,
      ACHIEVED: goals.filter((g) => g.status === 'ACHIEVED').length,
    }),
    [goals],
  );

  // ── Filtered + sorted goals ──
  const visibleGoals = useMemo(
    () => sortGoals(filterGoalsByStatus(goals, filter), sortBy),
    [goals, filter, sortBy],
  );

  // Guard: requires ORG workspace
  if (workspaceMode !== 'ORG' || !orgId) {
    return (
      <PageShell maxWidth="narrow">
        <PageState state="unauthorized" moduleId="goals" stateProps={{
          title: 'Enterprise goals & OKRs require organization mode',
          description: 'Strategic Goals & Key Results are managed at the Organization level. Switch to an active Organization.',
          icon: Building2,
          tone: 'neutral',
        }} />
      </PageShell>
    );
  }

  const pageState = isLoading ? 'loading' : goals.length === 0 ? 'empty' : 'ready';

  return (
    <PageShell maxWidth="narrow">
      <PageHero
        title="Strategic goals & OKRs"
        subtitle="Track key organizational objectives, target metrics, and progress outcomes across departments."
        eyebrow="Goals"
        icon={Target}
      >
        {canManageGoals && (
          <Button onClick={openNew} className="gap-2 h-9 text-xs">
            <Plus className="w-4 h-4" /> New goal
          </Button>
        )}
      </PageHero>

      <PageContent>
        <PageState
          state={pageState}
          moduleId="goals"
          stateProps={{skeleton: <GoalsSkeleton />,  loadingVariant: 'cards', onAction: canManageGoals ? openNew : undefined }}
        >
          {goals.length > 0 && (
            <>
              <GoalStatsHeader stats={stats} />
              <GoalControls
                filter={filter}
                setFilter={setFilter}
                sortBy={sortBy}
                setSortBy={setSortBy}
                counts={filterCounts}
              />
            </>
          )}

          <div className="space-y-3">
            {visibleGoals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                expanded={expanded[goal.id]}
                onToggle={() => toggle(goal.id)}
                canManage={canManageGoals}
                onUpdateKR={updateKeyResultValue}
                onEdit={() =>
                  setEditing({
                    ...goal,
                    startDate: goal.startDate || '',
                    endDate: goal.endDate || '',
                    period: goal.period || '',
                    description: goal.description || '',
                  })
                }
                onDelete={() => deleteGoal.mutate(goal.id)}
              />
            ))}
          </div>

          {goals.length > 0 && visibleGoals.length === 0 && (
            <div className="text-center py-12">
              <Text variant="muted" className="text-sm">
                No goals match the selected filter.
              </Text>
            </div>
          )}
        </PageState>
      </PageContent>

      <GoalModal
        open={!!editing}
        editing={editing}
        setEditing={setEditing}
        onSave={handleSave}
        isPending={createGoal.isPending || updateGoal.isPending}
      />
    </PageShell>
  );
}
function GoalsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-32 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <div className="flex-1" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
          <div className="grid grid-cols-2 gap-3 pt-1">
            {Array.from({ length: 2 }).map((_, j) => (
              <div key={j} className="space-y-1.5"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-1.5 w-full rounded-full" /></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { Plus, Target, Building2 } from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Heading, Text } from '@/shared/ui/Typography';
import { usePermissions } from '@/identity';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import {
  useGoals,
  useCreateGoal,
  useUpdateGoal,
  useDeleteGoal,
} from '@/organization/goals/features/hooks/useGoals';
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
  FrameworkEmptyState,
} from '@/shared/workspace-framework';
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
      <WorkspaceShell maxWidth="narrow">
        <FrameworkEmptyState
          icon={Building2}
          title="Enterprise goals & OKRs require organization mode"
          description="Strategic Goals & Key Results are managed at the Organization level. Please switch your workspace mode to an active Organization in the sidebar to view OKRs."
        />
      </WorkspaceShell>
    );
  }

  const pageState = isLoading ? 'loading' : goals.length === 0 ? 'empty' : 'ready';

  return (
    <WorkspaceShell maxWidth="narrow">
      <ManagementLayout
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                  Goals
                </span>
              </div>
              <Heading
                level={1}
                className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate"
              >
                <Target
                  className="w-5 h-5 text-[var(--accent)] shrink-0"
                  aria-hidden="true"
                />
                Strategic goals & OKRs
              </Heading>
              <Text variant="muted" className="text-[13px] leading-relaxed">
                Track key organizational objectives, target metrics, and progress
                outcomes across departments.
              </Text>
            </div>
            {canManageGoals && (
              <div className="flex items-center gap-2 shrink-0">
                <Button onClick={openNew} className="gap-2 h-9 text-xs">
                  <Plus className="w-4 h-4" /> New goal
                </Button>
              </div>
            )}
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: Target,
            title: 'No strategic goals yet',
            description:
              'Goals help your organization align teams around measurable outcomes. Create your first goal to start tracking OKRs.',
            actionLabel: canManageGoals ? 'Create first goal' : undefined,
            onAction: canManageGoals ? openNew : undefined,
          }}
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
        </PageStateContainer>
      </ManagementLayout>

      <GoalModal
        open={!!editing}
        editing={editing}
        setEditing={setEditing}
        onSave={handleSave}
        isPending={createGoal.isPending || updateGoal.isPending}
      />
    </WorkspaceShell>
  );
}
import React, { useState } from 'react'
import { Plus, Target, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text, Label } from '@/shared/ui/Typography'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/identity'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useGoals, useCreateGoal, useUpdateGoal } from '@/organization/goals/features/hooks/useGoals'
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
  FrameworkEmptyState,
} from '@/shared/workspace-framework'

const STATUS_COLORS = {
  ON_TRACK: 'text-[var(--accent)] bg-[var(--accent-soft)]',
  AT_RISK: 'text-[var(--warning)] bg-[var(--warning-soft)]',
  OFF_TRACK: 'text-[var(--danger)] bg-[var(--danger-soft)]',
  ACHIEVED: 'text-[var(--accent)] bg-[var(--accent-soft)]',
}

export function GoalsPage() {
  const { workspaceMode } = useWorkspace()
  const { userOrg, canManageGoals } = usePermissions()
  const orgId = userOrg?.id
  const { data: goals = [], isLoading } = useGoals(orgId)
  const createGoal = useCreateGoal(orgId)
  const updateGoal = useUpdateGoal(orgId)

  const [expanded, setExpanded] = useState({})
  const [editing, setEditing] = useState(null)

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const openNew = () => setEditing({
    title: '', description: '', period: '', status: 'ON_TRACK', startDate: '', endDate: '',
    keyResults: [{ title: '', currentValue: 0, targetValue: 100, unit: '%' }],
  })

  const handleSave = () => {
    createGoal.mutate(editing, { onSuccess: () => setEditing(null) })
  }

  const updateKeyResultValue = (goal, krId, newValue) => {
    const payload = {
      ...goal,
      keyResults: goal.keyResults.map(kr => kr.id === krId ? { ...kr, currentValue: newValue } : kr),
    }
    updateGoal.mutate({ goalId: goal.id, payload })
  }

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
    )
  }

  const pageState = isLoading ? 'loading' : goals.length === 0 ? 'empty' : 'ready'

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
              <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate">
                <Target className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
                Strategic goals & OKRs
              </Heading>
              <Text variant="muted" className="text-[13px] leading-relaxed">
                Track key organizational objectives, target metrics, and progress outcomes across departments.
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
            title: 'No active OKRs set',
            description: 'Create your first organizational goal to align teams on key outcomes.',
            actionLabel: canManageGoals ? 'New goal' : undefined,
            onAction: canManageGoals ? openNew : undefined,
          }}
        >
          <div className="space-y-3">
            {goals.map(goal => (
              <div key={goal.id} className="rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] overflow-hidden">
                <button
                  onClick={() => toggle(goal.id)}
                  className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--bg-subtle)] transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Text className="font-semibold text-sm">{goal.title}</Text>
                      {goal.period && <span className="text-[10px] text-[var(--text-muted)] font-mono border border-[var(--color-border-subtle)] px-2 py-0.5 rounded-full">{goal.period}</span>}
                      <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold uppercase', STATUS_COLORS[goal.status])}>
                        {goal.status.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden flex-1 max-w-md">
                        <div className="h-full bg-[var(--accent)] rounded-full transition-all duration-300" style={{ width: `${goal.progress}%` }} />
                      </div>
                      <Text size="xs" variant="muted" className="font-mono text-xs">{goal.progress}%</Text>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <ChevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform duration-200', expanded[goal.id] && 'rotate-180')} />
                  </div>
                </button>

                {expanded[goal.id] && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border-subtle)] pt-4 bg-[var(--bg-subtle)]/30">
                    {goal.keyResults.map(kr => (
                      <div key={kr.id} className="flex items-center gap-3 bg-[var(--bg-base)] p-3 rounded-lg border border-[var(--color-border-subtle)]">
                        <Text size="xs" className="flex-1 font-medium">{kr.title}</Text>
                        <Input
                          type="number"
                          value={kr.currentValue}
                          onChange={(e) => updateKeyResultValue(goal, kr.id, Number(e.target.value))}
                          disabled={!canManageGoals}
                          className="w-20 text-center h-8 text-xs font-mono"
                        />
                        <Text size="xs" variant="muted" className="font-mono text-xs">/ {kr.targetValue} {kr.unit}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PageStateContainer>
      </ManagementLayout>

      <Modal open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <ModalContent className="sm:max-w-lg">
          {editing && (
            <>
              <ModalHeader>
                <ModalTitle>{editing.id ? 'Edit goal' : 'New strategic goal'}</ModalTitle>
              </ModalHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Goal title</Label>
                  <Input placeholder="e.g. Expand Enterprise Customer Base" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Period</Label>
                    <Input placeholder="e.g. Q3 2026" value={editing.period} onChange={(e) => setEditing({ ...editing, period: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Description</Label>
                    <Input placeholder="Brief overview" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Start date</Label>
                    <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">End date</Label>
                    <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button variant="ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={createGoal.isPending}>
                    {createGoal.isPending ? 'Saving…' : 'Create goal'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </WorkspaceShell>
  )
}
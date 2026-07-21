import React, { useState } from 'react'
import { Plus, Target, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text, Label } from '@/shared/ui/Typography'
import { Modal, ModalContent, ModalHeader, ModalTitle } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useGoals, useCreateGoal, useUpdateGoal } from '@/features/goals/hooks/useGoals'

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

  if (workspaceMode !== 'ORG' || !orgId) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-4 border border-[var(--accent-border)]">
          <Building2 className="w-6 h-6" />
        </div>
        <Heading level={3} className="text-lg font-semibold">Enterprise Goals & OKRs require Organization Mode</Heading>
        <Text variant="muted" className="mt-2 max-w-md text-xs leading-relaxed">
          Strategic Goals & Key Results are managed at the Organization level. Please switch your workspace mode to an active Organization in the sidebar to view OKRs.
        </Text>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 space-y-6" role="region" aria-label="Goals and OKRs">
      
      {/* 📊 MANAGE MODE STICKY HEADER */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              MANAGE Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Strategic Alignment & Enterprise OKRs</span>
          </div>
          <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">Strategic Goals & OKRs</Heading>
          <Text variant="muted" className="text-[13px] mt-1">Track key organizational objectives, target metrics, and progress outcomes across departments.</Text>
        </div>

        {canManageGoals && (
          <Button onClick={openNew} className="gap-2 h-9 text-xs">
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        )}
      </div>

      {isLoading ? (
        <Text variant="muted" className="text-xs">Loading OKRs…</Text>
      ) : goals.length === 0 ? (
        <div className="text-center p-12 rounded-2xl border border-dashed border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]">
          <Target className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <Heading level={4} className="text-sm font-semibold">No active OKRs set</Heading>
          <Text variant="muted" className="mt-1 text-xs">Create your first organizational goal to align teams on key outcomes.</Text>
        </div>
      ) : (
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
      )}

      <Modal open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <ModalContent className="sm:max-w-lg">
          {editing && (
            <>
              <ModalHeader>
                <ModalTitle>{editing.id ? 'Edit Goal' : 'New Strategic Goal'}</ModalTitle>
              </ModalHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Goal Title</Label>
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
                    <Label className="text-xs font-medium">Start Date</Label>
                    <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">End Date</Label>
                    <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
                  </div>
                </div>
                
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--border-subtle)]">
                  <Button variant="ghost" onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={createGoal.isPending}>
                    {createGoal.isPending ? 'Saving...' : 'Create Goal'}
                  </Button>
                </div>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

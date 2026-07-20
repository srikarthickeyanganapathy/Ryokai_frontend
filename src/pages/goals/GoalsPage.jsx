import React, { useState } from 'react'
import { Plus, Target, ChevronDown } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useGoals, useCreateGoal, useUpdateGoal } from '@/features/goals/hooks/useGoals'

const STATUS_COLORS = {
  ON_TRACK: 'text-[var(--accent)] bg-[var(--accent-soft)]',
  AT_RISK: 'text-[var(--warning)] bg-[var(--warning-soft)]',
  OFF_TRACK: 'text-[var(--danger)] bg-[var(--danger-soft)]',
  ACHIEVED: 'text-[var(--accent)] bg-[var(--accent-soft)]',
}

export function GoalsPage() {
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

  if (!orgId) return <Text variant="muted" className="p-8">Join an organization to view goals.</Text>

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <Heading level={2}>Goals & OKRs</Heading>
        {canManageGoals && (
          <Button onClick={openNew} className="gap-2">
            <Plus className="w-4 h-4" /> New Goal
          </Button>
        )}
      </div>

      {isLoading ? (
        <Text variant="muted">Loading…</Text>
      ) : goals.length === 0 ? (
        <div className="text-center p-12 rounded-lg border border-dashed border-[var(--color-border-default)]">
          <Target className="w-10 h-10 mx-auto text-[var(--text-muted)] mb-3 opacity-50" />
          <Text variant="muted">No goals set for this quarter yet.</Text>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => (
            <div key={goal.id} className="rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)] overflow-hidden">
              <button
                onClick={() => toggle(goal.id)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <Text className="font-medium">{goal.title}</Text>
                    {goal.period && <span className="text-[11px] text-[var(--text-muted)] font-medium border border-[var(--color-border-subtle)] px-2 py-0.5 rounded-full">{goal.period}</span>}
                    <span className={cn('px-2 py-0.5 rounded-full text-[11px] font-medium uppercase', STATUS_COLORS[goal.status])}>
                      {goal.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden w-64">
                    <div className="h-full bg-[var(--accent)] rounded-full" style={{ width: `${goal.progress}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Text size="sm" variant="muted">{goal.progress}%</Text>
                  <ChevronDown className={cn('w-4 h-4 transition-transform', expanded[goal.id] && 'rotate-180')} />
                </div>
              </button>

              {expanded[goal.id] && (
                <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-border-subtle)] pt-4">
                  {goal.keyResults.map(kr => (
                    <div key={kr.id} className="flex items-center gap-3">
                      <Text size="sm" className="flex-1">{kr.title}</Text>
                      <Input
                        type="number"
                        value={kr.currentValue}
                        onChange={(e) => updateKeyResultValue(goal, kr.id, Number(e.target.value))}
                        disabled={!canManageGoals}
                        className="w-20 text-center"
                      />
                      <Text size="sm" variant="muted">/ {kr.targetValue} {kr.unit}</Text>
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
            <div className="space-y-4">
              <Input placeholder="Goal title" value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} />
              <div className="grid grid-cols-2 gap-3">
                <Input placeholder="Period (e.g. Q1 2024)" value={editing.period} onChange={(e) => setEditing({ ...editing, period: e.target.value })} />
                <Input placeholder="Description" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
                <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
              </div>
              <Button onClick={handleSave} disabled={createGoal.isPending} className="w-full">Create Goal</Button>
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

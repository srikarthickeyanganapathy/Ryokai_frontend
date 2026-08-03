// File: src/organization/workload/pages/WorkloadPage.jsx
import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gauge, Users, AlertCircle, TrendingUp, Building2, RefreshCw } from 'lucide-react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/identity'
import { useWorkload } from '@/organization/workload/features/hooks/useWorkload'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { WorkspaceShell, CommandLayout, PageStateContainer, FrameworkEmptyState } from '@/shared/workspace-framework'
import { DataTable } from '@/shared/ui/data-table/DataTable'

const OVER_ALLOCATED_THRESHOLD = 8

export function WorkloadPage() {
  const { activeOrganization } = useWorkspace()
  const { userOrg } = usePermissions()
  const orgId = activeOrganization?.id || userOrg?.id

  const { data: rows = [], isLoading, isError, error, refetch } = useWorkload(orgId)

  const summary = useMemo(() => {
    if (!rows || rows.length === 0) return { memberCount: 0, totalActive: 0, overAllocated: 0, avgUtilization: 0 }
    const memberCount = rows.length
    const totalActive = rows.reduce((sum, r) => sum + (r.totalActiveCount ?? 0), 0)
    const overAllocated = rows.filter((r) => (r.totalActiveCount ?? 0) > OVER_ALLOCATED_THRESHOLD).length
    const totalCapacity = memberCount * OVER_ALLOCATED_THRESHOLD
    const avgUtilization = totalCapacity > 0 ? Math.min(Math.round((totalActive / totalCapacity) * 100), 100) : 0
    return { memberCount, totalActive, overAllocated, avgUtilization }
  }, [rows])

  const columns = useMemo(() => [
    {
      id: 'member',
      header: 'Team Member',
      cell: ({ row }) => {
        const user = row.original.user || {}
        const name = user.fullName || user.username || 'Unknown Member'
        const email = user.email || ''
        return (
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0 border border-[var(--accent-border)]">{name.charAt(0).toUpperCase()}</div>
            <div className="min-w-0">
              <div className="font-semibold text-[13px] text-[var(--text-primary)] truncate tracking-tight">{name}</div>
              {email && <div className="text-[11px] text-[var(--text-muted)] truncate">{email}</div>}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'todoCount',
      header: () => <div className="text-center">To Do</div>,
      cell: ({ getValue }) => <div className="text-center font-mono text-xs text-[var(--text-secondary)]">{getValue() ?? 0}</div>,
    },
    {
      accessorKey: 'inProgressCount',
      header: () => <div className="text-center">In Progress</div>,
      cell: ({ getValue }) => <div className="text-center font-mono text-xs font-medium text-[var(--accent)]">{getValue() ?? 0}</div>,
    },
    {
      accessorKey: 'submittedCount',
      header: () => <div className="text-center">Submitted</div>,
      cell: ({ getValue }) => <div className="text-center font-mono text-xs text-[var(--text-secondary)]">{getValue() ?? 0}</div>,
    },
    {
      accessorKey: 'approvedCount',
      header: () => <div className="text-center">Approved</div>,
      cell: ({ getValue }) => <div className="text-center font-mono text-xs text-[var(--success)] font-medium">{getValue() ?? 0}</div>,
    },
    {
      accessorKey: 'totalActiveCount',
      header: () => <div className="text-center">Active Total</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount ?? 0
        const isOver = count > OVER_ALLOCATED_THRESHOLD
        return (
          <div className="flex items-center justify-center gap-1.5">
            <span className={cn('font-bold text-sm font-mono', isOver ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>{count}</span>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">/ {OVER_ALLOCATED_THRESHOLD}</span>
          </div>
        )
      },
    },
    {
      id: 'utilizationBar',
      header: () => <div className="min-w-[140px]">Utilization</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount ?? 0
        const pct = Math.min(Math.round((count / OVER_ALLOCATED_THRESHOLD) * 100), 100)
        const isOver = count > OVER_ALLOCATED_THRESHOLD
        const isHigh = count >= 6 && !isOver

        return (
          <div className="flex flex-col gap-1 min-w-[140px]">
            <div className="flex items-center justify-between text-[11px]">
              <span className={cn('font-medium', isOver ? 'text-[var(--danger)]' : isHigh ? 'text-[var(--warning)]' : 'text-[var(--accent)]')}>
                {isOver ? 'Over-allocated' : isHigh ? 'High Load' : 'Optimal'}
              </span>
              <span className="font-mono text-[var(--text-muted)]">{pct}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div className={cn('h-full rounded-full transition-all duration-500', isOver ? 'bg-[var(--danger)]' : isHigh ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]')} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      },
    },
  ], [])

  if (!orgId) {
    return (
      <WorkspaceShell maxWidth="default">
        <FrameworkEmptyState icon={Building2} title="Select an organization to view workload" description="Resource capacity and team member utilization tracking requires an active organization workspace." />
      </WorkspaceShell>
    )
  }

  const pageState = isLoading ? 'loading' : isError ? 'error' : rows.length === 0 ? 'empty' : 'ready'

  return (
    <WorkspaceShell maxWidth="default">
      <CommandLayout
        hero={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-subtle)]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">Resource Capacity</span>
              </div>
              <Heading level={1} className="tracking-tight text-[18px] font-semibold flex items-center gap-2.5">
                <Gauge className="w-5 h-5 text-[var(--accent)] shrink-0" /> Team Capacity & Utilization
              </Heading>
              <Text variant="muted" className="text-[13px] mt-0.5">Monitor team load balance and task allocation bottlenecks.</Text>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-1.5 text-[12px] h-8" disabled={isLoading}>
              <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} /> Refresh
            </Button>
          </div>
        }
        metrics={
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                <Users className="w-4 h-4 text-[var(--accent)]" />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[11px] font-medium">Team Members</Text>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight">{summary.memberCount}</div>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                <TrendingUp className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[11px] font-medium">Active Assignments</Text>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight">{summary.totalActive}</div>
              </div>
            </div>
            <div className={cn('rounded-xl bg-[var(--bg-card)] border p-4 shadow-sm flex items-center gap-3.5', summary.overAllocated > 0 ? 'border-[var(--danger)]/30 bg-[var(--danger-soft)]/10' : 'border-[var(--border-subtle)]')}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border', summary.overAllocated > 0 ? 'bg-[var(--danger-soft)] border-[var(--danger)]/30' : 'bg-[var(--bg-subtle)] border-[var(--border-subtle)]')}>
                <AlertCircle className={cn('w-4 h-4', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')} />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[11px] font-medium">Over-allocated</Text>
                <div className={cn('text-xl font-bold tabular-nums tracking-tight', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>{summary.overAllocated}</div>
              </div>
            </div>
            <div className="rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] p-4 shadow-sm flex items-center gap-3.5">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center shrink-0 border border-[var(--border-subtle)]">
                <Gauge className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[11px] font-medium">Average Load</Text>
                <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight">{summary.avgUtilization}%</div>
              </div>
            </div>
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'dashboard', rows: 5 }}
          emptyConfig={{ icon: Gauge, title: 'No Workload Matrix Available', description: 'There are currently no active workload assignments or team member metrics for this organization.', actionLabel: 'Refresh Workload', onAction: () => refetch() }}
          errorConfig={{ title: 'Failed to load Workload Data', description: error?.response?.data?.message || error?.message || 'Server encountered an issue retrieving workload metrics.', onRetry: () => refetch() }}
        >
          <div className="flex flex-col gap-8 mt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Heading level={2} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Team Member Utilization</Heading>
                  <Text variant="muted" className="text-[12px]">Visual breakdown of task allocation vs threshold limit per team member.</Text>
                </div>
                <span className="text-[11px] font-mono text-[var(--text-muted)] bg-[var(--bg-subtle)] px-2.5 py-1 rounded-md border border-[var(--border-subtle)]">Capacity: {OVER_ALLOCATED_THRESHOLD} tasks/member</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {rows.map((row) => {
                  const user = row.user || {}
                  const name = user.fullName || user.username || 'Team Member'
                  const activeCount = row.totalActiveCount ?? 0
                  const isOver = activeCount > OVER_ALLOCATED_THRESHOLD
                  const isHigh = activeCount >= 6 && !isOver
                  const pct = Math.min(Math.round((activeCount / OVER_ALLOCATED_THRESHOLD) * 100), 100)

                  return (
                    <div key={user.id || name} className={cn('rounded-xl bg-[var(--bg-card)] border p-4 transition-all', isOver ? 'border-[var(--danger)]/30 bg-[var(--danger-soft)]/5' : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]')}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[var(--accent-border)]">{name.charAt(0).toUpperCase()}</div>
                          <div className="min-w-0">
                            <Text className="font-semibold text-[13px] text-[var(--text-primary)] truncate">{name}</Text>
                            <Text size="xs" variant="muted" className="text-[11px] truncate">{user.email || 'Organization Member'}</Text>
                          </div>
                        </div>
                        <div className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', isOver ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30' : isHigh ? 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30' : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]')}>
                          {isOver ? 'Over Capacity' : isHigh ? 'Near Capacity' : 'Balanced'}
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-mono">
                          <span className="text-[var(--text-secondary)]">{activeCount} active task{activeCount === 1 ? '' : 's'}</span>
                          <span className={cn('font-bold', isOver ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>{pct}% utilization</span>
                        </div>
                        <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
                          <div className={cn('h-full rounded-full transition-all duration-500', isOver ? 'bg-[var(--danger)]' : isHigh ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]')} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)] text-center text-[11px]">
                        <div className="bg-[var(--bg-subtle)]/50 p-1.5 rounded border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">To Do</span>
                          <span className="font-mono font-semibold text-[var(--text-primary)]">{row.todoCount ?? 0}</span>
                        </div>
                        <div className="bg-[var(--bg-subtle)]/50 p-1.5 rounded border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">In Prog</span>
                          <span className="font-mono font-semibold text-[var(--accent)]">{row.inProgressCount ?? 0}</span>
                        </div>
                        <div className="bg-[var(--bg-subtle)]/50 p-1.5 rounded border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Submit</span>
                          <span className="font-mono font-semibold text-[var(--text-primary)]">{row.submittedCount ?? 0}</span>
                        </div>
                        <div className="bg-[var(--bg-subtle)]/50 p-1.5 rounded border border-[var(--border-subtle)]">
                          <span className="text-[var(--text-muted)] block text-[10px]">Done</span>
                          <span className="font-mono font-semibold text-[var(--success)]">{row.approvedCount ?? 0}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
            <div className="space-y-3">
              <Heading level={2} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">Workload Matrix Table</Heading>
              <DataTable columns={columns} data={rows} isLoading={isLoading} emptyStateTitle="No workload data" emptyStateDescription="No active task assignments found in this organization." />
            </div>
          </div>
        </PageStateContainer>
      </CommandLayout>
    </WorkspaceShell>
  )
}
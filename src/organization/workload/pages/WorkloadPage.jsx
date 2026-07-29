import React, { useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { usePermissions } from '@/identity'
import { useWorkload } from '@/organization/workload/features/hooks/useWorkload'
import { cn } from '@/shared/lib/cn'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { Gauge, Users, AlertCircle } from 'lucide-react'
import {
  WorkspaceShell,
  InsightLayout,
  InsightSection,
  PageStateContainer,
  FrameworkEmptyState,
} from '@/shared/workspace-framework'

const COLUMNS = [
  { key: 'todoCount', label: 'To do' },
  { key: 'inProgressCount', label: 'In progress' },
  { key: 'submittedCount', label: 'Submitted' },
  { key: 'approvedCount', label: 'Approved' },
  { key: 'rejectedCount', label: 'Rejected' },
]

const OVER_ALLOCATED_THRESHOLD = 8

export function WorkloadPage() {
  const { userOrg } = usePermissions()
  const { data: rows = [], isLoading, isError, error, refetch } = useWorkload(userOrg?.id)

  // Tier 1 summary -- mirrors the hero-KPI pattern used on the Analytics page,
  // so the reader gets the headline signal before the row-by-row detail.
  const summary = useMemo(() => {
    const overAllocated = rows.filter(r => (r.totalActiveCount ?? 0) > OVER_ALLOCATED_THRESHOLD).length
    const totalActive = rows.reduce((sum, r) => sum + (r.totalActiveCount ?? 0), 0)
    return { memberCount: rows.length, totalActive, overAllocated }
  }, [rows])

  const columns = useMemo(() => [
    {
      id: 'member',
      header: 'Member',
      cell: ({ row }) => <span className="font-medium">{row.original.user?.username || 'Unknown'}</span>,
    },
    ...COLUMNS.map(c => ({
      accessorKey: c.key,
      header: () => <div className="text-center">{c.label}</div>,
      cell: ({ getValue }) => <div className="text-center">{getValue() ?? 0}</div>,
    })),
    {
      accessorKey: 'totalActiveCount',
      header: () => <div className="text-center">Active total</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount ?? 0
        return (
          <div className={cn('text-center font-semibold', count > OVER_ALLOCATED_THRESHOLD ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
            {count}
          </div>
        )
      }
    }
  ], [])

  if (!userOrg) {
    return (
      <WorkspaceShell maxWidth="narrow">
        <FrameworkEmptyState
          icon={Gauge}
          title="Join an organization to view workload"
          description="Resource capacity tracking is available within organization workspaces."
        />
      </WorkspaceShell>
    )
  }

  const pageState = isLoading ? 'loading' : isError ? 'error' : 'ready'

  return (
    <WorkspaceShell maxWidth="default">
      <InsightLayout
        header={
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                Workload
              </span>
            </div>
            <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate">
              <Gauge className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
              Resource capacity
            </Heading>
            <Text variant="muted" className="text-[13px] leading-relaxed">
              Audit team load distribution, active assignments, and over-allocation bottlenecks.
            </Text>
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'table' }}
          errorConfig={{
            title: 'Workload data unavailable',
            description: error?.response?.data?.message || error?.message || 'Server encountered an issue computing org capacity. Please try again.',
            onRetry: refetch,
          }}
        >
          {/* Metrics strip */}
          <InsightSection question="How is load distributed?">
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)]/60 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[12px]">Members tracked</Text>
                <div className="text-[22px] font-bold tabular-nums text-[var(--text-primary)]">{summary.memberCount}</div>
              </div>
            </div>
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)]/60 flex items-center justify-center shrink-0">
                <Gauge className="w-4 h-4 text-[var(--text-muted)]" />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[12px]">Active assignments</Text>
                <div className="text-[22px] font-bold tabular-nums text-[var(--text-primary)]">{summary.totalActive}</div>
              </div>
            </div>
            <div className={cn(
              'rounded-[var(--radius-lg)] p-4 flex items-center gap-3 border backdrop-blur-xl',
              summary.overAllocated > 0
                ? 'bg-[var(--bg-elevated)] border-[var(--danger)]/25'
                : 'bg-[var(--bg-elevated)] border-[var(--color-border-subtle)]/50'
            )}>
              <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', summary.overAllocated > 0 ? 'bg-[var(--danger-soft)]' : 'bg-[var(--bg-subtle)]/60')}>
                <AlertCircle className={cn('w-4 h-4', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')} />
              </div>
              <div>
                <Text size="xs" variant="muted" className="text-[12px]">Over-allocated</Text>
                <div className={cn('text-[22px] font-bold tabular-nums', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
                  {summary.overAllocated}
                </div>
              </div>
            </div>
          </InsightSection>

          {/* Data Table */}
          <div className="flex-1 min-h-0">
            <DataTable
              columns={columns}
              data={rows}
              isLoading={isLoading}
              emptyStateTitle="No workload data"
              emptyStateDescription="No active tasks in this organization."
            />
          </div>
        </PageStateContainer>
      </InsightLayout>
    </WorkspaceShell>
  )
}
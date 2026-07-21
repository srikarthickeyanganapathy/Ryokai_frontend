import React, { useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkload } from '@/features/workload/hooks/useWorkload'
import { cn } from '@/shared/lib/cn'
import { DataTable } from '@/shared/ui/data-table/DataTable'

const COLUMNS = [
  { key: 'todoCount', label: 'To Do' },
  { key: 'inProgressCount', label: 'In Progress' },
  { key: 'submittedCount', label: 'Submitted' },
  { key: 'approvedCount', label: 'Approved' },
  { key: 'rejectedCount', label: 'Rejected' },
]

export function WorkloadPage() {
  const { userOrg } = usePermissions()
  const { data: rows = [], isLoading, isError, error, refetch } = useWorkload(userOrg?.id)

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
      header: () => <div className="text-center">Active Total</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount ?? 0
        return (
          <div className={cn('text-center font-semibold', count > 8 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
            {count}
          </div>
        )
      }
    }
  ], [])

  if (!userOrg) return <Text variant="muted" className="p-8">Join an organization to view workload.</Text>

  return (
    <div className="flex flex-col min-h-full space-y-6" role="region" aria-label="Resource workload">
      {/* 📊 MANAGE MODE STICKY HEADER */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
            MANAGE Mode
          </span>
          <span className="text-[11px] text-[var(--text-muted)]">• Resource Telemetry & Capacity</span>
        </div>
        <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">Resource Capacity & Workload Matrix</Heading>
        <Text variant="muted" className="text-[13px] mt-1">Audit team load distribution, active assignments, and over-allocation bottlenecks.</Text>
      </div>

      {isError ? (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl border-dashed">
          <div className="w-11 h-11 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 text-amber-500">
            <span className="font-mono text-sm font-bold">500</span>
          </div>
          <Heading level={3} className="text-[15px] font-semibold">Workload Telemetry Unavailable</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto text-xs">
            {error?.response?.data?.message || error?.message || 'Server encountered an issue computing org capacity. Please try again.'}
          </Text>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] transition-colors"
          >
            Retry Telemetry Query
          </button>
        </div>
      ) : (
        <div className="flex-1 min-h-0">
          <DataTable 
            columns={columns} 
            data={rows} 
            isLoading={isLoading} 
            emptyStateTitle="No workload data"
            emptyStateDescription="No active tasks in this organization."
          />
        </div>
      )}
    </div>
  )
}

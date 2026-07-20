import React, { useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useWorkload } from '@/features/workload/hooks/useWorkload'
import { cn } from '@/shared/lib/cn'
import { DataTable } from '@/shared/ui/DataTable/DataTable'

const COLUMNS = [
  { key: 'todoCount', label: 'To Do' },
  { key: 'inProgressCount', label: 'In Progress' },
  { key: 'submittedCount', label: 'Submitted' },
  { key: 'approvedCount', label: 'Approved' },
  { key: 'rejectedCount', label: 'Rejected' },
]

export function WorkloadPage() {
  const { userOrg } = usePermissions()
  const { data: rows = [], isLoading } = useWorkload(userOrg?.id)

  const columns = useMemo(() => [
    {
      id: 'member',
      header: 'Member',
      cell: ({ row }) => <span className="font-medium">{row.original.user?.username || 'Unknown'}</span>,
    },
    ...COLUMNS.map(c => ({
      accessorKey: c.key,
      header: () => <div className="text-center">{c.label}</div>,
      cell: ({ getValue }) => <div className="text-center">{getValue()}</div>,
    })),
    {
      accessorKey: 'totalActiveCount',
      header: () => <div className="text-center">Active Total</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount
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
    <div className="max-w-5xl mx-auto py-8 px-4 h-full flex flex-col">
      <Heading level={2} className="mb-6">Resource Workload Matrix</Heading>
      
      <div className="flex-1 min-h-0">
        <DataTable 
          columns={columns} 
          data={rows} 
          isLoading={isLoading} 
          emptyStateTitle="No workload data"
          emptyStateDescription="No active tasks in this organization."
        />
      </div>
    </div>
  )
}

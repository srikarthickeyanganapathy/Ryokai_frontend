import React, { useState, useMemo } from 'react'
import { PageShell, PageHero } from '@/shared/ui/PageShell'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useAdminOrganizations, useSuspendOrganization, useActivateOrganization } from '@/platform/admin/features/hooks/useAdmin'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { SearchInput } from '@/shared/ui/SearchInput'
import { Badge } from '@/shared/ui/Badge'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'

export function PlatformOrganizationsPage() {
  const { data: orgs, isLoading } = useAdminOrganizations()
  const suspendOrg = useSuspendOrganization()
  const activateOrg = useActivateOrganization()
  const { confirm, dialog } = useConfirmDialog()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredOrgs = useMemo(() => {
    if (!orgs) return []
    return orgs.filter(o => o.name.toLowerCase().includes(searchTerm.toLowerCase()))
  }, [orgs, searchTerm])

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Organization',
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-[var(--text-primary)]">{row.original.name}</span>
          <span className="text-[11px] text-[var(--text-muted)] font-mono">{row.original.slug || `org-${row.original.id}`}</span>
        </div>
      )
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isSuspended = row.original.status === 'SUSPENDED'
        return (
          <Badge variant={isSuspended ? 'destructive' : 'success'} className="uppercase text-[10px]">
            {isSuspended ? 'Suspended' : 'Active'}
          </Badge>
        )
      }
    },
    {
      id: 'activity',
      header: 'Last Activity',
      cell: ({ row }) => <span className="text-[12px] text-[var(--text-muted)]">N/A</span> // Placeholder until backend provides it
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const org = row.original
        const isSuspended = org.status === 'SUSPENDED'
        
        return isSuspended ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => activateOrg.mutate(org.id)}
            disabled={activateOrg.isPending}
            className="h-7 text-xs border-[var(--success-border)] text-[var(--success)] hover:bg-[var(--success-soft)]"
          >
            <Icons.checkCircle className="mr-1.5 h-3.5 w-3.5 text-[var(--success)]" />
            Activate
          </Button>
        ) : (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={async () => {
              const confirmed = await confirm({
                title: 'Suspend Organization?',
                description: 'Are you sure you want to suspend this organization?',
                danger: true,
              })
              if (confirmed) suspendOrg.mutate(org.id)
            }}
            disabled={suspendOrg.isPending}
            className="h-7 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
          >
            <Icons.slash className="mr-1.5 h-3.5 w-3.5" />
            Suspend
          </Button>
        )
      }
    }
  ], [activateOrg, suspendOrg, confirm])

  return (
    <PageShell maxWidth="default" className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Organizations"
        subtitle="Oversight and governance of all platform tenants."
        actions={
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search organizations..."
            debounceMs={0}
            className="w-[300px]"
          />
        }
        className="mb-6"
      />

      <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredOrgs}
          getRowId={(row) => row.id}
          loading={isLoading}
          emptyMessage="No organizations found."
        />
      </div>
      {dialog}
    </PageShell>
  )
}

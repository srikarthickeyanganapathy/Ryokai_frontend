import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/shared/ui/PageHeader'
import { Heading, Text } from '@/shared/ui/Typography'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useAdminOrganizations, useSuspendOrganization, useActivateOrganization } from '@/platform/admin/features/hooks/useAdmin'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Input } from '@/shared/ui/Input'
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
        const isSuspended = row.original.suspended
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
        const isSuspended = org.suspended
        
        return isSuspended ? (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => activateOrg.mutate(org.id)}
            disabled={activateOrg.isPending}
            className="h-7 text-xs border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
          >
            <Icons.checkCircle className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
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
            className="h-7 text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
          >
            <Icons.slash className="mr-1.5 h-3.5 w-3.5" />
            Suspend
          </Button>
        )
      }
    }
  ], [activateOrg, suspendOrg, confirm])

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <PageHeader
        title="Organizations"
        subtitle="Oversight and governance of all platform tenants."
        actions={
          <div className="w-[300px] relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
            <Input 
              placeholder="Search organizations..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        }
        className="mb-6"
      />

      <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden shadow-sm">
        <DataTable
          columns={columns}
          data={filteredOrgs}
          getRowId={(row) => row.id}
          loading={isLoading}
          emptyMessage="No organizations found."
        />
      </div>
      {dialog}
    </div>
  )
}

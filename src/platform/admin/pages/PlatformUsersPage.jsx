import React, { useState, useMemo, useCallback } from 'react'
import { PageShell, PageHero } from '@/shared/ui/PageShell'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useRoles, useAssignUserRoles, useAdminUsers, useSuspendUser, useActivateUser } from '@/platform/admin/features/hooks/useAdmin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { SearchInput } from '@/shared/ui/SearchInput'
import { RolesTab } from '@/platform/admin/components/RolesTab'
import { DetailTabs } from '@/shared/ui/DetailTabs'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { Button } from '@/shared/ui/Button'

export function PlatformUsersPage() {
  const { data: users, isLoading: usersLoading } = useAdminUsers()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const assignRolesMutation = useAssignUserRoles()
  const suspendUser = useSuspendUser()
  const activateUser = useActivateUser()
  const { confirm, dialog } = useConfirmDialog()
  
  const [activeTab, setActiveTab] = useState('users')
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'users', label: 'Global Identities' },
    { id: 'roles', label: 'Platform Roles' }
  ]

  const handleRoleChange = useCallback((userId, newRoleName) => {
    assignRolesMutation.mutate({ userId, roleNames: [newRoleName] })
  }, [assignRolesMutation])

  const filteredUsers = useMemo(() => {
    if (!users) return []
    return users.filter(u => 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.name && u.name.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  }, [users, searchTerm])

  const columns = useMemo(() => {
    if (!roles) return []
    return [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-semibold text-[var(--text-primary)]">{row.original.username}</span>
      },
      {
        accessorKey: 'name',
        header: 'Full Name',
        cell: ({ row }) => <span className="text-[var(--text-secondary)]">{row.original.name || row.original.fullName || '-'}</span>
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ row }) => <span className="text-[var(--text-muted)] text-[13px]">{row.original.email}</span>
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
        id: 'role',
        header: 'Platform Role',
        cell: ({ row }) => {
          const user = row.original
          const currentRoleName = Array.isArray(user.roles) && user.roles.length > 0
            ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].name)
            : ''
          
          return (
            <Select 
              value={currentRoleName} 
              onValueChange={(val) => handleRoleChange(user.id, val)}
              disabled={assignRolesMutation.isPending}
            >
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue placeholder="No Role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.name} className="text-xs">
                    {r.name.replace('ROLE_', '')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )
        }
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original
          const isSuspended = user.status === 'SUSPENDED'
          
          return isSuspended ? (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => activateUser.mutate(user.id)}
              disabled={activateUser.isPending}
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
                  title: 'Suspend User?',
                  description: 'Are you sure you want to suspend this user?',
                  danger: true,
                })
                if (confirmed) suspendUser.mutate(user.id)
              }}
              disabled={suspendUser.isPending}
              className="h-7 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
            >
              <Icons.slash className="mr-1.5 h-3.5 w-3.5" />
              Suspend
            </Button>
          )
        }
      }
    ]
  }, [roles, assignRolesMutation.isPending, handleRoleChange, activateUser, suspendUser, confirm])

  return (
    <PageShell maxWidth="default" className="min-h-[calc(100vh-8rem)]">
      <PageHero
        title="Platform Users"
        subtitle="Manage global identities and assign platform-level roles."
        actions={activeTab === 'users' ? (
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
            debounceMs={0}
            className="w-[300px]"
          />
        ) : null}
        className="mb-6"
      />

      <DetailTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        sticky={false}
        className="mb-6 bg-transparent border-0 border-b"
      />

      <div className="flex-1 min-h-0 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden p-4 transition-colors duration-[var(--duration-base)]">
        {activeTab === 'users' && (
          <DataTable 
            columns={columns}
            data={filteredUsers}
            getRowId={(row) => row.id}
            isLoading={usersLoading || rolesLoading}
            emptyStateTitle="No users found."
          />
        )}
        
        {activeTab === 'roles' && (
          <RolesTab />
        )}
      </div>
      {dialog}
    </PageShell>
  )
}

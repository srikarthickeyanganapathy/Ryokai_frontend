import React, { useState, useMemo, useCallback } from 'react'
import { PageShell, PageHero } from '@/shared/ui/PageShell'
import { Heading, Text } from '@/shared/ui/Typography'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useUsersList } from '@/identity'
import { useRoles, useAssignUserRoles } from '@/platform/admin/features/hooks/useAdmin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { SearchInput } from '@/shared/ui/SearchInput'
import { Icons } from '@/shared/ui/Icons'
import { RolesTab } from '@/platform/admin/components/RolesTab'
import { cn } from '@/shared/lib/cn'
import { DetailTabs } from '@/shared/ui/DetailTabs'

export function PlatformUsersPage() {
  const { data: users, isLoading: usersLoading } = useUsersList()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const assignRolesMutation = useAssignUserRoles()
  
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
      }
    ]
  }, [roles, assignRolesMutation.isPending, handleRoleChange])

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

      <div className="flex-1 min-h-0 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden p-4 transition-colors duration-[var(--duration-base)]">
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
    </PageShell>
  )
}

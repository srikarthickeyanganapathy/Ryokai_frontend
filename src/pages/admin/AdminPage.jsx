import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { useRoles, useAssignUserRoles } from '@/features/admin/hooks/useAdmin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { usePermissions } from '@/context/usePermissions'
import { Navigate } from 'react-router-dom'
import { RolesTab } from '@/widgets/admin/RolesTab'
import { cn } from '@/shared/lib/cn'

export function AdminPage() {
  const { data: users, isLoading: usersLoading } = useUsersList()
  const { data: roles, isLoading: rolesLoading } = useRoles()
  const assignRolesMutation = useAssignUserRoles()
  const { isSuperAdmin } = usePermissions()
  const [activeTab, setActiveTab] = React.useState('users')

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'roles', label: 'Roles & Permissions' }
  ]

  const handleRoleChange = React.useCallback((userId, newRoleName) => {
    assignRolesMutation.mutate({ userId, roleNames: [newRoleName] })
  }, [assignRolesMutation])

  const columns = React.useMemo(() => {
    if (!roles) return []
    return [
      {
        accessorKey: 'username',
        header: 'Username',
        cell: ({ row }) => <span className="font-medium">{row.original.username}</span>
      },
      {
        accessorKey: 'name',
        header: 'Full Name',
        cell: ({ row }) => <span>{row.original.name || row.original.fullName || '-'}</span>
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        id: 'role',
        header: 'Role',
        cell: ({ row }) => {
          const user = row.original
          // user.roles may be objects or strings
          const currentRoleName = Array.isArray(user.roles) && user.roles.length > 0
            ? (typeof user.roles[0] === 'string' ? user.roles[0] : user.roles[0].name)
            : ''
          
          return (
            <Select 
              value={currentRoleName} 
              onValueChange={(val) => handleRoleChange(user.id, val)}
              disabled={assignRolesMutation.isPending}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map(r => (
                  <SelectItem key={r.id} value={r.name}>
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

  if (!isSuperAdmin) {
    return <Navigate to="/app" replace />
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="mb-6">
        <Heading level={2} className="tracking-tight mb-1">User Administration</Heading>
        <Text variant="muted">Manage users and their platform roles.</Text>
      </div>

      <div className="flex items-center gap-6 border-b border-[var(--color-border-subtle)] mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors whitespace-nowrap",
              activeTab === tab.id 
                ? "text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]" />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg shadow-sm overflow-hidden p-4">
        {activeTab === 'users' && (
          <DataTable 
            columns={columns}
            data={users || []}
            isLoading={usersLoading || rolesLoading}
          />
        )}
        
        {activeTab === 'roles' && (
          <RolesTab />
        )}
      </div>
    </div>
  )
}
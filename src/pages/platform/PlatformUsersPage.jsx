import React, { useState, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { useUsersList } from '@/features/auth/hooks/useUser'
import { useRoles, useAssignUserRoles } from '@/features/admin/hooks/useAdmin'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Input } from '@/shared/ui/Input'
import { Icons } from '@/shared/ui/Icons'
import { RolesTab } from '@/widgets/admin/RolesTab'
import { cn } from '@/shared/lib/cn'

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
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Platform Users</Heading>
          <Text variant="muted" className="text-[13px]">Manage global identities and assign platform-level roles.</Text>
        </div>
        {activeTab === 'users' && (
          <div className="w-[300px] relative">
            <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-[var(--text-muted)]" />
            <Input 
              placeholder="Search users..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-6 border-b border-[var(--color-border-subtle)] mb-6">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative pb-3 text-sm font-medium transition-colors duration-[var(--duration-base)] whitespace-nowrap",
              activeTab === tab.id 
                ? "text-[var(--text-primary)]" 
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <motion.div
                layoutId="admin-active-tab"
                className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                transition={{ type: 'spring', stiffness: 500, damping: 38 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="flex-1 min-h-0 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden p-4 transition-colors duration-[var(--duration-base)]">
        {activeTab === 'users' && (
          <DataTable 
            columns={columns}
            data={filteredUsers}
            loading={usersLoading || rolesLoading}
            emptyMessage="No users found."
          />
        )}
        
        {activeTab === 'roles' && (
          <RolesTab />
        )}
      </div>
    </div>
  )
}

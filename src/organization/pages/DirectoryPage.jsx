import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useOrgMembers, useUpdateMemberRole, useRemoveMember, useOrgRoles } from '@/organization'
import { Heading, Text } from '@/shared/ui/Typography'
import { Search, Mail, Shield, User as UserIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/Badge'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { usePermissions } from '@/identity'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { InviteMemberModal } from '@/organization'
import { LeaveRequestsTab } from '@/organization'
import { OrgRolesTab } from '@/organization'

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: members = [], isLoading } = useOrgMembers(orgId)
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId)

  const [searchParams, setSearchParams] = useSearchParams()
  const rawTab = searchParams.get('tab') || 'members'

  const [searchQuery, setSearchQuery] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const { canManageRoles, canInviteMembers, canRemoveMembers } = usePermissions()
  const updateRoleMutation = useUpdateMemberRole(orgId)
  const removeMemberMutation = useRemoveMember(orgId)

  const activeTab = (rawTab === 'admin' && !canManageRoles) ? 'members' : rawTab

  useEffect(() => {
    if (rawTab === 'admin' && !canManageRoles) {
      setSearchParams({ tab: 'members' }, { replace: true })
    }
  }, [rawTab, canManageRoles, setSearchParams])

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId })
  }

  const filteredMembers = useMemo(() => {
    const q = searchQuery.toLowerCase()
    return members.filter(member => {
      const nameMatch = member.username?.toLowerCase().includes(q)
      const roleMatch = member.orgRole?.toLowerCase().includes(q)
      return nameMatch || roleMatch
    })
  }, [members, searchQuery])

  if (!activeOrganization) return null

  const tabs = [
    { id: 'members', label: 'Members' },
    { id: 'leaves', label: 'Leave Requests' }
  ]
  if (canManageRoles) {
    tabs.push({ id: 'admin', label: 'Admin Settings' })
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="h-full px-4 py-6 sm:px-6 sm:py-8 md:px-10 lg:px-12 max-w-7xl mx-auto space-y-6 sm:space-y-8">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--border-subtle)]"
        >
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                Directory
              </span>
              <span className="text-[11px] text-[var(--text-muted)]">{members.length} member{members.length !== 1 ? 's' : ''}</span>
            </div>
            <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold text-[var(--text-primary)] mb-1">
              Organization Directory
            </Heading>
            <Text variant="muted" className="text-[13px] leading-relaxed">
              Roster, permissions, leave requests, and role administration for {activeOrganization.name}.
            </Text>
          </div>

          {activeTab === 'members' && canInviteMembers && (
            <Button variant="primary" onClick={() => setInviteModalOpen(true)} className="shrink-0 self-start sm:self-auto">
              <Icons.plus className="w-4 h-4 mr-1.5" />
              Invite Member
            </Button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-5 sm:gap-6 border-b border-[var(--border-subtle)] -mt-2 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                activeTab === tab.id
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="directory-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-5">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-muted)]" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg pl-9 pr-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl h-28" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-16 sm:py-20 bg-[var(--bg-subtle)] border border-dashed border-[var(--border-subtle)] rounded-2xl">
                <UserIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
                <Heading level={4} className="text-[var(--text-secondary)] mb-2">No members found</Heading>
                <Text variant="muted" className="text-sm">Try adjusting your search criteria</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredMembers.map((member, index) => {
                  const currentRole = roles.find(r => r.name === member.orgRole)
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3) }}
                      className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] rounded-xl p-4 sm:p-5 transition-colors duration-200 shadow-sm"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-[var(--accent-soft)] border border-[var(--accent-border)] flex items-center justify-center flex-shrink-0">
                          <span className="text-base sm:text-lg font-medium text-[var(--accent)]">
                            {member.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <Heading level={4} className="truncate text-[15px] font-medium text-[var(--text-primary)]">
                              {member.username}
                            </Heading>
                            <Badge
                              variant={
                                member.rolePriority === 0 ? "danger" :
                                member.rolePriority === 1 ? "warning" :
                                "outline"
                              }
                              className="shrink-0"
                            >
                              {member.orgRole}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] truncate">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{member.username}@ryokai.app</span>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                              <Shield className="h-3 w-3" />
                              Priority {member.rolePriority ?? 'N/A'}
                            </div>

                            {(canManageRoles || canRemoveMembers) && (
                              <div className="flex items-center gap-2">
                                {canManageRoles && (
                                  <Select
                                    value={currentRole?.id?.toString() ?? ''}
                                    onValueChange={(val) => updateRoleMutation.mutate({ userId: member.userId, roleId: val })}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <SelectTrigger className="w-[110px] h-7 text-[11px]">
                                      <SelectValue placeholder={member.orgRole || 'Role'} />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {roles.map(role => (
                                        <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                {canRemoveMembers && (
                                  <IconButton
                                    variant="danger"
                                    size="sm"
                                    className="h-7 w-7"
                                    title="Remove Member"
                                    onClick={async () => {
                                      if (await confirm({ title: `Remove ${member.username}?`, danger: true })) {
                                        removeMemberMutation.mutate(member.userId)
                                      }
                                    }}
                                    disabled={removeMemberMutation.isPending}
                                  >
                                    <Icons.trash2 className="w-3.5 h-3.5" />
                                  </IconButton>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'leaves' && (
          <LeaveRequestsTab orgId={orgId} />
        )}

        {activeTab === 'admin' && canManageRoles && (
          <section className="pb-4">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-4 sm:p-6">
              <Text variant="muted" className="mb-6 text-[13px] leading-relaxed max-w-2xl">
                Manage organization-level roles, permissions, and settings here. This section allows you to configure your organization's custom roles and manage its security policies.
              </Text>
              <OrgRolesTab orgId={orgId} roles={roles} rolesLoading={rolesLoading} />
            </div>
          </section>
        )}

      </div>

      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        orgId={orgId}
      />
      {confirmDialog}
    </div>
  )
}

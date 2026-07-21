import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useOrgMembers, useUpdateMemberRole, useRemoveMember, useOrgRoles } from '@/features/organizations/hooks/useOrganizations'
import { Heading, Text } from '@/shared/ui/Typography'
import { Search, Mail, Shield, User as UserIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Badge } from '@/shared/ui/Badge'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { InviteMemberModal } from '@/widgets/organizations/InviteMemberModal'
import { LeaveRequestsTab } from '@/widgets/organizations/LeaveRequestsTab'
import { OrgRolesTab } from '@/widgets/organizations/OrgRolesTab'

export function DirectoryPage() {
  const { activeOrganization } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: members = [], isLoading } = useOrgMembers(orgId)
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId)
  
  const [searchParams, setSearchParams] = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'members'
  const [activeTab, setActiveTab] = useState(defaultTab)

  const [searchQuery, setSearchQuery] = useState('')
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const { confirm, dialog: confirmDialog } = useConfirmDialog()

  const { canManageRoles, canInviteMembers, canRemoveMembers } = usePermissions()
  const updateRoleMutation = useUpdateMemberRole(orgId)
  const removeMemberMutation = useRemoveMember(orgId)

  // Fallback if someone deep links to ?tab=admin without permissions
  useEffect(() => {
    if (activeTab === 'admin' && !canManageRoles) {
      setActiveTab('members')
      setSearchParams({ tab: 'members' }, { replace: true })
    }
  }, [activeTab, canManageRoles, setSearchParams])

  const handleTabChange = (tabId) => {
    setActiveTab(tabId)
    setSearchParams({ tab: tabId })
  }

  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      const nameMatch = member.username?.toLowerCase().includes(searchQuery.toLowerCase())
      const roleMatch = member.orgRole?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="h-full px-6 py-8 md:px-10 lg:px-12 max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6"
        >
          <div>
            <Heading level={2} className="tracking-tight text-[24px] font-semibold text-[var(--text-primary)]">
              Directory
            </Heading>
            <Text variant="muted" className="text-[14px] mt-1">
              {members.length} members in {activeOrganization.name}
            </Text>
          </div>
          
          {activeTab === 'members' && canInviteMembers && (
            <Button variant="primary" onClick={() => setInviteModalOpen(true)}>
              <Icons.plus className="w-4 h-4 mr-1.5" />
              Invite Member
            </Button>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-[var(--border-subtle)] mb-8 overflow-x-auto no-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "relative pb-3 text-sm font-medium transition-colors whitespace-nowrap",
                activeTab === tab.id
                  ? "text-[var(--text-primary)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="directory-tab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                />
              )}
            </button>
          ))}
        </div>

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-6">
            <div className="relative w-full md:w-64 mb-6">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="animate-pulse bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-xl h-24" />
                ))}
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-20 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-2xl border-dashed">
                <UserIcon className="h-10 w-10 text-[var(--text-muted)] mx-auto mb-4" />
                <Heading level={4} className="text-[var(--text-secondary)] mb-2">No members found</Heading>
                <Text variant="muted" className="text-sm">Try adjusting your search criteria</Text>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMembers.map((member, index) => {
                  const currentRole = roles.find(r => r.name === member.orgRole)
                  return (
                    <motion.div
                      key={member.userId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--accent-soft)] rounded-xl p-5 transition-all duration-300 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="h-12 w-12 rounded-full bg-[var(--accent-soft)] border border-[var(--accent)] flex items-center justify-center flex-shrink-0">
                          <span className="text-lg font-medium text-[var(--accent)]">
                            {member.username?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <Heading level={4} className="truncate text-base font-medium text-[var(--text-primary)]">
                              {member.username}
                            </Heading>
                            {/* Priority Badge */}
                            <Badge variant={
                              member.rolePriority === 0 ? "danger" : 
                              member.rolePriority === 1 ? "warning" : 
                              "outline"
                            }>
                              {member.orgRole}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] truncate">
                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                            <span className="truncate">{member.username}@ryokai.app</span>
                          </div>

                          <div className="mt-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                              <Shield className="h-3 w-3" />
                              Priority {member.rolePriority ?? 'N/A'}
                            </div>

                            {/* Actions (if canManageRoles or canRemoveMembers) */}
                            {(canManageRoles || canRemoveMembers) && (
                              <div className="flex items-center gap-2">
                                {canManageRoles && (
                                  <Select
                                    value={currentRole?.id?.toString() ?? ''}
                                    onValueChange={(val) => updateRoleMutation.mutate({ userId: member.userId, roleId: val })}
                                    disabled={updateRoleMutation.isPending}
                                  >
                                    <SelectTrigger className="w-[120px] h-7 text-[11px]">
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

        {/* Leave Requests Tab */}
        {activeTab === 'leaves' && (
          <LeaveRequestsTab orgId={orgId} />
        )}

        {/* Admin Settings Tab */}
        {activeTab === 'admin' && canManageRoles && (
          <section className="mb-10">
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-6">
              <Text variant="muted" className="mb-6 text-[13px]">
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

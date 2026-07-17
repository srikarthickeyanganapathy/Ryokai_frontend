import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useOrganization, useOrgMembers, useOrgTeams } from '@/features/organizations/hooks/useOrganizations'
import { InviteMemberModal } from '@/widgets/organizations/InviteMemberModal'
import { CreateTeamModal } from '@/widgets/organizations/CreateTeamModal'
import { ManageTeamMembersModal } from '@/widgets/organizations/ManageTeamMembersModal'
import { AdminLeaveModal } from '@/widgets/organizations/AdminLeaveModal'
import { LeaveRequestsTab } from '@/widgets/organizations/LeaveRequestsTab'
import { OrgRolesTab } from '@/widgets/organizations/OrgRolesTab'
import { useUpdateMemberRole, useOrgRoles, useRemoveMember } from '@/features/organizations/hooks/useOrganizations'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/context/usePermissions'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

export function OrganizationDetailPage() {
  const { orgId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { data: org, isLoading, isError, error } = useOrganization(orgId)
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(orgId)
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [adminLeaveModalOpen, setAdminLeaveModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const updateRoleMutation = useUpdateMemberRole(orgId)
  const removeMemberMutation = useRemoveMember(orgId)
  const { canManage, canManageLeaveRequests, canInviteMembers, canRemoveMembers, canManageRoles, canCreateTeam, canManageTeam, isOrgAdmin } = usePermissions()
  

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'teams', label: 'Teams' },
    { id: 'leaves', label: 'Leave Requests' },
  ]

  if (canManage) {
    tabs.push({ id: 'admin', label: 'Admin Settings' })
  }

  if (isLoading || rolesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] border-dashed">
        <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
          <Icons.x className="w-6 h-6" />
        </div>
        <Heading level={3}>Failed to load organization</Heading>
        <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred.'}
        </Text>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] border-dashed">
        <Heading level={3}>Organization not found</Heading>
        <Text variant="muted" className="mt-2">The organization you're looking for doesn't exist.</Text>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-2">{org.name}</Heading>
        {org.description && (
          <Text variant="muted" className="max-w-2xl text-[13px]">{org.description}</Text>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border-subtle)] mb-8 overflow-x-auto no-scrollbar">
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
              <motion.div
                layoutId="org-tab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[border-color,box-shadow] duration-[var(--duration-base)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center">
                  <Icons.user className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <Text variant="muted" size="sm">Members</Text>
              </div>
              {membersLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-3xl font-bold">{members.length}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[border-color,box-shadow] duration-[var(--duration-base)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--accent-soft)] flex items-center justify-center">
                  <Icons.workspace className="w-5 h-5 text-[var(--accent)]" />
                </div>
                <Text variant="muted" size="sm">Teams</Text>
              </div>
              {teamsLoading ? (
                <Skeleton className="h-8 w-12" />
              ) : (
                <span className="text-3xl font-bold">{teams.length}</span>
              )}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-6 hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[border-color,box-shadow] duration-[var(--duration-base)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--success-soft)] flex items-center justify-center">
                  <Icons.tasks className="w-5 h-5 text-[var(--success)]" />
                </div>
                <Text variant="muted" size="sm">Created</Text>
              </div>
              <span className="text-3xl font-bold">{formatDate(org.createdAt)}</span>
              {org.createdBy && (
                <Text variant="muted" size="xs" className="mt-1">by {org.createdBy}</Text>
              )}
            </motion.div>
          </div>

          {isOrgAdmin && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-[var(--danger-soft)]/20 border border-[var(--danger-border)] rounded-[var(--radius-lg)] p-6 mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div>
                <Heading level={4} className="text-[var(--danger)] text-base font-semibold mb-1">Danger Zone</Heading>
                <Text size="sm" variant="muted">
                  Leave this organization. Since you are the Admin, you will be prompted to transfer ownership or dissolve the organization completely.
                </Text>
              </div>
              <Button variant="danger" size="sm" onClick={() => setAdminLeaveModalOpen(true)}>
                <Icons.trash2 className="w-4 h-4 mr-2" />
                Exit Organization
              </Button>
            </motion.div>
          )}
        </div>
      )}

      {/* Members List */}
      {activeTab === 'members' && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Members</Heading>
            {canInviteMembers && (
              <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
                <Icons.plus className="w-4 h-4 mr-1.5" />
                Invite Member
              </Button>
            )}
          </div>
          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-[var(--radius-md)]" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
              <Text variant="muted">No members yet.</Text>
            </div>
          ) : (
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] divide-y divide-[var(--color-border-subtle)]">
              {members.map((member, i) => {
                const currentRole = roles.find(r => r.name === member.orgRole)
                return (
                  <div key={member.userId || i} className="flex items-center justify-between px-5 py-3 hover:bg-[var(--bg-hover)] transition-colors duration-[var(--duration-base)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-sm font-medium">
                        {member.username?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div>
                        <Text className="font-medium text-sm">{member.username}</Text>
                      </div>
                    </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={currentRole?.id?.toString() ?? ''}
                          onValueChange={(val) => updateRoleMutation.mutate({ userId: member.userId, roleId: val })}
                          disabled={!canManageRoles || updateRoleMutation.isPending}
                        >
                          <SelectTrigger className="w-[160px] h-8 text-xs">
                            <SelectValue placeholder={member.orgRole || 'Unknown role'} />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map(role => (
                              <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        {canRemoveMembers && (
                          <IconButton
                            variant="danger"
                            size="sm"
                            title="Remove Member"
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to remove ${member.username}?`)) {
                                removeMemberMutation.mutate(member.userId)
                              }
                            }}
                            disabled={removeMemberMutation.isPending}
                          >
                            <Icons.trash2 className="w-4 h-4" />
                          </IconButton>
                        )}
                      </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Teams List */}
      {activeTab === 'teams' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Teams</Heading>
            {canCreateTeam && (
              <Button variant="outline" size="sm" onClick={() => setCreateTeamModalOpen(true)}>
                <Icons.plus className="w-4 h-4 mr-1.5" />
                Create Team
              </Button>
            )}
          </div>
          {teamsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 rounded-[var(--radius-md)]" />)}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
              <Text variant="muted">No teams created yet.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, i) => {
                const isMemberOfTeam = team.members?.some(m => m.username === user?.username)
                const canEnterTeam = canManage || isMemberOfTeam
                return (
                  <div 
                    key={team.id || i} 
                    onClick={() => {
                      if (canEnterTeam) {
                        navigate(`/app/organizations/${orgId}/teams/${team.id}`)
                      } else {
                        toast.warning("You are not a member of this team. Contact a manager to join.")
                      }
                    }}
                    className={cn(
                      "bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col transition-[border-color,box-shadow] duration-[var(--duration-base)]",
                      canEnterTeam ? "hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] cursor-pointer" : "opacity-80"
                    )}
                  >
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <Heading level={4} className="text-base">{team.name}</Heading>
                        <Badge variant="outline" className="text-xs">{team.memberCount ?? team.members?.length ?? 0} members</Badge>
                      </div>
                      {team.description && (
                        <Text variant="muted" size="sm" className="line-clamp-2 mt-2">{team.description}</Text>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)] flex gap-2">
                      {canEnterTeam && (
                        <Button
                          variant="default"
                          size="sm"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/app/organizations/${orgId}/teams/${team.id}`)
                          }}
                        >
                          Enter Portal
                        </Button>
                      )}
                      {canManageTeam && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className={canEnterTeam ? "flex-1" : "w-full"}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedTeam(team)
                          }}
                        >
                          <Icons.settings className="w-4 h-4 mr-1.5" />
                          Manage
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <LeaveRequestsTab orgId={orgId} />
      )}

      {/* Admin Settings Tab */}
      {activeTab === 'admin' && canManage && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Organization Admin Settings</Heading>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-6">
            <Text variant="muted" className="mb-6 text-[13px]">
              Manage organization-level roles, permissions, and settings here. This section allows you to configure your organization's custom roles and manage its security policies.
            </Text>
            <OrgRolesTab orgId={orgId} roles={roles} rolesLoading={rolesLoading} />
          </div>
        </section>
      )}

      {/* Modals */}
      <InviteMemberModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        orgId={orgId}
      />

      <CreateTeamModal
        isOpen={createTeamModalOpen}
        onClose={() => setCreateTeamModalOpen(false)}
        orgId={orgId}
      />

      <ManageTeamMembersModal
        isOpen={!!selectedTeam}
        onClose={() => setSelectedTeam(null)}
        team={teams.find(t => t.id === selectedTeam?.id) || selectedTeam}
        orgMembers={members}
      />

      <AdminLeaveModal
        isOpen={adminLeaveModalOpen}
        onClose={() => setAdminLeaveModalOpen(false)}
        orgId={orgId}
        members={members}
      />
    </div>
  )
}

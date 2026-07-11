import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useOrganization, useOrgMembers, useOrgTeams } from '@/features/organizations/hooks/useOrganizations'
import { InviteMemberModal } from '@/widgets/organizations/InviteMemberModal'
import { CreateTeamModal } from '@/widgets/organizations/CreateTeamModal'
import { ManageTeamMembersModal } from '@/widgets/organizations/ManageTeamMembersModal'
import { LeaveRequestsTab } from '@/widgets/organizations/LeaveRequestsTab'
import { OrgRolesTab } from '@/widgets/organizations/OrgRolesTab'
import { useUpdateMemberRole, useOrgRoles } from '@/features/organizations/hooks/useOrganizations'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/context/usePermissions'

export function OrganizationDetailPage() {
  const { orgId } = useParams()
  const { data: org, isLoading, isError, error } = useOrganization(orgId)
  const { data: members = [], isLoading: membersLoading } = useOrgMembers(orgId)
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId)
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const updateRoleMutation = useUpdateMemberRole(orgId)
  const { isSuperAdmin, isOrgAdmin, isAdmin } = usePermissions()

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'members', label: 'Members' },
    { id: 'teams', label: 'Teams' },
    { id: 'leaves', label: 'Leave Requests' }
  ];
  
  if (isSuperAdmin || isOrgAdmin) {
    tabs.push({ id: 'admin', label: 'Admin Settings' });
  }

  if (isLoading || rolesLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
          <Icons.x className="w-6 h-6" />
        </div>
        <Heading level={3}>Failed to load organization</Heading>
        <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
          {error?.message || 'An unexpected error occurred.'}
        </Text>
        <Link to="/app/organizations">
          <Button variant="outline">Back to Organizations</Button>
        </Link>
      </div>
    )
  }

  if (!org) {
    return (
      <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
        <Heading level={3}>Organization not found</Heading>
        <Text variant="muted" className="mt-2 mb-6">The organization you're looking for doesn't exist.</Text>
        <Link to="/app/organizations">
          <Button variant="outline">Back to Organizations</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-[var(--text-muted)] mb-6">
        <Link to="/app/organizations" className="hover:text-[var(--text-primary)] transition-colors">
          Organizations
        </Link>
        <Icons.chevronRight className="w-3 h-3" />
        <span className="text-[var(--text-primary)] font-medium">{org.name}</span>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <Heading level={2} className="tracking-tight mb-2">{org.name}</Heading>
        {org.description && (
          <Text variant="muted" className="max-w-2xl">{org.description}</Text>
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
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--text-primary)]"
              />
            )}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-cyan)]/10 flex items-center justify-center">
                <Icons.user className="w-5 h-5 text-[var(--accent-cyan)]" />
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
            className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-violet)]/10 flex items-center justify-center">
                <Icons.workspace className="w-5 h-5 text-[var(--accent-violet)]" />
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
            className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--accent-green)]/10 flex items-center justify-center">
                <Icons.tasks className="w-5 h-5 text-[var(--accent-green)]" />
              </div>
              <Text variant="muted" size="sm">Projects</Text>
            </div>
            <span className="text-3xl font-bold">{org.projectCount ?? 0}</span>
          </motion.div>
        </div>
      )}

      {/* Members List */}
      {activeTab === 'members' && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Members</Heading>
            {(isSuperAdmin || isOrgAdmin) && (
              <Button variant="primary" size="sm" onClick={() => setInviteModalOpen(true)}>
                <Icons.plus className="w-4 h-4 mr-1.5" />
                Invite Member
              </Button>
            )}
          </div>
          {membersLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-xl">
              <Text variant="muted">No members yet.</Text>
            </div>
          ) : (
            <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl divide-y divide-[var(--color-border-subtle)]">
              {members.map((member, i) => {
                const currentRole = roles.find(r => r.name === member.orgRole)
                return (
                <div key={member.userId || i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-sm font-medium">
                      {member.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <Text className="font-medium text-sm">{member.username}</Text>
                    </div>
                  </div>
                  <div>
                    <select
                      value={currentRole?.id || ''}
                      onChange={(e) => updateRoleMutation.mutate({ userId: member.userId, roleId: e.target.value })}
                      disabled={!(isSuperAdmin || isOrgAdmin) || member.orgRole === 'SUPER_ADMIN'}
                      className={`bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-md px-2 py-1 text-sm focus:outline-none focus:border-[var(--accent-cyan)] ${!(isSuperAdmin || isOrgAdmin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {member.orgRole === 'SUPER_ADMIN' ? (
                        <option value={currentRole?.id || ''}>SUPER_ADMIN</option>
                      ) : (
                        roles.map(role => (
                          <option key={role.id} value={role.id}>{role.name}</option>
                        ))
                      )}
                    </select>
                  </div>
                </div>
              )})}
            </div>
          )}
        </section>
      )}

      {/* Teams List */}
      {activeTab === 'teams' && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Teams</Heading>
            {(isSuperAdmin || isOrgAdmin) && (
              <Button variant="outline" size="sm" onClick={() => setCreateTeamModalOpen(true)}>
                <Icons.plus className="w-4 h-4 mr-1.5" />
                Create Team
              </Button>
            )}
          </div>
          {teamsLoading ? (
            <div className="space-y-3">
              {[1, 2].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : teams.length === 0 ? (
            <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-xl">
              <Text variant="muted">No teams created yet.</Text>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teams.map((team, i) => (
                <div key={team.id || i} className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-5 flex flex-col">
                  <div className="flex-1">

                    <div className="flex items-center justify-between mb-1">
                      <Heading level={4} className="text-base">{team.name}</Heading>
                      <Badge variant="outline" className="text-xs">{team.members?.length || 0} members</Badge>
                    </div>
                    {team.description && (
                      <Text variant="muted" size="sm" className="line-clamp-2 mt-2">{team.description}</Text>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[var(--color-border-subtle)]">
                    {(isSuperAdmin || isOrgAdmin) ? (
                      <Button variant="ghost" size="sm" className="w-full" onClick={() => setSelectedTeam(team)}>
                        <Icons.settings className="w-4 h-4 mr-2" />
                        Manage Members
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" className="w-full" disabled>
                        <Icons.settings className="w-4 h-4 mr-2" />
                        Manage Members
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Leave Requests Tab */}
      {activeTab === 'leaves' && (
        <LeaveRequestsTab orgId={orgId} />
      )}

      {/* Admin Settings Tab */}
      {activeTab === 'admin' && (isSuperAdmin || isOrgAdmin) && (
        <section className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <Heading level={3}>Organization Admin Settings</Heading>
          </div>
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6">
            <Text variant="muted" className="mb-6">
              Manage organization-level roles, permissions, and settings here. This section allows you to configure your organization's custom roles and manage its security policies.
            </Text>
            <OrgRolesTab orgId={orgId} roles={roles} rolesLoading={rolesLoading} />
          </div>
        </section>
      )}

      {(isSuperAdmin || isOrgAdmin) && (
        <>
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
            team={selectedTeam}
            orgMembers={members}
          />
        </>
      )}
    </div>
  )
}

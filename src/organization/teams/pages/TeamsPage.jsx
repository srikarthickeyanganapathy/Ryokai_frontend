import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { CreateTeamModal } from '../../sections/Teams/CreateTeamModal'
import { ManageTeamMembersModal } from '../../sections/Teams/ManageTeamMembersModal'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/identity'
import { useAuth } from '@/identity'
import { toast } from 'sonner'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import {
  WorkspaceShell,
  ManagementLayout,
  PageStateContainer,
} from '@/shared/workspace-framework'

export function TeamsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeOrganization, workspaceMode } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const { data: members = [] } = useOrgMembers(orgId)
  
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  const { canManage, canCreateTeam, canManageTeam } = usePermissions()

  // Guard for missing org context
  if (!activeOrganization || workspaceMode === 'PERSONAL') {
    return <Navigate to="/app" replace />
  }

  const pageState = teamsLoading ? 'loading' : teams.length === 0 ? 'empty' : 'ready'

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                  Teams
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">{activeOrganization.name}</span>
              </div>
              <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate">
                <Icons.users className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
                Teams directory
              </Heading>
              <Text variant="muted" className="text-[13px] leading-relaxed">
                Manage team divisions, project permissions, and member assignments.
              </Text>
            </div>
            {canCreateTeam && (
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="primary" size="sm" onClick={() => setCreateTeamModalOpen(true)}>
                  <Icons.plus className="w-4 h-4 mr-1.5" />
                  Create Team
                </Button>
              </div>
            )}
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'cards' }}
          emptyConfig={{
            icon: Icons.users,
            title: 'No teams created yet',
            description: 'Create a team to organize your members and projects.',
            actionLabel: canCreateTeam ? 'Create Team' : undefined,
            onAction: canCreateTeam ? () => setCreateTeamModalOpen(true) : undefined,
          }}
        >
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
        </PageStateContainer>
      </ManagementLayout>

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
    </WorkspaceShell>
  )
}
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
          <TeamsGrid
            teams={teams}
            user={user}
            orgId={orgId}
            canManage={canManage}
            canManageTeam={canManageTeam}
            navigate={navigate}
            setSelectedTeam={setSelectedTeam}
          />
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

function TeamsGrid({ teams, user, orgId, canManage, canManageTeam, navigate, setSelectedTeam }) {
  const myTeams = teams.filter(team => team.members?.some(m => m.username === user?.username));
  const otherTeams = teams.filter(team => !team.members?.some(m => m.username === user?.username));

  return (
    <div className="space-y-8">
      {myTeams.length > 0 && (
        <section>
          <Heading level={5} className="text-sm font-semibold mb-3 uppercase tracking-wider text-[var(--text-muted)]">Your Teams</Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.map(team => (
              <TeamCard 
                key={team.id} 
                team={team} 
                isMember={true}
                orgId={orgId}
                canManage={canManage}
                canManageTeam={canManageTeam}
                navigate={navigate}
                setSelectedTeam={setSelectedTeam}
              />
            ))}
          </div>
        </section>
      )}

      {otherTeams.length > 0 && (
        <section>
          <Heading level={5} className="text-sm font-semibold mb-3 uppercase tracking-wider text-[var(--text-muted)]">
            {myTeams.length > 0 ? "All Teams" : "Directory"}
          </Heading>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTeams.map(team => (
              <TeamCard 
                key={team.id} 
                team={team} 
                isMember={false}
                orgId={orgId}
                canManage={canManage}
                canManageTeam={canManageTeam}
                navigate={navigate}
                setSelectedTeam={setSelectedTeam}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function TeamCard({ team, isMember, orgId, canManage, canManageTeam, navigate, setSelectedTeam }) {
  const canEnterTeam = canManage || isMember;
  
  // Future-proofing observer count mapping (assuming backend capability mapping)
  const observersCount = team.observers?.length || team.observerCount || 0;
  
  return (
    <div 
      onClick={() => {
        if (canEnterTeam) {
          navigate(`/app/organizations/${orgId}/teams/${team.id}`)
        } else {
          toast.warning("You are not a member of this team. Contact a manager to join.")
        }
      }}
      className={cn(
        "bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 flex flex-col transition-[border-color,box-shadow] duration-[var(--duration-base)]",
        canEnterTeam ? "hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] cursor-pointer" : "opacity-80 cursor-default"
      )}
    >
      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <Heading level={4} className="text-base truncate pr-2" title={team.name}>{team.name}</Heading>
          <div className="flex flex-col gap-1 items-end shrink-0">
            <Badge variant="outline" className="text-[10px]">{team.memberCount ?? team.members?.length ?? 0} Members</Badge>
            {observersCount > 0 && (
              <Badge variant="outline" className="text-[10px] bg-[var(--info-soft)] text-[var(--info)] border-transparent">
                {observersCount} Observers
              </Badge>
            )}
          </div>
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
}
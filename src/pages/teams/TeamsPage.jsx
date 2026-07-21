import React, { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useOrgTeams, useOrgMembers } from '@/features/organizations/hooks/useOrganizations'
import { CreateTeamModal } from '@/widgets/organizations/CreateTeamModal'
import { ManageTeamMembersModal } from '@/widgets/organizations/ManageTeamMembersModal'
import { cn } from '@/shared/lib/cn'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

export function TeamsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeOrganization, workspaceMode } = useWorkspace()
  
  // Guard for missing org context
  if (!activeOrganization || workspaceMode === 'PERSONAL') {
    return <Navigate to="/app" replace />
  }

  const orgId = activeOrganization.id
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const { data: members = [] } = useOrgMembers(orgId)
  
  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  
  const { canManage, canCreateTeam, canManageTeam } = usePermissions()

  return (
    <div className="flex flex-col min-h-full">
      {/* ⚙️ MANAGE MODE STICKY HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              MANAGE Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• {activeOrganization.name}</span>
          </div>
          <Heading level={1} className="tracking-tight text-[22px] font-semibold mb-0">Teams Directory</Heading>
          <Text variant="muted" className="text-[13px]">Manage team divisions, project permissions, and member assignments.</Text>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-4">
          <Heading level={3}>All Teams</Heading>
          {canCreateTeam && (
            <Button variant="primary" size="sm" onClick={() => setCreateTeamModalOpen(true)}>
              <Icons.plus className="w-4 h-4 mr-1.5" />
              Create Team
            </Button>
          )}
        </div>
        
        {teamsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-[var(--radius-lg)]" />)}
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
            <div className="w-12 h-12 rounded-full bg-[var(--accent-soft)] flex items-center justify-center mx-auto mb-4">
              <Icons.users className="w-6 h-6 text-[var(--accent)]" />
            </div>
            <Heading level={4} className="mb-2">No teams created yet.</Heading>
            <Text variant="muted">Create a team to organize your members and projects.</Text>
            {canCreateTeam && (
              <Button variant="outline" className="mt-4" onClick={() => setCreateTeamModalOpen(true)}>
                Create Team
              </Button>
            )}
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
    </div>
  )
}

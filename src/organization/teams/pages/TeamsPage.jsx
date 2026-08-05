import React, { useMemo, useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { PageHeader } from '@/shared/ui/PageHeader'
import { StatPill } from '@/shared/ui/StatPill'
import { useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { CreateTeamModal } from '../modals/CreateTeamModal'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'
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

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

function TeamAvatar({ name, size = 'md' }) {
  const hue = hashHue(name || '?')
  const sizes = {
    sm: 'w-7 h-7 text-[11px]',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
  }
  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold text-white shrink-0 shadow-sm',
        sizes[size]
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue} 60% 50%), hsl(${(hue + 40) % 360} 60% 40%))`,
      }}
      aria-hidden="true"
    >
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function MemberAvatarStack({ members = [], max = 4 }) {
  const visible = members.slice(0, max)
  const overflow = members.length - visible.length
  if (members.length === 0) return <Text size="xs" className="text-[var(--text-muted)] italic">No members</Text>
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((m, i) => {
          const hue = hashHue(m.username || String(i))
          return (
            <div
              key={m.id ?? m.userId ?? i}
              title={m.username}
              className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] flex items-center justify-center text-[10px] font-medium text-white shrink-0"
              style={{ background: `hsl(${hue} 50% 45%)`, zIndex: visible.length - i }}
            >
              {m.username?.charAt(0).toUpperCase()}
            </div>
          )
        })}
        {overflow > 0 && (
          <div className="w-6 h-6 rounded-full ring-2 ring-[var(--bg-card)] bg-[var(--bg-subtle)] flex items-center justify-center text-[9px] font-semibold text-[var(--text-secondary)]">
            +{overflow}
          </div>
        )}
      </div>
    </div>
  )
}
export function TeamsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { activeOrganization, workspaceMode } = useWorkspace()
  const orgId = activeOrganization?.id
  const { data: teams = [], isLoading: teamsLoading } = useOrgTeams(orgId)
  const { data: members = [] } = useOrgMembers(orgId)

  const [createTeamModalOpen, setCreateTeamModalOpen] = useState(false)
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [search, setSearch] = useState('')

  const { canManage, canCreateTeam, canManageTeam } = usePermissions()

  const filteredTeams = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return teams
    return teams.filter((t) => t.name?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
  }, [teams, search])

  const orgObserverTotal = useMemo(() => teams.reduce((sum, t) => sum + (t.observers?.length || 0), 0), [teams])
  const pageState = teamsLoading ? 'loading' : teams.length === 0 ? 'empty' : 'ready'

  if (!activeOrganization || workspaceMode === 'PERSONAL') {
    return <Navigate to="/app" replace />
  }


  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="space-y-5">
            <PageHeader
              eyebrow={`Teams · ${activeOrganization.name}`}
              icon={Icons.users}
              title="Teams workspace"
              subtitle="Manage your organization's divisions and collaborative units."
              actions={
                canCreateTeam && (
                  <Button variant="primary" size="sm" onClick={() => setCreateTeamModalOpen(true)} className="shadow-sm h-8 text-[12px]">
                    <Icons.plus className="w-3.5 h-3.5 mr-1" />
                    Create Team
                  </Button>
                )
              }
            />

            {teams.length > 0 && (
              <>
                <div className="flex flex-wrap items-center gap-2">
                  <StatPill icon={Icons.users} label="teams" value={teams.length} />
                  <StatPill icon={Icons.users} label="members" value={members.length} />
                  {orgObserverTotal > 0 && <StatPill icon={Icons.search} label="observers" value={orgObserverTotal} />}
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Icons.search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-hidden="true" />
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search teams..."
                      aria-label="Search teams"
                      className="w-full pl-9 pr-3 py-2 text-[13px] bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-colors text-[var(--text-primary)]"
                    />
                  </div>
                </div>
              </>
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
            description: 'Create a team to organize members, own projects, and coordinate work.',
            actionLabel: canCreateTeam ? 'Create Team' : undefined,
            onAction: canCreateTeam ? () => setCreateTeamModalOpen(true) : undefined,
          }}
        >
          {filteredTeams.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
              <Icons.search className="w-6 h-6 text-[var(--text-muted)] mx-auto mb-3" />
              <Text variant="muted" className="text-[13px]">No teams match "{search}".</Text>
            </div>
          ) : (
            <TeamsGrid
              teams={filteredTeams}
              user={user}
              orgId={orgId}
              canManage={canManage}
              canManageTeam={canManageTeam}
              navigate={navigate}
              setSelectedTeam={setSelectedTeam}
            />
          )}
        </PageStateContainer>
      </ManagementLayout>

      <CreateTeamModal isOpen={createTeamModalOpen} onClose={() => setCreateTeamModalOpen(false)} orgId={orgId} />
      <ManageTeamMembersModal isOpen={!!selectedTeam} onClose={() => setSelectedTeam(null)} team={teams.find((t) => t.id === selectedTeam?.id) || selectedTeam} orgMembers={members} />
    </WorkspaceShell>
  )
}

function TeamsGrid({ teams, user, orgId, canManage, canManageTeam, navigate, setSelectedTeam }) {
  const myTeams = teams.filter((team) => team.members?.some((m) => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase()))
  const otherTeams = teams.filter((team) => !team.members?.some((m) => m.userId === user?.id || m.username?.toLowerCase() === user?.username?.toLowerCase()))

  return (
    <div className="space-y-8">
      {myTeams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Heading level={5} className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Your Teams</Heading>
            <span className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{myTeams.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myTeams.map((team) => <TeamCard key={team.id} team={team} isMember orgId={orgId} canManage={canManage} canManageTeam={canManageTeam} navigate={navigate} setSelectedTeam={setSelectedTeam} />)}
          </div>
        </section>
      )}

      {otherTeams.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Heading level={5} className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">All Teams</Heading>
            <span className="h-px flex-1 bg-[var(--border-subtle)]" />
            <span className="text-[11px] text-[var(--text-muted)] tabular-nums">{otherTeams.length}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherTeams.map((team) => <TeamCard key={team.id} team={team} isMember={false} orgId={orgId} canManage={canManage} canManageTeam={canManageTeam} navigate={navigate} setSelectedTeam={setSelectedTeam} />)}
          </div>
        </section>
      )}
    </div>
  )
}

function TeamCard({ team, isMember, orgId, canManage, canManageTeam, navigate, setSelectedTeam }) {
  const canEnterTeam = isMember || canManageTeam || canManage
  const observersCount = team.observers?.length || 0
  const memberCount = team.members?.length ?? 0

  const handleEnter = (e) => {
    e?.stopPropagation()
    navigate(`/app/organizations/${orgId}/teams/${team.id}`)
  }

  const handleClick = () => {
    if (canEnterTeam) {
      handleEnter()
    } else {
      toast.warning('You are not a member of this team. Contact a manager to join.')
    }
  }

  return (
    <div
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' ? handleClick() : null)}
      className={cn(
        'group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 flex flex-col transition-all duration-200 overflow-hidden',
        canEnterTeam
          ? 'hover:border-[var(--accent-border)] hover:shadow-sm hover:-translate-y-0.5 cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--accent)]/40 outline-none'
          : 'opacity-80 cursor-default'
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-3 relative">
        <div className="flex items-center gap-3 min-w-0">
          <TeamAvatar name={team.name} size="md" />
          <div className="min-w-0">
            <Heading level={4} className="text-[14px] font-semibold leading-tight truncate tracking-tight" title={team.name}>{team.name}</Heading>
            {isMember && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[var(--accent)] mt-0.5">
                <span className="w-1 h-1 rounded-full bg-[var(--accent)]" /> You're a member
              </span>
            )}
          </div>
        </div>
      </div>

      <Text variant="muted" size="sm" className="line-clamp-2 mb-4 min-h-[2.5em] text-[12px] relative">
        {team.description || 'No description provided.'}
      </Text>

      <div className="flex items-center justify-between mb-4 relative">
        <MemberAvatarStack members={team.members} max={4} />
        <div className="flex flex-col items-end gap-1">
          <Badge variant="outline" className="text-[10px]">{memberCount} member{memberCount === 1 ? '' : 's'}</Badge>
          {observersCount > 0 && (
            <Badge variant="outline" className="text-[10px] bg-[var(--info-soft)] text-[var(--info)] border-transparent">{observersCount} obs.</Badge>
          )}
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-[var(--border-subtle)] flex gap-2 relative">
        {canEnterTeam && (
          <Button variant="default" size="sm" className="flex-1 h-8 text-[12px] shadow-sm" onClick={handleEnter}>
            Enter Portal <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
          </Button>
        )}
        {canManageTeam && (
          <Button variant="outline" size="sm" className={canEnterTeam ? 'flex-1 h-8 text-[12px]' : 'w-full h-8 text-[12px]'} onClick={(e) => { e.stopPropagation(); setSelectedTeam(team) }}>
            <Icons.settings className="w-3.5 h-3.5 mr-1" /> Manage
          </Button>
        )}
      </div>
    </div>
  )
}
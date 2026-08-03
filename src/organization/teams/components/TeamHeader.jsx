import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { SaveToggle } from '@/library/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { PermissionButton, FolderIcon, ChecklistIcon, CheckIcon, ChatIcon } from './Shared'
import { useNavigate } from 'react-router-dom'

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

export function TeamHeader({ team, orgId, insights, teamProjects, teamTasks, isReadOnly, canManage, canCreateProject, onManageMembers, onCreateProject, onOpenChat }) {
  const navigate = useNavigate()
  const hue = hashHue(team.name)

  return (
    <div className="relative overflow-hidden rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ background: `radial-gradient(circle at 10% -10%, hsl(${hue} 80% 55%), transparent 55%)` }} aria-hidden="true" />
      <div className="relative px-6 py-5 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="min-w-0 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg shadow-sm ring-1 ring-black/5 shrink-0" style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 40%))` }}>{team.name.charAt(0).toUpperCase()}</div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <Heading level={2} className="tracking-tight text-[18px] font-semibold mb-0">{team.name}</Heading>
              <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] text-[10px] font-mono uppercase">Team</Badge>
              {isReadOnly && <Badge variant="outline" className="bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 text-[10px] font-mono uppercase">Observer</Badge>}
              <SaveToggle entityType={ENTITY_TYPES.TEAM} entityId={team.id} className="ml-1" />
            </div>
            {team.description && <Text variant="muted" className="text-[13px] max-w-xl mb-2.5">{team.description}</Text>}
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"><Icons.users className="w-3 h-3 text-[var(--accent)]" /> {team.members?.length || 0} Members</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"><FolderIcon className="w-3 h-3 text-[var(--accent)]" /> {teamProjects.length} Projects</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"><ChecklistIcon className="w-3 h-3 text-[var(--accent)]" /> {teamTasks.length} Tasks</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-secondary)]"><CheckIcon className="w-3 h-3 text-[var(--accent)]" /> {insights.completionRate}% Complete</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <PermissionButton allowed={canCreateProject && !isReadOnly} reason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."} onClick={onCreateProject} variant="primary" icon={Icons.plus}>Create Project</PermissionButton>
          <PermissionButton allowed={canManage} reason="You don't have permission to manage this team." onClick={onManageMembers} icon={Icons.settings}>Manage Team</PermissionButton>
          <Button variant="ghost" size="sm" onClick={onOpenChat} className="gap-1.5 text-[12px] h-8"><ChatIcon className="w-3.5 h-3.5" /> Discussion</Button>
          <Button variant="ghost" size="sm" onClick={() => navigate(`/app/organizations/${orgId}`)} className="gap-1.5 text-[12px] h-8"><Icons.chevronLeft className="w-4 h-4" /> Back</Button>
        </div>
      </div>
    </div>
  )
}
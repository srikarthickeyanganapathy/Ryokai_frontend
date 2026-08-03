import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { PermissionButton, ProgressBar } from '../components/Shared'

function formatRelative(dateStr) {
  if (!dateStr) return null
  const d = new Date(dateStr)
  if (Number.isNaN(d.getTime())) return null
  const days = Math.floor((Date.now() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (days <= 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function MembersTab({ team, workload, teamTasks, hasProjectIdOnTasks, hasTaskTimestamps, canManage, onManageMembers }) {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <Heading level={3} className="text-[14px] font-semibold tracking-tight">Roster</Heading>
        <PermissionButton allowed={canManage} reason="You don't have permission to manage team members." onClick={onManageMembers} icon={Icons.users}>Manage Members</PermissionButton>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {team.members?.map(m => {
          const taskCount = workload[m.username] || 0
          const relativeMax = Math.max(...Object.values(workload), 1)
          const tone = taskCount > 4 ? 'High' : taskCount > 2 ? 'Medium' : 'Low'
          const toneClasses = taskCount > 4 ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20' : taskCount > 2 ? 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20' : 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]'
          const memberProjectCount = hasProjectIdOnTasks ? new Set(teamTasks.filter(t => t.assignedTo === m.username && t.projectId != null).map(t => t.projectId)).size : null
          const lastTask = hasTaskTimestamps ? [...teamTasks].filter(t => t.assignedTo === m.username).sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))[0] : null
          const lastAssignment = lastTask ? formatRelative(lastTask.updatedAt || lastTask.createdAt) : null
          return (
            <div key={m.id} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[12px] font-bold shrink-0 shadow-sm">{m.username.charAt(0).toUpperCase()}</div>
                  <div className="min-w-0"><span className="font-semibold block text-[var(--text-primary)] truncate text-[13px]">{m.username}</span><span className="text-[11px] text-[var(--text-muted)]">{m.orgRole || 'Member'}</span></div>
                </div>
                <Badge variant="outline" className={cn('text-[9px] font-semibold shrink-0', toneClasses)}>{tone}</Badge>
              </div>
              <ProgressBar value={taskCount} max={relativeMax} className="h-1.5 mb-3" barClassName={taskCount > 4 ? 'bg-[var(--danger)]' : taskCount > 2 ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]'} />
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)]">
                <span>{taskCount} Active Task{taskCount === 1 ? '' : 's'}</span>
                {memberProjectCount != null && memberProjectCount > 0 && <span>{memberProjectCount} Project{memberProjectCount === 1 ? '' : 's'}</span>}
                {lastAssignment && <span>Last Assignment: {lastAssignment}</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
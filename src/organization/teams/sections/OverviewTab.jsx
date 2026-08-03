import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { SummaryStat, ProgressBar, PermissionButton, CheckIcon, ChecklistIcon, ChatIcon, AlertIcon, FolderIcon } from '../components/Shared'

const ATTENTION_ICONS = {
  unassigned: ChecklistIcon,
  priority: AlertIcon,
  idle: Icons.users,
  lead: FolderIcon,
}

export function OverviewTab({ team, insights, teamTasks, teamProjects, observerCount, hasTaskTimestamps, canCreateProject, canAssignTask, canManage, isReadOnly, onManageMembers, onCreateProject, onAssignTask, onOpenChat, onOpenTasks, setActiveTab }) {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">{team.name} Summary</Heading>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <SummaryStat label="Members" value={team.members?.length || 0} icon={Icons.users} />
              <SummaryStat label="Active Projects" value={insights.activeProjectsCount} icon={FolderIcon} />
              <SummaryStat label="Active Tasks" value={insights.activeCount} icon={ChecklistIcon} />
              <SummaryStat label="Done This Week" value={hasTaskTimestamps ? insights.completedThisWeek : '—'} icon={CheckIcon} accent="success" />
            </div>
            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">Projects Active</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{insights.activeProjectsCount} / {teamProjects.length}</span>
                </div>
                <ProgressBar value={insights.activeProjectsCount} max={Math.max(teamProjects.length, 1)} />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">Tasks Open</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{insights.activeCount} / {teamTasks.length}</span>
                </div>
                <ProgressBar value={insights.activeCount} max={Math.max(teamTasks.length, 1)} barClassName="bg-[var(--info)]" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">Completion Rate</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{insights.completionRate}%</span>
                </div>
                <ProgressBar value={insights.completionRate} max={100} barClassName="bg-[var(--accent)]" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">Needs Attention</Heading>
              <Badge variant="outline" className="text-[10px] bg-[var(--warning-soft)] text-[var(--warning)] border-transparent">{insights.needsAttention.length} items</Badge>
            </div>
            {insights.needsAttention.length === 0 ? (
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)] py-4">
                <CheckIcon className="w-4 h-4 text-[var(--accent)]" />
                <Text size="sm" className="text-[13px]">All clear — nothing needs attention right now.</Text>
              </div>
            ) : (
              <div className="space-y-2">
                {insights.needsAttention.map(item => {
                  const ItemIcon = item.icon || ATTENTION_ICONS[item.key] || AlertIcon
                  return (
                    <button key={item.key} onClick={() => setActiveTab(item.key === 'idle' ? 'members' : item.key === 'lead' ? 'projects' : 'tasks')} className="w-full flex items-center gap-3 p-3 rounded-lg bg-[var(--bg-subtle)]/50 hover:bg-[var(--bg-subtle)] border border-[var(--border-subtle)] transition-colors text-left">
                      <ItemIcon className="w-4 h-4 text-[var(--warning)] shrink-0" />
                      <span className="text-[13px] text-[var(--text-primary)] flex-1"><span className="font-semibold tabular-nums">{item.count}</span> {item.label}</span>
                      <span className="text-[var(--text-muted)] text-xs">→</span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <Heading level={3} className="text-[14px] font-semibold tracking-tight mb-4">Quick Actions</Heading>
            <div className="flex flex-col gap-2">
              <PermissionButton allowed={canCreateProject && !isReadOnly} reason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."} onClick={onCreateProject} icon={Icons.plus} className="w-full justify-center">Create Project</PermissionButton>
              <PermissionButton allowed={canAssignTask && !isReadOnly} reason={isReadOnly ? 'Observers cannot assign tasks.' : "You don't have permission to assign tasks."} onClick={onAssignTask} icon={ChecklistIcon} className="w-full justify-center">Assign Task</PermissionButton>
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8" onClick={onOpenTasks}><ChecklistIcon className="w-3 h-3" /> Open Backlog</Button>
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8" onClick={onOpenChat}><ChatIcon className="w-3 h-3" /> Open Discussion</Button>
              <PermissionButton allowed={canManage} reason="You don't have permission to manage team members." onClick={onManageMembers} icon={Icons.users} className="w-full justify-center">Manage Members</PermissionButton>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">Recent Discussion</Heading>
              <button onClick={onOpenChat} className="text-[11px] font-medium text-[var(--accent)] hover:underline">Open →</button>
            </div>
            {insights.recentMessages.length === 0 ? <Text variant="muted" size="sm" className="italic text-[12px]">No messages yet.</Text> : (
              <div className="space-y-4">
                {insights.recentMessages.map(msg => (
                  <div key={msg.id} className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] font-semibold shrink-0 shadow-sm">{msg.authorUsername.charAt(0).toUpperCase()}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2"><span className="font-semibold text-[12px] text-[var(--text-primary)]">{msg.authorUsername}</span><span className="text-[10px] text-[var(--text-muted)]">{new Date(msg.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span></div>
                      <Text size="sm" className="text-[var(--text-secondary)] truncate text-[12px]">{msg.content}</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2">
              <Icons.search className="w-3.5 h-3.5 text-[var(--info)]" />
              <Text size="sm" className="text-[12px] text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{observerCount}</span> observer{observerCount === 1 ? '' : 's'} watching</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
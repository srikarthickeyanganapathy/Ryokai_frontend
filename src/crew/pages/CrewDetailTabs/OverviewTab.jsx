import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { SummaryStat, ProgressBar, CheckIcon, ChecklistIcon, ChatIcon, FolderIcon } from '../../components/CrewShared';
import { ListTodo, Pencil } from 'lucide-react';

export function OverviewTab({ crew, members = [], sharedProjects = [], crewTasks = [], channels = [], completionRate = 0, setActiveTab, isCreator }) {
  const activeTasksCount = crewTasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED').length;
  const doneTasksCount = crewTasks.length - activeTasksCount;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Summary & Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">{crew.name} Summary</Heading>
              <span className="text-[11px] text-[var(--text-muted)] font-mono">Created on {new Date(crew?.createdAt || Date.now()).toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <SummaryStat label="Members" value={`${members.length}/${crew.memberCap || '∞'}`} icon={Icons.users} />
              <SummaryStat label="Projects" value={sharedProjects.length} icon={FolderIcon} />
              <SummaryStat label="Total Tasks" value={crewTasks.length} icon={ChecklistIcon} />
              <SummaryStat label="Done" value={doneTasksCount} icon={CheckIcon} accent="success" />
            </div>
            <div className="space-y-4 pt-4 border-t border-[var(--border-subtle)]">
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">Tasks Open</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{activeTasksCount} / {crewTasks.length}</span>
                </div>
                <ProgressBar value={activeTasksCount} max={Math.max(crewTasks.length, 1)} barClassName="bg-[var(--info)]" />
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] mb-1.5">
                  <span className="text-[var(--text-secondary)] font-medium">Mission Completion Rate</span>
                  <span className="text-[var(--text-muted)] tabular-nums">{completionRate}%</span>
                </div>
                <ProgressBar value={completionRate} max={100} barClassName="bg-[var(--accent)]" />
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">Recent Updates</Heading>
              <Badge variant="outline" className="text-[10px] bg-[var(--bg-subtle)] text-[var(--text-muted)] border-transparent">Activity</Badge>
            </div>
            {crewTasks.length === 0 ? (
              <div className="flex items-center gap-2.5 text-[var(--text-secondary)] py-4">
                <CheckIcon className="w-4 h-4 text-[var(--accent)]" />
                <Text size="sm" className="text-[13px]">No recent task activity in this crew.</Text>
              </div>
            ) : (
              <div className="space-y-3">
                {crewTasks.slice(0, 4).map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)]">
                    <div className="w-7 h-7 rounded-md bg-[var(--bg-card)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0 mt-0.5">
                      <ListTodo className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="font-semibold text-[13px] text-[var(--text-primary)] truncate">{task.title}</span>
                        <span className="text-[10px] text-[var(--text-muted)] uppercase font-mono">{task.status || 'Todo'}</span>
                      </div>
                      <Text size="sm" className="text-[var(--text-secondary)] truncate text-[12px]">Updated in mission objectives</Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Rail */}
        <div className="space-y-6">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <Heading level={3} className="text-[14px] font-semibold tracking-tight mb-4">Quick Actions</Heading>
            <div className="flex flex-col gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8 shadow-sm" onClick={() => setActiveTab('tasks')}><Icons.plus className="w-3 h-3" /> Add Task</Button>
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8 shadow-sm" onClick={() => setActiveTab('channels')}><ChatIcon className="w-3 h-3" /> Open Chat</Button>
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8 shadow-sm" onClick={() => setActiveTab('whiteboards')}><Pencil className="w-3 h-3" /> New Whiteboard</Button>
              <Button variant="outline" size="sm" className="gap-1.5 w-full justify-center text-[12px] h-8 shadow-sm" onClick={() => setActiveTab('members')}><Icons.users className="w-3 h-3" /> View Members</Button>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <Heading level={3} className="text-[14px] font-semibold tracking-tight">Squad Members</Heading>
              <button onClick={() => setActiveTab('members')} className="text-[11px] font-medium text-[var(--accent)] hover:underline">View All →</button>
            </div>
            {members.length === 0 ? (
              <Text variant="muted" size="sm" className="italic text-[12px]">No members yet.</Text>
            ) : (
              <div className="space-y-3">
                {members.slice(0, 4).map(m => (
                  <div key={m.userId || m.username} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-[var(--accent)] text-white font-bold text-[10px] flex items-center justify-center border border-black/5 shadow-sm shrink-0">
                      {m.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[12px] text-[var(--text-primary)] truncate">@{m.username}</span>
                        <span className="text-[10px] text-[var(--text-muted)]">{m.role === 'CREATOR' || m.role === 'OWNER' ? 'Owner' : 'Member'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-5 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-2">
              <Icons.users className="w-3.5 h-3.5 text-[var(--info)]" />
              <Text size="sm" className="text-[12px] text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{members.length}</span> active squad member{members.length === 1 ? '' : 's'}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

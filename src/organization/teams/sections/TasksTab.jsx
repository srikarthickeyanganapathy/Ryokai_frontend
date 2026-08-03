import React from 'react'
import { Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { EmptyState, ChecklistIcon, LockIcon } from '../components/Shared'

function TaskColumn({ title, tasks, tone, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask }) {
  const toneDot = { warning: 'bg-[var(--warning)]', info: 'bg-[var(--info)]', accent: 'bg-[var(--accent)]', muted: 'bg-[var(--text-muted)]' }[tone]
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden min-w-[250px]">
      <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-subtle)]/30">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--text-primary)]"><span className={cn('w-1.5 h-1.5 rounded-full', toneDot)} />{title}</span>
        <span className="text-[10px] text-[var(--text-muted)] tabular-nums bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded-full font-medium">{tasks.length}</span>
      </div>
      <div className="p-2.5 space-y-2 max-h-[60vh] overflow-y-auto">
        {tasks.length === 0 ? <div className="text-center py-8"><Text size="xs" variant="muted" className="italic text-[11px]">No tasks</Text></div> : (
          tasks.map(task => (
            <div key={task.id} className="p-3 rounded-lg bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-colors">
              <Text size="sm" className={cn('font-medium block truncate mb-2 text-[12px]', task.status === 'Done' && 'line-through text-[var(--text-secondary)]')}>{task.title}</Text>
              <div className="flex items-center justify-between gap-1.5">
                <Badge className={cn('text-[9px]', PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)}>{normalizePriority(task.priority)}</Badge>
                {task.status !== 'Done' && (
                  <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
                    <PopoverTrigger asChild>
                      <button disabled={!canAssignTask || isReadOnly} className={cn('text-[10px] font-medium px-2 py-0.5 rounded-full border transition-colors flex items-center gap-1', (!canAssignTask || isReadOnly) ? 'text-[var(--text-muted)] border-[var(--border-subtle)] opacity-60 cursor-not-allowed' : 'text-[var(--accent)] border-[var(--accent-border)] hover:bg-[var(--accent-soft)]')}>
                        {(!canAssignTask || isReadOnly) && <LockIcon className="w-2 h-2" />}{task.assignedTo || 'Assign'}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-48 p-1.5">
                      <Text size="xs" variant="muted" className="px-2 py-1 uppercase font-bold tracking-wide text-[10px]">Assign Member</Text>
                      <div className="space-y-0.5 max-h-40 overflow-y-auto">
                        {team.members?.map(m => <button key={m.id} onClick={() => handleAssignTask(task.id, m.id, m.username)} className="w-full flex items-center gap-2 px-2 py-1.5 text-[12px] rounded hover:bg-[var(--bg-hover)] transition-colors text-left"><div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[8px] shrink-0">{m.username.charAt(0).toUpperCase()}</div><span className="truncate">{m.username}</span></button>)}
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export function TasksTab({ teamTasks, taskBoard, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask }) {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">
      {teamTasks.length === 0 ? (
        <EmptyState icon={ChecklistIcon} title="No Tasks Yet" description="Tasks assigned to this team will show up here." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <TaskColumn title="Unassigned" tasks={taskBoard.unassigned} tone="warning" team={team} canAssignTask={canAssignTask} isReadOnly={isReadOnly} assigningTaskId={assigningTaskId} setAssigningTaskId={setAssigningTaskId} handleAssignTask={handleAssignTask} />
          <TaskColumn title="In Progress" tasks={taskBoard.inProgress} tone="info" team={team} canAssignTask={canAssignTask} isReadOnly={isReadOnly} assigningTaskId={assigningTaskId} setAssigningTaskId={setAssigningTaskId} handleAssignTask={handleAssignTask} />
          <TaskColumn title="Review" tasks={taskBoard.review} tone="accent" team={team} canAssignTask={canAssignTask} isReadOnly={isReadOnly} assigningTaskId={assigningTaskId} setAssigningTaskId={setAssigningTaskId} handleAssignTask={handleAssignTask} />
          <TaskColumn title="Completed" tasks={taskBoard.completed} tone="muted" team={team} canAssignTask={canAssignTask} isReadOnly={isReadOnly} assigningTaskId={assigningTaskId} setAssigningTaskId={setAssigningTaskId} handleAssignTask={handleAssignTask} />
        </div>
      )}
    </div>
  )
}
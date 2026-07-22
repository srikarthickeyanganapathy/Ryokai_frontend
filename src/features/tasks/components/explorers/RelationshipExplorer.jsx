import React, { useMemo } from 'react'
import ExplorerNavBar from './ExplorerNavBar'
import { FolderOpen, User, Network, Tag } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const STATUS_DOT = {
  COMPLETED: 'bg-emerald-400', DONE: 'bg-emerald-400',
  IN_PROGRESS: 'bg-blue-400', IN_REVIEW: 'bg-amber-400', SUBMITTED: 'bg-amber-400',
  OPEN: 'bg-slate-500', TODO: 'bg-slate-500'
}

function TaskList({ tasks, navigator, currentTaskId, emptyText }) {
  if (tasks.length === 0) {
    return <p className="text-xs text-white/25 italic pl-5">{emptyText}</p>
  }
  return (
    <div className="space-y-0.5">
      {tasks.slice(0, 12).map(task => {
        const status = task.status || task.currentStatus || 'OPEN'
        return (
          <button
            key={task.id}
            onClick={() => navigator.navigateTo(task.id)}
            className={cn(
              "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer",
              task.id === currentTaskId ? "bg-cyan-500/15 border border-cyan-500/30" : "hover:bg-white/5 border border-transparent"
            )}
          >
            <span className={cn("w-2 h-2 rounded-full shrink-0", STATUS_DOT[status] || STATUS_DOT.OPEN)} />
            <span className="text-xs text-white/80 truncate flex-1">{task.title}</span>
            <span className="text-[10px] text-white/20 font-mono">#{task.id}</span>
          </button>
        )
      })}
      {tasks.length > 12 && (
        <p className="text-[10px] text-white/20 italic pl-5">+{tasks.length - 12} more</p>
      )}
    </div>
  )
}

export default function RelationshipExplorer({ context, navigator, analysis, onCenterOnGraph }) {
  const { currentTask, currentTaskId } = navigator

  const projectCluster = useMemo(() => analysis.getProjectCluster(currentTaskId), [analysis, currentTaskId])
  const assigneeWorkload = useMemo(() => analysis.getAssigneeWorkload(currentTaskId), [analysis, currentTaskId])
  const neighbors = useMemo(() => analysis.getNeighbors(currentTaskId, 2), [analysis, currentTaskId])

  const projectByStatus = useMemo(() => {
    const groups = {}
    projectCluster.forEach(t => {
      const s = t.status || t.currentStatus || 'OPEN'
      if (!groups[s]) groups[s] = []
      groups[s].push(t)
    })
    return groups
  }, [projectCluster])

  if (!currentTask) {
    return <div className="p-4 text-white/30 text-sm italic">No task selected</div>
  }

  const assignee = currentTask.assignedTo || currentTask.assignee

  return (
    <div className="space-y-4">
      <ExplorerNavBar navigator={navigator} onCenterOnGraph={onCenterOnGraph} />

      {/* Project Cluster */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <FolderOpen size={12} className="text-purple-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Project Cluster ({projectCluster.length})
          </span>
        </div>
        {Object.keys(projectByStatus).length === 0 ? (
          <p className="text-xs text-white/25 italic pl-5">No project assigned</p>
        ) : (
          Object.entries(projectByStatus).map(([status, tasks]) => (
            <div key={status} className="mb-2">
              <div className="text-[10px] text-white/30 font-mono mb-1 pl-2 flex items-center gap-1.5">
                <span className={cn("w-1.5 h-1.5 rounded-full", STATUS_DOT[status] || STATUS_DOT.OPEN)} />
                {status} ({tasks.length})
              </div>
              <TaskList tasks={tasks} navigator={navigator} currentTaskId={currentTaskId} emptyText="" />
            </div>
          ))
        )}
      </div>

      {/* Assignee Workload */}
      {assignee && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <User size={12} className="text-cyan-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              {assignee}'s Workload ({assigneeWorkload.length})
            </span>
          </div>
          <TaskList tasks={assigneeWorkload} navigator={navigator} currentTaskId={currentTaskId} emptyText="No other assigned tasks" />
        </div>
      )}

      {/* Graph Neighborhood */}
      <div>
        <div className="flex items-center gap-1.5 mb-2">
          <Network size={12} className="text-amber-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Neighborhood — 2 hops ({neighbors.length})
          </span>
        </div>
        <TaskList tasks={neighbors} navigator={navigator} currentTaskId={currentTaskId} emptyText="No connected tasks in the graph" />
      </div>
    </div>
  )
}

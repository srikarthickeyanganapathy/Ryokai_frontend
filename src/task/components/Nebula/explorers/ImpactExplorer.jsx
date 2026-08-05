import React, { useMemo } from 'react'
import ExplorerNavBar from './ExplorerNavBar'
import { Zap, AlertTriangle, TrendingDown, Users } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const PRIORITY_BADGE = {
  URGENT: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  HIGH: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  MEDIUM: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  LOW: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
}

export default function ImpactExplorer({ context, navigator, analysis, onCenterOnGraph }) {
  const { currentTask, currentTaskId } = navigator

  const directUnblocks = useMemo(() => analysis.getUnblocks(currentTaskId), [analysis, currentTaskId])
  const fullCascade = useMemo(() => analysis.getDownstreamCascade(currentTaskId), [analysis, currentTaskId])

  const cascadeByDepth = useMemo(() => {
    const depths = new Map()
    const visited = new Set()
    const queue = [{ id: currentTaskId, depth: 0 }]

    while (queue.length > 0) {
      const { id, depth } = queue.shift()
      if (visited.has(id) || depth === 0) {
        if (depth === 0) {
          visited.add(id)
          const unblocks = analysis.getUnblocks(id)
          unblocks.forEach(t => queue.push({ id: t.id, depth: 1 }))
        }
        if (visited.has(id)) continue
      }
      visited.add(id)

      if (!depths.has(depth)) depths.set(depth, [])
      const task = context.taskMap.get(id)
      if (task) depths.get(depth).push(task)

      const unblocks = analysis.getUnblocks(id)
      unblocks.forEach(t => {
        if (!visited.has(t.id)) queue.push({ id: t.id, depth: depth + 1 })
      })
    }
    return depths
  }, [currentTaskId, analysis, context.taskMap])

  const highPriorityDownstream = fullCascade.filter(t => {
    const p = (t.priority || '').toUpperCase()
    return p === 'URGENT' || p === 'HIGH'
  })

  const affectedAssignees = useMemo(() => {
    const set = new Set()
    fullCascade.forEach(t => {
      const a = t.assignedTo || t.assignee
      if (a) set.add(a)
    })
    return Array.from(set)
  }, [fullCascade])

  if (!currentTask) {
    return <div className="p-4 text-white/30 text-sm italic">No task selected</div>
  }

  return (
    <div className="space-y-4">
      <ExplorerNavBar navigator={navigator} onCenterOnGraph={onCenterOnGraph} />

      {/* Blast Radius Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-cyan-300">{directUnblocks.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Direct</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-emerald-300">{fullCascade.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Cascade</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-amber-300">{affectedAssignees.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">People</div>
        </div>
      </div>

      {/* Risk Propagation */}
      {highPriorityDownstream.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-rose-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              High-Priority Downstream ({highPriorityDownstream.length})
            </span>
          </div>
          <div className="space-y-0.5">
            {highPriorityDownstream.map(task => (
              <button
                key={task.id}
                onClick={() => navigator.navigateTo(task.id)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded border", PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.MEDIUM)}>
                  {task.priority}
                </span>
                <span className="text-xs text-white/90 truncate flex-1">{task.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cascade by Depth */}
      {cascadeByDepth.size > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Zap size={12} className="text-emerald-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Cascade Tree
            </span>
          </div>
          {Array.from(cascadeByDepth.entries()).map(([depth, tasks]) => (
            <div key={depth} className="mb-2">
              <div className="text-[10px] text-white/25 font-mono mb-1 pl-2">
                Depth {depth} — {tasks.length} task{tasks.length > 1 ? 's' : ''}
              </div>
              <div className="space-y-0.5">
                {tasks.slice(0, 8).map(task => (
                  <button
                    key={task.id}
                    onClick={() => navigator.navigateTo(task.id)}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
                    style={{ paddingLeft: `${10 + depth * 12}px` }}
                  >
                    <span className="text-xs text-white/70 truncate flex-1">{task.title}</span>
                    <span className="text-[10px] text-white/20 font-mono">#{task.id}</span>
                  </button>
                ))}
                {tasks.length > 8 && (
                  <p className="text-[10px] text-white/20 italic pl-5">+{tasks.length - 8} more</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Affected People */}
      {affectedAssignees.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Users size={12} className="text-purple-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Affected People
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {affectedAssignees.map(name => (
              <span key={name} className="text-[11px] px-2 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-300 font-mono">
                {name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

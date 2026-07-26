import React, { useMemo } from 'react'
import ExplorerNavBar from './ExplorerNavBar'
import { Waves, AlertTriangle, Clock, TrendingUp, Pause } from 'lucide-react'
import { cn } from '@/shared/lib/cn'

const STATUS_ORDER = ['OPEN', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'SUBMITTED', 'BLOCKED', 'COMPLETED', 'DONE']
const STATUS_COLORS = {
  COMPLETED: '#10b981', DONE: '#10b981',
  IN_PROGRESS: '#3b82f6', IN_REVIEW: '#f59e0b', SUBMITTED: '#f59e0b',
  OPEN: '#64748b', TODO: '#64748b', BLOCKED: '#ef4444'
}

export default function FlowExplorer({ context, navigator, analysis, onCenterOnGraph }) {
  const { allTasks } = context
  const { currentTask, currentTaskId } = navigator

  // Status distribution across all visible tasks
  const statusDist = useMemo(() => {
    const dist = {}
    allTasks.forEach(t => {
      const s = t.status || t.currentStatus || 'OPEN'
      if (!dist[s]) dist[s] = []
      dist[s].push(t)
    })
    return dist
  }, [allTasks])

  // Bottleneck detection
  const bottlenecks = useMemo(() => analysis.getBottlenecks(), [analysis])

  // Stuck tasks (no update in > 7 days)
  const stuckTasks = useMemo(() => {
    const now = new Date()
    return allTasks.filter(t => {
      const s = (t.status || t.currentStatus || '').toUpperCase()
      if (s === 'COMPLETED' || s === 'DONE') return false
      if (!t.updatedAt) return false
      const daysSince = Math.floor((now - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24))
      return daysSince > 7
    }).map(t => ({
      ...t,
      daysSinceUpdate: Math.floor((now - new Date(t.updatedAt)) / (1000 * 60 * 60 * 24))
    })).sort((a, b) => b.daysSinceUpdate - a.daysSinceUpdate)
  }, [allTasks])

  // Overdue tasks
  const overdueTasks = useMemo(() => {
    const now = new Date()
    return allTasks.filter(t => {
      const s = (t.status || t.currentStatus || '').toUpperCase()
      if (s === 'COMPLETED' || s === 'DONE') return false
      if (!t.dueDate) return false
      return new Date(t.dueDate) < now
    })
  }, [allTasks])

  const totalTasks = allTasks.length
  const completedCount = (statusDist['COMPLETED']?.length || 0) + (statusDist['DONE']?.length || 0)
  const completionRate = totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0

  return (
    <div className="space-y-4">
      <ExplorerNavBar navigator={navigator} onCenterOnGraph={onCenterOnGraph} />

      {/* Flow Overview */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-white">{totalTasks}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Total</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className="text-lg font-bold text-emerald-300">{completionRate}%</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Done</div>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-lg p-3 text-center">
          <div className={cn("text-lg font-bold", stuckTasks.length > 0 ? "text-amber-400" : "text-white")}>{stuckTasks.length}</div>
          <div className="text-[10px] text-white/40 uppercase tracking-wider">Stalled</div>
        </div>
      </div>

      {/* Status Queue Visualization */}
      <div>
        <div className="flex items-center gap-1.5 mb-3">
          <Waves size={12} className="text-cyan-400" />
          <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
            Status Queues
          </span>
        </div>
        <div className="space-y-2">
          {STATUS_ORDER.filter(s => statusDist[s]?.length > 0).map(status => {
            const tasks = statusDist[status]
            const pct = totalTasks > 0 ? Math.round((tasks.length / totalTasks) * 100) : 0
            const isBottleneck = tasks.length >= 5

            return (
              <div key={status}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_COLORS[status] || '#64748b' }} />
                    <span className="text-[11px] text-white/60 font-mono">{status}</span>
                    {isBottleneck && <AlertTriangle size={10} className="text-amber-400" />}
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">{tasks.length} ({pct}%)</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] || '#64748b' }}
                  />
                </div>
                {/* Show tasks on click/expand - for now show first few */}
                <div className="mt-1 space-y-0.5">
                  {tasks.slice(0, 3).map(t => (
                    <button
                      key={t.id}
                      onClick={() => navigator.navigateTo(t.id)}
                      className={cn(
                        "w-full text-left text-[11px] px-2 py-1 rounded hover:bg-white/5 transition-colors cursor-pointer truncate",
                        t.id === currentTaskId ? "text-cyan-300 bg-cyan-500/10" : "text-white/40"
                      )}
                    >
                      {t.title}
                    </button>
                  ))}
                  {tasks.length > 3 && (
                    <p className="text-[10px] text-white/15 pl-2">+{tasks.length - 3} more</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bottleneck Analysis */}
      {bottlenecks.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <AlertTriangle size={12} className="text-rose-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Bottlenecks
            </span>
          </div>
          <div className="space-y-0.5">
            {bottlenecks.filter(b => b.isStuck).slice(0, 5).map(b => (
              <button
                key={b.task.id}
                onClick={() => navigator.navigateTo(b.task.id)}
                className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <span className="text-xs text-white/80 truncate flex-1">{b.task.title}</span>
                <span className="text-[10px] text-rose-300 font-mono shrink-0">blocks {b.downstreamCount}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stuck Tasks */}
      {stuckTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <Pause size={12} className="text-amber-400" />
            <span className="text-[11px] font-semibold text-white/50 uppercase tracking-wider">
              Stalled ({stuckTasks.length})
            </span>
          </div>
          <div className="space-y-0.5">
            {stuckTasks.slice(0, 5).map(t => (
              <button
                key={t.id}
                onClick={() => navigator.navigateTo(t.id)}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors text-left cursor-pointer"
              >
                <Clock size={11} className="text-amber-400/60 shrink-0" />
                <span className="text-xs text-white/70 truncate flex-1">{t.title}</span>
                <span className="text-[10px] text-amber-300/60 font-mono shrink-0">{t.daysSinceUpdate}d</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

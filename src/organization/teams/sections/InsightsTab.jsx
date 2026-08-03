import React from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'
import { AnalyticsStat, ProgressBar, FolderIcon } from '../components/Shared'

export function InsightsTab({ teamTasks, teamProjects, insights }) {
  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-6xl mx-auto">
      <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
        <Heading level={3} className="text-[14px] font-semibold tracking-tight mb-5">Team Summary</Heading>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <AnalyticsStat label="Tasks" value={insights.total} />
          <AnalyticsStat label="Completed" value={`${insights.completionRate}%`} />
          <AnalyticsStat label="Highest Priority" value={insights.highestPriorityLabel || '—'} tone={insights.highestPriorityLabel ? 'warning' : undefined} />
          <AnalyticsStat label="Busiest Member" value={insights.busiestMember || '—'} />
        </div>
        {insights.largestProject && <div className="mt-5 pt-5 border-t border-[var(--border-subtle)] flex items-center gap-2"><FolderIcon className="w-3.5 h-3.5 text-[var(--accent)]" /><Text size="sm" className="text-[12px] text-[var(--text-secondary)]">Largest project: <span className="font-semibold text-[var(--text-primary)]">{insights.largestProject.name}</span></Text></div>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
          <Heading level={3} className="text-[14px] font-semibold tracking-tight mb-5">Active tasks by priority</Heading>
          <PriorityBreakdown tasks={teamTasks} />
        </div>
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-6">
          <Heading level={3} className="text-[14px] font-semibold tracking-tight mb-5">Projects by status</Heading>
          <StatusBreakdown projects={teamProjects} />
        </div>
      </div>
    </div>
  )
}

function PriorityBreakdown({ tasks }) {
  const counts = tasks.reduce((acc, t) => { if (t.status === 'Done' || t.archived) return acc; const p = normalizePriority(t.priority) || 'Medium'; acc[p] = (acc[p] || 0) + 1; return acc }, {})
  const order = ['Urgent', 'High', 'Medium', 'Low'].filter(p => counts[p])
  if (order.length === 0) return <Text variant="muted" size="sm" className="italic text-[12px]">No active tasks to break down.</Text>
  const max = Math.max(...Object.values(counts))
  return (
    <div className="space-y-4">
      {order.map(p => (
        <div key={p}>
          <div className="flex items-center justify-between text-[11px] mb-1.5"><Badge className={cn('text-[9px]', PRIORITY_COLORS[p?.toUpperCase()] || PRIORITY_COLORS.MEDIUM)}>{p}</Badge><span className="text-[var(--text-muted)] tabular-nums font-medium">{counts[p]}</span></div>
          <ProgressBar value={counts[p]} max={max} className="h-1.5" />
        </div>
      ))}
    </div>
  )
}

function StatusBreakdown({ projects }) {
  const counts = projects.reduce((acc, p) => { const s = p.status || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc }, {})
  const entries = Object.entries(counts)
  if (entries.length === 0) return <Text variant="muted" size="sm" className="italic text-[12px]">No projects yet.</Text>
  const max = Math.max(...Object.values(counts))
  return (
    <div className="space-y-4">
      {entries.map(([status, count]) => (
        <div key={status}>
          <div className="flex items-center justify-between text-[11px] mb-1.5"><span className="uppercase text-[var(--text-secondary)] font-medium">{status}</span><span className="text-[var(--text-muted)] tabular-nums font-medium">{count}</span></div>
          <ProgressBar value={count} max={max} className="h-1.5" barClassName="bg-[var(--info)]" />
        </div>
      ))}
    </div>
  )
}
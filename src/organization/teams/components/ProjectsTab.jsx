import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { ProjectCard } from '@/project/components/ProjectCard'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { FolderPlus, ChevronDown, Target, GanttChart } from '@/shared/ui/Icons'

/* ── Helpers ── */
const HEALTH_META = {
  'on-track':   { color: 'var(--success)', label: 'On Track',   dot: 'bg-emerald-500' },
  'at-risk':    { color: 'var(--warning)', label: 'At Risk',    dot: 'bg-amber-500' },
  'blocked':    { color: 'var(--danger)',  label: 'Blocked',    dot: 'bg-red-500' },
  'completed':  { color: 'var(--success)', label: 'Completed',  dot: 'bg-emerald-500' },
  'planning':   { color: 'var(--text-muted)', label: 'Planning', dot: 'bg-slate-400' },
}

const STATUS_OPTIONS = [
  { value: 'planning',  label: 'Planning',  dot: 'bg-slate-400' },
  { value: 'active',    label: 'Active',    dot: 'bg-blue-500' },
  { value: 'on-track',  label: 'On Track',  dot: 'bg-emerald-500' },
  { value: 'at-risk',   label: 'At Risk',   dot: 'bg-amber-500' },
  { value: 'blocked',   label: 'Blocked',   dot: 'bg-red-500' },
  { value: 'completed', label: 'Completed', dot: 'bg-emerald-500' },
]

const SORT_OPTIONS = [
  { value: 'updated',    label: 'Recently Updated' },
  { value: 'deadline',   label: 'Deadline' },
  { value: 'progress',   label: 'Progress %' },
  { value: 'alpha',      label: 'Alphabetical' },
]

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getHealth(p) {
  if (p.status === 'completed' || p.health === 'completed') return 'completed'
  if (p.health) return p.health
  if (p.status === 'blocked') return 'blocked'
  if (p.status === 'at-risk' || p.status === 'at_risk') return 'at-risk'
  if (p.status === 'active' || p.status === 'on-track' || p.status === 'in_progress') return 'on-track'
  return 'planning'
}

function resolveSort(projects, sortBy) {
  const sorted = [...projects]
  switch (sortBy) {
    case 'deadline':
      return sorted.sort((a, b) => {
        const da = a.endDate || a.deadline || ''
        const db = b.endDate || b.deadline || ''
        if (!da && !db) return 0; if (!da) return 1; if (!db) return -1
        return new Date(da) - new Date(db)
      })
    case 'progress':
      return sorted.sort((a, b) => ((b.progress || 0) - (a.progress || 0)))
    case 'alpha':
      return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    case 'updated':
    default:
      return sorted.sort((a, b) => {
        const ua = a.updatedAt || a.updated_at || ''
        const ub = b.updatedAt || b.updated_at || ''
        if (!ua && !ub) return 0; if (!ua) return 1; if (!ub) return -1
        return new Date(ub) - new Date(ua)
      })
  }
}

function getLeadName(project) {
  if (project.leadName) return project.leadName
  if (project.lead?.name) return project.lead.name
  if (project.lead?.username) return project.lead.username
  if (project.assignedTo) return project.assignedTo
  return null
}

function getLeadInitials(name) {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

/* ── Quick Status Popover (inline) ── */
function QuickStatusPopover({ project, onStatusChange }) {
  const [open, setOpen] = useState(false)
  const health = getHealth(project)
  const meta = HEALTH_META[health] || HEALTH_META['planning']

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-subtle)] hover:bg-[var(--bg-card)] transition-colors text-[var(--text-secondary)]"
      >
        <span className={cn('w-1.5 h-1.5 rounded-full', meta.dot)} />
        {meta.label}
        <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-20 bottom-full mb-1 left-0 w-36 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg p-1"
            >
              {STATUS_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onStatusChange?.(project.id, opt.value); setOpen(false) }}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-1.5 text-[11px] rounded-md hover:bg-[var(--bg-subtle)] transition-colors text-left',
                    (health === opt.value || project.status === opt.value) && 'bg-[var(--accent-soft)]/30'
                  )}
                >
                  <span className={cn('w-1.5 h-1.5 rounded-full', opt.dot)} />
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── Enhanced Project Card wrapper ── */
function ProjectCardEnhanced({ project, onStatusChange }) {
  const health = getHealth(project)
  const meta = HEALTH_META[health] || HEALTH_META['planning']
  const leadName = getLeadName(project)
  const leadInitials = getLeadInitials(leadName)

  const milestoneTotal = project.milestones?.length || 0
  const milestoneDone = project.milestones?.filter(m => m.completed || m.status === 'done').length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden hover:border-[var(--accent-border)] hover:shadow-sm transition-all group"
    >
      {/* Health bar at top */}
      <div className="h-0.5 w-full" style={{ background: meta.color }} />

      {/* Wrapped ProjectCard */}
      <div className="[&_.project-card]:border-0 [&_.project-card]:shadow-none [&_.project-card]:rounded-none">
        <ProjectCard project={project} />
      </div>

      {/* Footer: health, lead, milestones, quick status */}
      <div className="px-4 pb-3 pt-0">
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-[var(--border-subtle)]">
          {/* Left: health + milestones */}
          <div className="flex items-center gap-3">
            {/* Health tooltip */}
            <div className="relative group/health">
              <div className={cn('w-2 h-2 rounded-full cursor-help', meta.dot)} />
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[var(--text-primary)] text-white text-[10px] rounded-md whitespace-nowrap opacity-0 group-hover/health:opacity-100 transition-opacity pointer-events-none z-10">
                {meta.label}
                {health === 'at-risk' && project.riskReason ? ` — ${project.riskReason}` : ''}
                {health === 'blocked' && project.blockReason ? ` — ${project.blockReason}` : ''}
                <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[var(--text-primary)]" />
              </div>
            </div>

            {/* Milestones */}
            {milestoneTotal > 0 && (
              <div className="flex items-center gap-1 text-[10px]">
                <Target className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="font-medium text-[var(--text-secondary)]">{milestoneDone}/{milestoneTotal}</span>
                <span className="text-[var(--text-muted)]">milestones</span>
              </div>
            )}
          </div>

          {/* Right: lead avatar + quick status */}
          <div className="flex items-center gap-2">
            {leadName && (
              <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold border border-[var(--accent-border)]"
                title={leadName}>
                {leadInitials}
              </div>
            )}
            <QuickStatusPopover project={project} onStatusChange={onStatusChange} />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

/* ── Roadmap / Timeline View ── */
function RoadmapView({ projects }) {
  const timelineData = useMemo(() => {
    if (projects.length === 0) return null

    // Find date range
    const now = new Date()
    let earliest = now
    let latest = now

    const items = projects
      .map(p => {
        const start = p.startDate ? new Date(p.startDate) : new Date()
        const end = p.endDate || p.deadline ? new Date(p.endDate || p.deadline) : (() => { const d = new Date(start); d.setMonth(d.getMonth() + 1); return d })()
        if (start < earliest) earliest = start
        if (end > latest) latest = end
        return { ...p, _start: start, _end: end, health: getHealth(p) }
      })
      .filter(i => i._start && i._end)

    // Generate month columns
    const months = []
    const cursor = new Date(earliest.getFullYear(), earliest.getMonth(), 1)
    while (cursor <= latest) {
      months.push(new Date(cursor))
      cursor.setMonth(cursor.getMonth() + 1)
    }

    const totalDays = (latest - earliest) / (1000 * 60 * 60 * 24)
    const laneHeight = 48
    const monthWidth = 120

    return { items, months, earliest, latest, totalDays, laneHeight, monthWidth }
  }, [projects])

  if (!timelineData) {
    return (
      <div className="flex items-center justify-center h-40 text-[var(--text-muted)] text-[12px]">
        Add project dates to see the timeline.
      </div>
    )
  }

  const { items, months, earliest, totalDays, laneHeight, monthWidth } = timelineData

  return (
    <div className="overflow-x-auto rounded-xl border border-[var(--border-subtle)]">
      <div className="min-w-max">
        {/* Month headers */}
        <div className="flex border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 sticky top-0 z-10">
          <div className="w-40 shrink-0 px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] border-r border-[var(--border-subtle)]">
            Project
          </div>
          {months.map((m, i) => (
            <div
              key={i}
              className="flex items-center justify-center text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] border-r border-[var(--border-subtle)]"
              style={{ width: monthWidth }}
            >
              {MONTHS[m.getMonth()]} {m.getFullYear()}
            </div>
          ))}
        </div>

        {/* Project lanes */}
        {items.map((item, idx) => {
          const startOffset = ((item._start - earliest) / (1000 * 60 * 60 * 24)) / totalDays * (months.length * monthWidth)
          const barWidth = Math.max(((item._end - item._start) / (1000 * 60 * 60 * 24)) / totalDays * (months.length * monthWidth), 4)
          const meta = HEALTH_META[item.health] || HEALTH_META['planning']

          return (
            <motion.div
              key={item.id || idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.04, duration: 0.3 }}
              className="flex border-b border-[var(--border-subtle)] hover:bg-[var(--bg-subtle)]/30 transition-colors group"
            >
              {/* Project name */}
              <div className="w-40 shrink-0 px-3 py-2.5 flex items-center gap-2 border-r border-[var(--border-subtle)]">
                <div className={cn('w-2 h-2 rounded-full shrink-0', meta.dot)} />
                <span className="text-[11px] font-medium text-[var(--text-primary)] truncate">{item.name || 'Untitled'}</span>
              </div>

              {/* Timeline area */}
              <div className="relative flex-1" style={{ minWidth: months.length * monthWidth, height: laneHeight }}>
                {/* Grid lines */}
                {months.map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 border-r border-[var(--border-subtle)]/40"
                    style={{ left: i * monthWidth }}
                  />
                ))}

                {/* Project bar */}
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: barWidth }}
                  transition={{ duration: 0.5, delay: idx * 0.05, ease: 'easeOut' }}
                  className="absolute top-2 h-7 rounded-md flex items-center px-2 text-[9px] font-semibold text-white cursor-pointer hover:brightness-110 transition-all shadow-sm group-hover:shadow-md"
                  style={{
                    left: startOffset,
                    background: `linear-gradient(135deg, ${meta.color}, color-mix(in srgb, ${meta.color} 70%, #000))`,
                  }}
                  title={`${item.name}: ${item._start.toLocaleDateString()} → ${item._end.toLocaleDateString()}`}
                >
                  {barWidth > 50 && (
                    <span className="truncate">{(item.progress || 0)}%</span>
                  )}
                </motion.div>

                {/* Milestones as diamonds */}
                {item.milestones?.map((ms, mi) => {
                  if (!ms.date) return null
                  const msDate = new Date(ms.date)
                  const msOffset = ((msDate - earliest) / (1000 * 60 * 60 * 24)) / totalDays * (months.length * monthWidth)
                  return (
                    <div
                      key={mi}
                      className="absolute top-4 w-2.5 h-2.5 rotate-45 border-2 border-white shadow-sm cursor-help"
                      style={{
                        left: msOffset - 5,
                        background: ms.completed || ms.status === 'done' ? 'var(--success)' : 'var(--text-muted)',
                      }}
                      title={`${ms.name || 'Milestone'}: ${msDate.toLocaleDateString()}${ms.completed ? ' ✓' : ''}`}
                    />
                  )
                })}

                {/* Dependency arrows (mock) */}
                {item.blockedBy && items.find(dep => dep.id === item.blockedBy) && (() => {
                  const dep = items.find(d => d.id === item.blockedBy)
                  const depEnd = ((dep._end - earliest) / (1000 * 60 * 60 * 24)) / totalDays * (months.length * monthWidth)
                  const tarStart = startOffset
                  const arrowLength = tarStart - depEnd

                  if (arrowLength <= 0) return null

                  return (
                    <svg
                      className="absolute top-0 left-0 w-full h-full pointer-events-none"
                      style={{ overflow: 'visible' }}
                    >
                      <defs>
                        <marker id="arrowhead" markerWidth="6" markerHeight="4" refX="6" refY="2" orient="auto">
                          <polygon points="0 0, 6 2, 0 4" fill="var(--text-muted)" />
                        </marker>
                      </defs>
                      <line
                        x1={depEnd}
                        y1={laneHeight / 2}
                        x2={tarStart - 8}
                        y2={laneHeight / 2}
                        stroke="var(--text-muted)"
                        strokeWidth="1"
                        strokeDasharray="4 3"
                        opacity="0.5"
                        markerEnd="url(#arrowhead)"
                      />
                    </svg>
                  )
                })()}
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   ProjectsTab — Grid view + Timeline/Roadmap toggle
   ══════════════════════════════════════════════════════ */
export function ProjectsTab({ teamProjects, hasProjectIdOnTasks, tasksForProject, canCreateProject, isReadOnly, onCreateProject }) {
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('updated')
  const [sortOpen, setSortOpen] = useState(false)

  const sortedProjects = useMemo(() => resolveSort(teamProjects, sortBy), [teamProjects, sortBy])

  const handleStatusChange = (projectId, newStatus) => {
    // Callback placeholder — parent can wire this up
    console.log('Status change:', projectId, newStatus)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="py-5"
    >
      {/* Toolbar: create + view toggle + sort */}
      {teamProjects.length > 0 && (
        <div className="flex items-center justify-between mb-4 gap-3">
          {/* Left: view toggle */}
          <div className="flex items-center gap-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'grid'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              <Icons.grid className="w-3.5 h-3.5" />
              Grid
            </button>
            <button
              onClick={() => setViewMode('roadmap')}
              className={cn(
                'flex items-center gap-1 px-3 py-1.5 rounded-md text-[11px] font-medium transition-all',
                viewMode === 'roadmap'
                  ? 'bg-[var(--accent-soft)] text-[var(--accent)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
              )}
            >
              <GanttChart className="w-3.5 h-3.5" />
              Roadmap
            </button>
          </div>

          {/* Right: sort + create */}
          <div className="flex items-center gap-2">
            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-[11px] font-medium text-[var(--text-secondary)] border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition-colors"
              >
                <Icons.sliders className="w-3 h-3 text-[var(--text-muted)]" />
                {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
              </button>
              <AnimatePresence>
                {sortOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setSortOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -4 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-1 w-44 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg p-1 z-40"
                    >
                      {SORT_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                          className={cn(
                            'w-full px-2.5 py-1.5 text-[11px] font-medium rounded-md text-left transition-colors',
                            sortBy === opt.value
                              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                              : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {canCreateProject && !isReadOnly && (
              <Button variant="outline" size="sm" onClick={onCreateProject} className="gap-1.5 text-[12px] h-8">
                <Icons.plus className="w-3.5 h-3.5" /> New Project
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {teamProjects.length === 0 ? (
        <ImmersiveEmptyState
          icon={FolderPlus}
          title="No projects yet"
          description="Create your first team project to start organizing work."
          action={canCreateProject && !isReadOnly ? (
            <Button variant="primary" onClick={onCreateProject} className="gap-1.5">
              <Icons.plus className="w-4 h-4" /> Create Project
            </Button>
          ) : null}
        />
      ) : viewMode === 'grid' ? (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          <AnimatePresence mode="popLayout">
            {sortedProjects.map(project => (
              <ProjectCardEnhanced
                key={project.id}
                project={project}
                onStatusChange={handleStatusChange}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <RoadmapView projects={sortedProjects} />
        </motion.div>
      )}
    </motion.div>
  )
}

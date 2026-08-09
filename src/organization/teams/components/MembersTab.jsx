import React, { useMemo, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { Users } from '@/shared/ui/Icons'
import { SPRINGS } from '@/shared/lib/uxTokens'

/* ══════════════════════════════════════════════════════
   Helpers
   ══════════════════════════════════════════════════════ */
function hashHue(str) {
  return Math.abs((str || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360
}

const SKILL_COLORS = {
  'React': 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  'TypeScript': 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
  'JavaScript': 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]',
  'Node.js': 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-border)]',
  'Python': 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
  'Design': 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  'Figma': 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
  'Backend': 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
  'DevOps': 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]',
  'Frontend': 'bg-teal-500/10 text-teal-600 border-teal-500/20',
  'Management': 'bg-slate-500/10 text-slate-600 border-slate-500/20',
  'Database': 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  'Testing': 'bg-lime-500/10 text-lime-600 border-lime-500/20',
  'UI/UX': 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  'Mobile': 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]',
}

const AVAILABILITY = ['available', 'focus', 'busy', 'offline']

/* ══════════════════════════════════════════════════════
   Team Strength Radar — radar chart at top
   ══════════════════════════════════════════════════════ */
function TeamStrengthRadar({ members }) {
  const dimensions = ['Frontend', 'Backend', 'Design', 'DevOps', 'Management', 'Communication']

  const scores = useMemo(() => {
    const dims = {}
    dimensions.forEach(d => { dims[d] = 0 })
    members.forEach(m => {
      const skills = m.skills || []
      skills.forEach(s => {
        // Map skill to dimension
        const dim = dimensions.find(d => s === d || (d === 'Frontend' && ['React', 'TypeScript', 'JavaScript'].includes(s))
          || (d === 'Backend' && ['Node.js', 'Python', 'Database'].includes(s))
          || (d === 'Design' && ['Design', 'Figma', 'UI/UX'].includes(s))
          || (d === 'DevOps' && ['DevOps', 'Testing'].includes(s))
          || (d === 'Communication' && ['Management'].includes(s)))
        if (dim) dims[dim] = Math.min(100, dims[dim] + (100 / Math.max(members.length, 1)))
      })
    })
    // Ensure floor of 15
    dimensions.forEach(d => { dims[d] = Math.max(15, Math.round(dims[d])) })
    return dims
  }, [members])

  if (members.length === 0) return null

  const cx = 100, cy = 100, r = 70
  const angleSlice = (2 * Math.PI) / dimensions.length

  const getPoint = (i, value) => {
    const angle = angleSlice * i - Math.PI / 2
    const dist = (value / 100) * r
    return {
      x: cx + dist * Math.cos(angle),
      y: cy + dist * Math.sin(angle),
    }
  }

  const dataPoints = dimensions.map((_, i) => getPoint(i, scores[dimensions[i]]))
  const polygonPath = dataPoints.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <Icons.compass className="w-4 h-4 text-[var(--accent)]" />
        <Text className="text-[13px] font-semibold">Team Strength Radar</Text>
      </div>
      <div className="flex items-center gap-4">
        <svg viewBox="0 0 200 200" className="w-32 h-32 shrink-0">
          {/* Grid rings */}
          {[0.25, 0.5, 0.75, 1].map((scale) => (
            <circle key={scale} cx={cx} cy={cy} r={r * scale} fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" />
          ))}
          {/* Axes */}
          {dimensions.map((_, i) => {
            const p = getPoint(i, 100)
            return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="var(--border-subtle)" strokeWidth="0.5" />
          })}
          {/* Data polygon */}
          <motion.path
            d={polygonPath}
            fill="var(--accent-soft)"
            stroke="var(--accent)"
            strokeWidth="1.5"
            opacity="0.8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.8, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
          />
          {/* Data dots */}
          {dataPoints.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x} cy={p.y} r="3"
              fill="var(--accent)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.05 }}
            />
          ))}
        </svg>
        {/* Legend */}
        <div className="space-y-1.5 flex-1">
          {dimensions.map((dim) => (
            <div key={dim} className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">{dim}</span>
              <div className="flex items-center gap-1.5">
                <div className="h-1 w-12 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${scores[dim]}%` }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="h-full rounded-full bg-[var(--accent)]"
                  />
                </div>
                <span className="text-[10px] font-bold tabular-nums text-[var(--text-muted)] w-7 text-right">{scores[dim]}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Contribution Heatmap — 7-column mini heatmap
   ══════════════════════════════════════════════════════ */
function ContributionHeatmap({ username, tasks }) {
  const heatmap = useMemo(() => {
    const now = new Date()
    const cols = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const dateStr = d.toDateString()
      const count = tasks.filter(t => {
        if (t.assignedTo !== username) return false
        const u = t.updatedAt ? new Date(t.updatedAt) : null
        return u && u.toDateString() === dateStr
      }).length
      cols.push({ label: d.toLocaleDateString(undefined, { weekday: 'narrow' }), count })
    }
    return cols
  }, [username, tasks])

  const maxCount = Math.max(...heatmap.map(d => d.count), 1)

  return (
    <div className="flex gap-0.5 items-end">
      {heatmap.map((d, i) => {
        const intensity = d.count / maxCount
        const bg = d.count === 0
          ? 'bg-[var(--bg-subtle)]'
          : intensity >= 0.75 ? 'bg-emerald-500' : intensity >= 0.5 ? 'bg-emerald-400' : intensity >= 0.25 ? 'bg-emerald-300' : 'bg-emerald-200'
        return (
          <div key={i} className="flex flex-col items-center gap-0.5 group/heat" title={`${d.label}: ${d.count} tasks`}>
            <span className="text-[8px] font-bold tabular-nums text-[var(--text-muted)] opacity-0 group-hover/heat:opacity-100 transition-opacity">{d.count}</span>
            <div className={cn('w-3 h-4 rounded-sm transition-colors', bg)} />
            <span className="text-[8px] text-[var(--text-muted)]">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Workload Thermometer — vertical
   ══════════════════════════════════════════════════════ */
function WorkloadThermometer({ taskCount, maxWorkload }) {
  const pct = maxWorkload > 0 ? Math.min(100, Math.round((taskCount / maxWorkload) * 100)) : 0
  const isBusy = taskCount > 5
  const isMedium = taskCount > 3
  const color = isBusy ? '#ef4444' : isMedium ? '#f59e0b' : 'var(--accent)'

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="w-6 h-20 bg-[var(--bg-subtle)] rounded-full relative overflow-hidden">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${pct}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{ background: `linear-gradient(to top, ${color}, ${color}88)` }}
        />
        {/* Bulb */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 border-[var(--bg-subtle)]" style={{ background: color }} />
      </div>
      <span className={cn(
        'text-[10px] font-bold tabular-nums',
        isBusy ? 'text-[var(--danger)]' : isMedium ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'
      )}>{taskCount}</span>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Kudos Shoutout Dropdown
   ══════════════════════════════════════════════════════ */
const KUDOS_MESSAGES = [
  { emoji: '🌟', text: 'Great teamwork!' },
  { emoji: '🔥', text: 'Killing it!' },
  { emoji: '🚀', text: 'Above and beyond!' },
  { emoji: '💡', text: 'Problem solver!' },
  { emoji: '💪', text: 'Crushing it!' },
  { emoji: '🙌', text: 'Team player!' },
]

function KudosButton({ memberName }) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(null)

  const handleGive = (kudos) => {
    setSent(kudos)
    setOpen(false)
    setTimeout(() => setSent(null), 2500)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all',
          open
            ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
            : 'text-[var(--text-muted)] hover:text-[var(--warning)] hover:bg-[var(--warning-soft)]/50'
        )}
      >
        <Icons.award className="w-3 h-3" />
        Kudos
      </button>
      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -4 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-full mt-1 z-20 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl p-1.5 min-w-[180px]"
            >
              {KUDOS_MESSAGES.map((k) => (
                <button
                  key={k.text}
                  onClick={() => handleGive(k)}
                  className="w-full flex items-center gap-2 px-2.5 py-2 rounded-md text-[12px] text-[var(--text-primary)] hover:bg-[var(--accent-soft)] transition-colors text-left"
                >
                  <span className="text-base">{k.emoji}</span>
                  <span className="font-medium">{k.text}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
      {/* Kudos sent animation */}
      <AnimatePresence>
        {sent && (
          <motion.div
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ opacity: [0, 1, 1, 0], y: -40, scale: [0.5, 1.2, 1, 0.8] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
            className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-lg whitespace-nowrap z-30 pointer-events-none"
          >
            {sent.emoji} {sent.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Peer Comparison Modal
   ══════════════════════════════════════════════════════ */
function PeerComparisonModal({ members, memberTaskStats, workload, onClose }) {
  const [selected, setSelected] = useState([])

  const toggleMember = (username) => {
    setSelected(prev =>
      prev.includes(username)
        ? prev.filter(u => u !== username)
        : prev.length < 2 ? [...prev, username] : [prev[1], username]
    )
  }

  const compareData = selected.length === 2
    ? selected.map(username => ({
      username,
      stats: memberTaskStats[username] || { total: 0, done: 0, active: 0, review: 0 },
      workload: workload[username] || 0,
      skills: (members.find(m => m.username === username)?.skills) || [],
    }))
    : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        onClick={e => e.stopPropagation()}
        className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2">
            <Icons.scale className="w-4 h-4 text-[var(--accent)]" />
            <Text className="text-[14px] font-semibold">Peer Comparison</Text>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-[var(--bg-subtle)] transition-colors">
            <Icons.x className="w-4 h-4 text-[var(--text-muted)]" />
          </button>
        </div>

        {/* Member selection */}
        <div className="p-4">
          <Text size="xs" variant="muted" className="mb-2">Select 2 members to compare:</Text>
          <div className="flex flex-wrap gap-2 mb-4">
            {members.map(m => (
              <button
                key={m.id}
                onClick={() => toggleMember(m.username)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border',
                  selected.includes(m.username)
                    ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]'
                    : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)] hover:border-[var(--border-subtle)]'
                )}
              >
                {m.username}
              </button>
            ))}
          </div>

          {/* Comparison table */}
          {compareData ? (
            <div className="grid grid-cols-3 gap-2">
              {/* Header */}
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider py-1">Metric</div>
              {compareData.map((d, i) => (
                <div key={i} className="text-center">
                  <div className="w-8 h-8 rounded-xl mx-auto flex items-center justify-center text-[10px] font-bold text-white"
                    style={{ background: `linear-gradient(135deg, hsl(${hashHue(d.username)} 70% 55%), hsl(${(hashHue(d.username) + 35) % 360} 65% 40%))` }}>
                    {d.username.charAt(0)}
                  </div>
                  <Text size="xs" className="font-semibold mt-1">{d.username}</Text>
                </div>
              ))}

              {[
                { label: 'Active', key: 'active', color: 'text-[var(--text-primary)]' },
                { label: 'Review', key: 'review', color: 'text-[var(--accent)]' },
                { label: 'Completed', key: 'done', color: 'text-[var(--success)]' },
                { label: 'Workload', key: 'workload', color: 'text-[var(--text-primary)]' },
              ].map(row => (
                <React.Fragment key={row.key}>
                  <div className="text-[11px] font-medium text-[var(--text-secondary)] py-2 border-t border-[var(--border-subtle)]/50">
                    {row.label}
                  </div>
                  {compareData.map((d, i) => (
                    <div key={i} className={cn('text-center py-2 border-t border-[var(--border-subtle)]/50 text-[13px] font-bold tabular-nums', row.color)}>
                      {d.stats[row.key] !== undefined ? d.stats[row.key] : d[row.key]}
                    </div>
                  ))}
                </React.Fragment>
              ))}

              {/* Skills */}
              <div className="text-[11px] font-medium text-[var(--text-secondary)] py-2 border-t border-[var(--border-subtle)]/50">Skills</div>
              {compareData.map((d, i) => (
                <div key={i} className="flex flex-wrap gap-0.5 justify-center py-2 border-t border-[var(--border-subtle)]/50">
                  {d.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[8px] font-medium px-1 py-0.5 rounded border bg-[var(--bg-subtle)] text-[var(--text-muted)]">
                      {s}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-[var(--text-muted)]">
              <Icons.users className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <Text size="xs">Select exactly 2 members to compare</Text>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   MembersTab — enhanced member cards with all new features
   ══════════════════════════════════════════════════════ */
export function MembersTab({ team, workload, teamTasks, hasProjectIdOnTasks, hasTaskTimestamps, canManage, onManageMembers }) {
  const [sortBy, setSortBy] = useState('name')
  const [showCompare, setShowCompare] = useState(false)
  const members = team?.members || []

  const maxWorkload = useMemo(() => {
    const vals = Object.values(workload)
    return vals.length > 0 ? Math.max(...vals, 1) : 1
  }, [workload])

  const sortedMembers = useMemo(() => {
    const sorted = [...members]
    if (sortBy === 'workload') sorted.sort((a, b) => (workload[b.username] || 0) - (workload[a.username] || 0))
    else if (sortBy === 'availability') {
      const order = { available: 0, focus: 1, busy: 2, offline: 3 }
      sorted.sort((a, b) => (order[a.status || 'offline'] || 0) - (order[b.status || 'offline'] || 0))
    }
    else sorted.sort((a, b) => (a.username || '').localeCompare(b.username || ''))
    return sorted
  }, [members, sortBy, workload])

  // Per-member task breakdown
  const memberTaskStats = useMemo(() => {
    const stats = {}
    teamTasks.forEach(t => {
      if (!t.assignedTo || t.archived) return
      if (!stats[t.assignedTo]) stats[t.assignedTo] = { total: 0, done: 0, active: 0, review: 0 }
      stats[t.assignedTo].total++
      if (t.status === 'Done' || t.status === 'COMPLETED') stats[t.assignedTo].done++
      else if (String(t.status || '').toUpperCase().includes('REVIEW')) stats[t.assignedTo].review++
      else stats[t.assignedTo].active++
    })
    return stats
  }, [teamTasks])

  /* ── Empty State ── */
  if (members.length === 0) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
        <ImmersiveEmptyState icon={Users} title="No members yet" description="Add members to start collaborating." action={canManage ? <Button onClick={onManageMembers}><Icons.users className="w-4 h-4 mr-1.5" /> Manage Roster</Button> : null} />
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5 space-y-4">
      {/* Team Strength Radar */}
      <TeamStrengthRadar members={members} />

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-0.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg p-1">
          {[
            { key: 'name', label: 'A-Z' },
            { key: 'workload', label: 'Busiest' },
            { key: 'availability', label: 'Available' },
          ].map(k => (
            <button
              key={k.key}
              onClick={() => setSortBy(k.key)}
              className={cn(
                'px-3 py-1 rounded-md text-[11px] font-medium transition-all',
                sortBy === k.key ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {k.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowCompare(true)} className="gap-1.5 text-[12px] h-8">
            <Icons.scale className="w-3.5 h-3.5" /> Compare
          </Button>
          {canManage && (
            <Button variant="outline" size="sm" onClick={onManageMembers} className="gap-1.5 text-[12px] h-8">
              <Icons.settings className="w-3.5 h-3.5" /> Manage
            </Button>
          )}
        </div>
      </div>

      {/* Member Grid */}
      <motion.div
        initial="hidden"
        animate="show"
        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.04 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sortedMembers.map(m => {
          const taskCount = workload[m.username] || 0
          const isBusy = taskCount > 5
          const isMedium = taskCount > 3
          const textColor = isBusy ? 'text-[var(--danger)]' : isMedium ? 'text-[var(--warning)]' : 'text-[var(--text-muted)]'

          const stats = memberTaskStats[m.username] || { total: 0, done: 0, active: 0, review: 0 }
          const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0
          const hue = hashHue(m.username)
          const skills = m.skills || []
          const availability = m.status || 'offline'

          const availConfig = {
            available: { color: 'bg-emerald-400', label: 'Available', text: 'text-[var(--success)]' },
            focus: { color: 'bg-amber-400', label: 'Focusing', text: 'text-[var(--warning)]' },
            busy: { color: 'bg-red-400', label: 'Busy', text: 'text-[var(--danger)]' },
            offline: { color: 'bg-slate-300', label: 'Offline', text: 'text-slate-500' },
          }
          const avail = availConfig[availability] || availConfig.offline

          return (
            <motion.div
              key={m.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } },
              }}
              className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200"
            >
              {/* Identity + Availability */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shrink-0 shadow-sm border border-white/10"
                      style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 35) % 360} 65% 40%))` }}
                    >
                      {m.username?.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={cn('absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-[var(--bg-card)]', avail.color)}
                      title={avail.label}
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-[14px] font-semibold text-[var(--text-primary)] truncate">{m.username}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Text size="xs" variant="muted" className="capitalize">{m.orgRole?.toLowerCase() || 'member'}</Text>
                      <span className={cn('text-[9px] font-medium', avail.text)}>{avail.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Matrix Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {skills.map(skill => (
                  <span
                    key={skill}
                    className={cn(
                      'text-[9px] font-semibold px-1.5 py-0.5 rounded-md border',
                      SKILL_COLORS[skill] || 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-transparent'
                    )}
                  >
                    {skill}
                  </span>
                ))}
              </div>

              {/* Task breakdown */}
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                  <div className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{stats.active}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase">Active</div>
                </div>
                <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                  <div className="text-sm font-bold text-[var(--accent)] tabular-nums">{stats.review}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase">Review</div>
                </div>
                <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
                  <div className="text-sm font-bold text-[var(--success)] tabular-nums">{stats.done}</div>
                  <div className="text-[9px] text-[var(--text-muted)] uppercase">Done</div>
                </div>
              </div>

              {/* Workload Thermometer + Stats */}
              <div className="flex items-center gap-4 pt-3 border-t border-[var(--border-subtle)]/50">
                <div className="flex flex-col items-center">
                  <Text size="xs" className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Load</Text>
                  <WorkloadThermometer taskCount={taskCount} maxWorkload={maxWorkload} />
                </div>

                {/* Contribution Heatmap */}
                <div className="flex-1 min-w-0">
                  <Text size="xs" className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] mb-1">Activity</Text>
                  <ContributionHeatmap username={m.username} tasks={teamTasks} />
                </div>
              </div>

              {/* Completion + Kudos */}
              <div className="flex items-center justify-between mt-3 pt-2 border-t border-[var(--border-subtle)]/30">
                <div className="flex items-center gap-1.5">
                  <Text size="xs" className={cn('font-bold tabular-nums', textColor)}>{taskCount} task{taskCount === 1 ? '' : 's'}</Text>
                  <span className="text-[10px] text-[var(--text-muted)]">·</span>
                  <Text size="xs" className="text-[var(--text-muted)] tabular-nums">{completionRate}% done</Text>
                </div>
                <KudosButton memberName={m.username} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Peer Comparison Modal */}
      <AnimatePresence>
        {showCompare && (
          <PeerComparisonModal
            members={members}
            memberTaskStats={memberTaskStats}
            workload={workload}
            onClose={() => setShowCompare(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

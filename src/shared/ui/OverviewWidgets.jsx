import React, { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { SPRINGS } from '@/shared/lib/uxTokens'
import { normalizePriority } from '@/shared/lib/priority'

export function formatTimeAgo(dateString) {
  if (!dateString) return null
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'
  const diff = Math.floor((Date.now() - date) / 1000)
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function hashHue(str) {
  return Math.abs((str || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360
}

/* ══════════════════════════════════════════════════════
   Sprint Progress Ring — SVG donut with animated arc
   ══════════════════════════════════════════════════════ */
export function SprintProgressRing({ tasks }) {
  const now = new Date()
  const done = tasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length
  const inProgress = tasks.filter(t => {
    const s = String(t.status || '').toUpperCase()
    return s === 'IN_PROGRESS' || s === 'REVIEW' || s === 'DOING'
  }).length
  const total = done + inProgress || 1
  const progress = Math.round((done / total) * 100) || 0
  const radius = 38
  const strokeW = 6
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (progress / 100) * circumference

  // Days remaining in current week (Sunday = end of week)
  const daysLeft = 7 - now.getDay() || 7
  const sprintName = `Week ${Math.ceil((now.getDate() + (new Date(now.getFullYear(), now.getMonth(), 1).getDay())) / 7)}`

  return (
    <div className="flex flex-col items-center justify-center py-1">
      <div className="relative w-full max-w-[96px] aspect-square flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} stroke="var(--bg-subtle)" strokeWidth={strokeW} fill="none" />
          <motion.circle
            cx="44" cy="44" r={radius}
            stroke="var(--accent)" strokeWidth={strokeW} fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums leading-none">{progress}%</span>
          <span className="text-[10px] font-medium text-[var(--text-muted)] mt-0.5">complete</span>
        </div>
      </div>
      <div className="mt-2 text-center">
        <Text size="xs" className="font-semibold text-[var(--text-primary)]">{sprintName}</Text>
        <Text size="xs" variant="muted" className="mt-0.5">{daysLeft} day{daysLeft !== 1 ? 's' : ''} remaining</Text>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Bottleneck Detector — highlights stages w/ pile-up
   ══════════════════════════════════════════════════════ */
export function BottleneckDetector({ tasks }) {
  const stages = useMemo(() => {
    const map = { 'Review': 0, 'In Progress': 0, 'To Do': 0, 'Blocked': 0 }
    tasks.forEach(t => {
      if (t.status === 'Done' || t.status === 'COMPLETED' || t.archived) return
      const s = String(t.status || '')
      if (s.toUpperCase().includes('REVIEW')) map['Review']++
      else if (s.toUpperCase().includes('IN_PROGRESS') || s.toUpperCase().includes('DOING')) map['In Progress']++
      else if (s.toUpperCase().includes('BLOCKED')) map['Blocked']++
      else map['To Do']++
    })
    return Object.entries(map)
      .filter(([, c]) => c > 0)
      .sort((a, b) => b[1] - a[1])
  }, [tasks])

  if (stages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <Icons.checkCircle2 className="w-6 h-6 text-[var(--success)] mb-2 opacity-70" />
        <Text size="xs" variant="muted">No bottlenecks detected — flow is smooth.</Text>
      </div>
    )
  }

  const maxCount = stages[0]?.[1] || 1
  const threshold = maxCount > 4

  return (
    <div className="space-y-3 py-1">
      {stages.map(([stage, count]) => {
        const pct = Math.round((count / maxCount) * 100)
        const isBottleneck = count === maxCount && threshold
        const stageColors = {
          'Review': isBottleneck ? 'bg-[var(--accent)]' : 'bg-[var(--accent)]/30',
          'In Progress': isBottleneck ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]/60',
          'To Do': isBottleneck ? 'bg-[var(--text-primary)]' : 'bg-[var(--text-muted)]',
          'Blocked': 'bg-[var(--danger)]',
        }
        const textColors = {
          'Review': 'text-[var(--accent)]',
          'In Progress': 'text-[var(--accent)]',
          'To Do': 'text-slate-600',
          'Blocked': 'text-[var(--danger)]',
        }

        return (
          <div key={stage} className="group">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <span className={cn('text-[11px] font-semibold', textColors[stage] || 'text-[var(--text-secondary)]')}>
                  {stage}
                </span>
                {isBottleneck && (
                  <motion.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-0.5 text-[10px] font-bold text-[var(--warning)]"
                  >
                    <Icons.alertTriangle className="w-2.5 h-2.5" />
                    Bottleneck
                  </motion.span>
                )}
              </div>
              <span className="text-[11px] font-bold tabular-nums text-[var(--text-primary)]">{count}</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className={cn('h-full rounded-full', stageColors[stage] || 'bg-[var(--accent)]')}
              />
            </div>
          </div>
        )
      })}
      {threshold && (
        <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-[var(--border-subtle)]/50">
          <Icons.info className="w-3 h-3 text-[var(--warning)]" />
          <Text size="xs" className="text-[var(--warning)] font-medium">
            {stages[0][0]} stage has {stages[0][1]} items — consider redistributing.
          </Text>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Risk Radar — mini scores for key risk dimensions
   ══════════════════════════════════════════════════════ */
export function RiskRadar({ tasks }) {
  const risks = useMemo(() => {
    const now = new Date()
    const overdue = tasks.filter(t => {
      if (!t.dueDate || t.status === 'Done' || t.status === 'COMPLETED' || t.archived) return false
      return new Date(t.dueDate) < now
    }).length
    const totalActive = tasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED' && !t.archived).length
    const unassigned = tasks.filter(t => (!t.assignedTo || t.assignedTo === 'Unassigned') && t.status !== 'Done' && !t.archived).length

    const deadlineRisk = totalActive > 0 ? Math.min(100, Math.round((overdue / totalActive) * 100 + (overdue > 0 ? 30 : 0))) : 0
    const workloadImbalance = Math.min(100, Math.round(unassigned * 15 + (totalActive > 10 ? 25 : 0)))
    const scopeCreep = Math.min(100, Math.round(
      (tasks.filter(t => !t.archived && (t.createdAt && new Date(t.createdAt) > new Date(now - 7 * 24 * 3600 * 1000))).length) * 8
    ))

    return [
      { label: 'Deadline Risk', score: deadlineRisk, icon: Icons.calendar, color: deadlineRisk >= 70 ? 'var(--danger)' : deadlineRisk >= 40 ? 'var(--warning)' : 'var(--success)' },
      { label: 'Workload Imbalance', score: workloadImbalance, icon: Icons.scale, color: workloadImbalance >= 70 ? 'var(--danger)' : workloadImbalance >= 40 ? 'var(--warning)' : 'var(--success)' },
      { label: 'Scope Creep', score: scopeCreep, icon: Icons.trendingUp, color: scopeCreep >= 70 ? 'var(--danger)' : scopeCreep >= 40 ? 'var(--warning)' : 'var(--success)' },
    ]
  }, [tasks])

  return (
    <div className="space-y-4 py-1">
      {risks.map((risk) => {
        const level = risk.score >= 70 ? 'High' : risk.score >= 40 ? 'Medium' : 'Low'
        const levelColor = risk.score >= 70 ? 'text-[var(--danger)]' : risk.score >= 40 ? 'text-[var(--warning)]' : 'text-[var(--success)]'

        return (
          <div key={risk.label} className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <risk.icon className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="text-[11px] font-medium text-[var(--text-secondary)]">{risk.label}</span>
              </div>
              <span className={cn('text-[10px] font-bold uppercase tracking-wider', levelColor)}>{level}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${risk.score}%` }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: risk.color }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   AI Weekly Digest — mock auto-generated summary card
   ══════════════════════════════════════════════════════ */
export function AiWeeklyDigest({ tasks, doneTasks }) {
  const [collapsed, setCollapsed] = useState(false)

  const digest = useMemo(() => {
    const now = new Date()
    const weekAgo = new Date(now - 7 * 24 * 3600 * 1000)
    const thisWeekDone = tasks.filter(t => {
      if (t.status !== 'Done' && t.status !== 'COMPLETED') return false
      const d = t.updatedAt ? new Date(t.updatedAt) : null
      return d && d >= weekAgo
    }).length
    const thisWeekNew = tasks.filter(t => {
      const d = t.createdAt ? new Date(t.createdAt) : null
      return d && d >= weekAgo
    }).length
    const reviewCount = tasks.filter(t => {
      const s = String(t.status || '').toUpperCase()
      return s.includes('REVIEW') && !t.archived
    }).length
    const topContributor = (() => {
      const counts = {}
      tasks.forEach(t => {
        if (t.assignedTo && t.status === 'Done') counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1
      })
      const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1])
      return sorted[0]?.[0] || 'the team'
    })()

    return `This week your team completed ${thisWeekDone || 0} task${thisWeekDone !== 1 ? 's' : ''}, opened ${thisWeekNew || 0} new. ${topContributor} had the highest throughput. ${reviewCount > 3 ? `The Review column has ${reviewCount} items — it's becoming a bottleneck.` : 'Flow looks healthy across all stages.'}`
  }, [tasks])

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={SPRINGS.normal}
      className="bg-gradient-to-r from-[var(--accent-soft)]/30 via-[var(--accent-soft)]/20 to-transparent border border-[var(--accent-border)]/40 rounded-xl overflow-hidden"
    >
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--accent-soft)]/20 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center">
            <Icons.sparkles className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div className="text-left">
            <Heading level={4} className="text-[13px] font-semibold">AI Weekly Digest</Heading>
            <Text size="xs" variant="muted">Auto-generated team summary</Text>
          </div>
        </div>
        <Icons.chevronDown className={cn('w-4 h-4 text-[var(--text-muted)] transition-transform', collapsed && '-rotate-90')} />
      </button>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <Text size="sm" className="text-[var(--text-secondary)] leading-relaxed italic border-l-2 border-[var(--accent)] pl-3 py-1">
                "{digest}"
              </Text>
              <div className="flex items-center gap-1.5 mt-2">
                <Badge variant="secondary" size="xs" className="text-[9px] flex items-center gap-1">
                  <Icons.sparkles className="w-2 h-2" /> AI Generated
                </Badge>
                <Badge variant="outline" size="xs" className="text-[9px]">Experimental</Badge>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

/* ══════════════════════════════════════════════════════
   Recent Wins — celebration section with animation
   ══════════════════════════════════════════════════════ */
export function RecentWins({ tasks }) {
  const [confettiIds, setConfettiIds] = useState([])

  const wins = useMemo(() => {
    return tasks
      .filter(t => t.status === 'Done' || t.status === 'COMPLETED')
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0))
      .slice(0, 5)
  }, [tasks])

  const triggerConfetti = (id) => {
    setConfettiIds(prev => [...prev, id])
    setTimeout(() => setConfettiIds(prev => prev.filter(i => i !== id)), 1500)
  }

  if (wins.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <Icons.award className="w-6 h-6 text-[var(--text-muted)] mb-2 opacity-50" />
        <Text size="xs" variant="muted">No wins yet — ship that first task!</Text>
      </div>
    )
  }

  return (
    <div className="space-y-2 py-1">
      {wins.map((task, i) => (
        <motion.div
          key={task.id}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          whileHover={{ scale: 1.02 }}
          onClick={() => triggerConfetti(task.id)}
          className="relative flex items-center gap-2.5 p-2 rounded-lg bg-[var(--bg-subtle)] cursor-pointer hover:bg-emerald-500/5 transition-colors overflow-hidden"
        >
          {/* Confetti burst */}
          <AnimatePresence>
            {confettiIds.includes(task.id) && (
              <>
                {Array.from({ length: 8 }).map((_, ci) => (
                  <motion.div
                    key={ci}
                    initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                    animate={{
                      opacity: 0,
                      scale: [0, 1.2, 0],
                      x: (ci % 2 === 0 ? 1 : -1) * (20 + ci * 5),
                      y: (ci < 4 ? -1 : 1) * (15 + ci * 4),
                    }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-full z-10"
                    style={{
                      background: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#06b6d4'][ci % 6],
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>
          <div className="w-6 h-6 rounded-md bg-[var(--success-soft)] flex items-center justify-center shrink-0">
            <Icons.checkCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
          </div>
          <div className="min-w-0 flex-1">
            <Text size="xs" className="font-medium text-[var(--text-primary)] truncate">{task.title}</Text>
            <Text size="xs" variant="muted" className="text-[10px]">{task.assignedTo || 'Team'} · {formatTimeAgo(task.updatedAt || task.createdAt)}</Text>
          </div>
          <Icons.award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        </motion.div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Team Velocity Sparkline — tasks/day last 7 days
   ══════════════════════════════════════════════════════ */
export function VelocitySparkline({ tasks }) {
  const velocity = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dayStr = d.toLocaleDateString(undefined, { weekday: 'short' })
      const dateStr = d.toDateString()
      const count = tasks.filter(t => {
        if (t.status !== 'Done' && t.status !== 'COMPLETED') return false
        const u = t.updatedAt ? new Date(t.updatedAt) : null
        return u && u.toDateString() === dateStr
      }).length
      days.push({ label: dayStr, count })
    }
    return days
  }, [tasks])

  const maxVal = Math.max(...velocity.map(d => d.count), 1)
  const total = velocity.reduce((s, d) => s + d.count, 0)
  const avg = Math.round((total / 7) * 10) / 10
  const trend = velocity[5]?.count && velocity[6]?.count
    ? velocity[6].count >= velocity[5].count ? 'up' : 'down'
    : 'stable'

  // Generate SVG polyline points
  const w = 180, h = 48, padX = 10, padY = 8
  const chartW = w - padX * 2
  const chartH = h - padY * 2
  const points = velocity.map((d, i) => {
    const x = padX + (i / (velocity.length - 1)) * chartW
    const y = padY + chartH - (d.count / maxVal) * chartH
    return `${x},${y}`
  }).join(' ')

  return (
    <div className="py-1">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-extrabold text-[var(--text-primary)] tabular-nums">{total}</span>
          <Text size="xs" variant="muted" className="mt-1">tasks this week</Text>
        </div>
        <div className={cn(
          'flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md',
          trend === 'up' ? 'text-[var(--success)] bg-[var(--success-soft)]' : trend === 'down' ? 'text-[var(--warning)] bg-[var(--warning-soft)]' : 'text-[var(--text-muted)] bg-[var(--bg-subtle)]'
        )}>
          <Icons.trendingUp className={cn('w-3 h-3', trend === 'down' && 'rotate-180')} />
          {avg}/day
        </div>
      </div>

      {/* SVG sparkline */}
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-12" preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 0.5, 1].map((ratio) => {
          const y = padY + chartH * (1 - ratio)
          return (
            <line key={ratio} x1={padX} y1={y} x2={w - padX} y2={y}
              stroke="var(--border-subtle)" strokeWidth="0.5" strokeDasharray="2 2" />
          )
        })}
        {/* Area fill */}
        <motion.path
          d={`M${points} L${w - padX},${padY + chartH} L${padX},${padY + chartH} Z`}
          fill="var(--accent-soft)"
          opacity="0.3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 0.8 }}
        />
        {/* Line */}
        <motion.polyline
          points={points}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        />
        {/* Dots */}
        {velocity.map((d, i) => {
          const [x, y] = points.split(' ')[i].split(',')
          return (
            <motion.circle
              key={i}
              cx={x} cy={y} r="2.5"
              fill="var(--accent)"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 + i * 0.05, duration: 0.2 }}
            />
          )
        })}
      </svg>

      {/* Day labels */}
      <div className="flex justify-between mt-1">
        {velocity.map((d, i) => (
          <div key={i} className="flex flex-col items-center min-w-0">
            <span className="text-[9px] font-bold tabular-nums text-[var(--text-primary)]">{d.count}</span>
            <span className="text-[9px] text-[var(--text-muted)]">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Health Gauge (compact, analytic) — KEPT from original
   ══════════════════════════════════════════════════════ */
export function HealthGauge({ score }) {
  const radius = 28
  const strokeWidth = 5
  const circumference = 2 * Math.PI * radius
  const progress = Math.min(100, Math.max(0, score))
  const offset = circumference - (progress / 100) * circumference
  const color = score >= 80 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--danger)'
  return (
    <div className="relative flex items-center justify-center w-16 h-16">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
        <circle cx="32" cy="32" r={radius} stroke="var(--bg-subtle)" strokeWidth={strokeWidth} fill="none" />
        <motion.circle cx="32" cy="32" r={radius} stroke={color} strokeWidth={strokeWidth} fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          strokeLinecap="round"
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-extrabold text-[var(--text-primary)] tabular-nums">{score}</span>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Workload Distribution Bar — KEPT from original
   ══════════════════════════════════════════════════════ */
export function WorkloadDistribution({ workload }) {
  const entries = Object.entries(workload).filter(([, c]) => c > 0).sort((a, b) => b[1] - a[1])
  const maxVal = entries.length > 0 ? Math.max(...entries.map(([, c]) => c)) : 1
  const idleCount = Object.values(workload).filter(c => c === 0).length

  if (entries.length === 0) {
    return <Text size="xs" variant="muted" className="italic py-3">No active task assignments.</Text>
  }

  return (
    <div className="space-y-2.5">
      {entries.slice(0, 5).map(([name, count]) => {
        const hue = hashHue(name)
        const pct = Math.round((count / maxVal) * 100)
        return (
          <div key={name} className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-bold text-white shrink-0"
              style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 35) % 360} 60% 40%))` }}>
              {name.charAt(0).toUpperCase()}
            </div>
            <span className="text-[11px] font-medium text-[var(--text-secondary)] truncate w-20 shrink-0">{name}</span>
            <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn('h-full rounded-full', count > 5 ? 'bg-red-500' : count > 3 ? 'bg-amber-500' : 'bg-[var(--accent)]')}
              />
            </div>
            <span className="text-[11px] font-bold tabular-nums text-[var(--text-primary)] w-6 text-right shrink-0">{count}</span>
          </div>
        )
      })}
      {idleCount > 0 && (
        <div className="flex items-center gap-2 pt-1.5 mt-1.5 border-t border-[var(--border-subtle)]">
          <Icons.userX className="w-3 h-3 text-[var(--text-muted)]" />
          <Text size="xs" variant="muted">{idleCount} member{idleCount === 1 ? '' : 's'} with no active tasks</Text>
        </div>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Project Progress Mini-List — KEPT from original
   ══════════════════════════════════════════════════════ */
export function ProjectProgress({ projects, tasksForProject }) {
  if (projects.length === 0) {
    return <Text size="xs" variant="muted" className="italic py-3">No projects linked to this team.</Text>
  }
  return (
    <div className="space-y-2.5">
      {projects.slice(0, 4).map(p => {
        const pTasks = tasksForProject(p.id)
        const done = pTasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length
        const total = pTasks.length
        const pct = total > 0 ? Math.round((done / total) * 100) : 0
        const isActive = !['completed', 'done', 'archived', 'cancelled', 'closed'].includes((p.status || '').toLowerCase())
        return (
          <div key={p.id} className="group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[12px] font-medium text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">{p.name}</span>
              <span className="text-[10px] font-semibold tabular-nums text-[var(--text-muted)]">{done}/{total}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className={cn('h-full rounded-full', pct >= 75 ? 'bg-emerald-500' : pct >= 40 ? 'bg-[var(--accent)]' : 'bg-amber-500')}
              />
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant={isActive ? 'primary' : 'default'} size="xs" className="text-[9px]">{p.status || 'Active'}</Badge>
              {p.teamLeadId && <Text size="xs" className="text-[var(--text-muted)]">Lead: @{p.teamLeadId}</Text>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   Upcoming Deadlines — KEPT from original
   ══════════════════════════════════════════════════════ */
export function UpcomingDeadlines({ tasks }) {
  const upcoming = useMemo(() => {
    return tasks
      .filter(t => t.dueDate && t.status !== 'Done' && t.status !== 'COMPLETED' && !t.archived)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5)
  }, [tasks])

  if (upcoming.length === 0) {
    return <Text size="xs" variant="muted" className="italic py-3">No upcoming deadlines.</Text>
  }

  const now = new Date()

  return (
    <div className="space-y-2">
      {upcoming.map(task => {
        const due = new Date(task.dueDate)
        const isOverdue = due < now
        const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24))
        const priority = normalizePriority(task.priority)
        const priColors = { URGENT: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-500', LOW: 'bg-blue-500' }

        return (
          <div key={task.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors">
            <div className={cn('w-1 h-6 rounded-full shrink-0', isOverdue ? 'bg-red-500' : daysLeft <= 2 ? 'bg-amber-500' : 'bg-[var(--accent)]')} />
            <span className="text-[12px] font-medium text-[var(--text-primary)] truncate flex-1">{task.title}</span>
            <span className={cn(
              'text-[10px] font-semibold tabular-nums shrink-0 px-1.5 py-0.5 rounded-md',
              isOverdue ? 'bg-[var(--danger-soft)] text-[var(--danger)]' : daysLeft <= 2 ? 'bg-[var(--warning-soft)] text-[var(--warning)]' : 'text-[var(--text-muted)] bg-[var(--bg-subtle)]'
            )}>
              {isOverdue ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Today' : daysLeft === 1 ? '1d' : `${daysLeft}d`}
            </span>
            <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', priColors[priority] || 'bg-gray-400')} />
          </div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   OverviewTab — "Pulse" analytical dashboard
   Concept renamed to Pulse; export name kept as OverviewTab
   ══════════════════════════════════════════════════════ */

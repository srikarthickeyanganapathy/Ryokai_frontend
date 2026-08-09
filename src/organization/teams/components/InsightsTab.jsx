import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { TrendingUp, TrendingDown, Download, Clock, Zap, Sparkles, Target, ChevronDown, Calendar, BarChart3, Gauge, GitBranch, Award, ArrowUpRight, AlertCircle, Users } from '@/shared/ui/Icons'

/* ══════════════════════════════════════════════════════
   Sub-components (reused from original)
   ══════════════════════════════════════════════════════ */

/* ── Status distribution stacked bar ── */
function StatusStackedBar({ breakdown, total }) {
  if (total === 0) return null
  const segments = [
    { key: 'todo', label: 'To Do', count: breakdown.todo, color: 'bg-slate-400' },
    { key: 'inProgress', label: 'In Progress', count: breakdown.inProgress, color: 'bg-blue-400' },
    { key: 'review', label: 'In Review', count: breakdown.review, color: 'bg-purple-400' },
    { key: 'done', label: 'Done', count: breakdown.done, color: 'bg-emerald-400' },
  ].filter(s => s.count > 0)

  return (
    <div>
      <div className="h-3 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden flex">
        {segments.map((seg, i) => (
          <motion.div
            key={seg.key}
            initial={{ width: 0 }}
            animate={{ width: `${(seg.count / total) * 100}%` }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className={cn('h-full', seg.color)}
            title={`${seg.label}: ${seg.count}`}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-3 mt-2.5 text-[10px]">
        {segments.map(seg => (
          <div key={seg.key} className="flex items-center gap-1">
            <span className={cn('w-2 h-2 rounded-full', seg.color)} />
            <span className="text-[var(--text-muted)]">{seg.label}</span>
            <span className="font-semibold text-[var(--text-primary)] tabular-nums">{seg.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ── Priority Breakdown Bars ── */
function PriorityBreakdown({ tasks }) {
  const data = useMemo(() => {
    const counts = tasks.reduce((acc, t) => {
      if (t.status === 'Done' || t.archived) return acc
      const p = normalizePriority(t.priority) || 'Medium'
      acc[p] = (acc[p] || 0) + 1
      return acc
    }, {})
    const order = ['Urgent', 'High', 'Medium', 'Low'].filter(p => counts[p])
    const max = order.length > 0 ? Math.max(...order.map(p => counts[p])) : 1
    return order.map(p => ({ name: p, count: counts[p], pct: Math.round((counts[p] / max) * 100) }))
  }, [tasks])

  if (data.length === 0) {
    return <Text size="xs" variant="muted" className="italic py-3">No active tasks to analyze.</Text>
  }

  const colors = {
    Urgent: { bar: 'bg-red-500', text: 'text-[var(--danger)]' },
    High: { bar: 'bg-orange-500', text: 'text-[var(--warning)]' },
    Medium: { bar: 'bg-yellow-500', text: 'text-[var(--warning)]' },
    Low: { bar: 'bg-blue-500', text: 'text-[var(--accent)]' },
  }

  return (
    <div className="space-y-3">
      {data.map(p => {
        const c = colors[p.name] || colors.Medium
        return (
          <div key={p.name}>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className={cn('font-semibold uppercase tracking-wider', c.text)}>{p.name}</span>
              <span className="text-[var(--text-muted)] tabular-nums">{p.count}</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${p.pct}%` }} transition={{ duration: 0.5, ease: 'easeOut' }} className={cn('h-full rounded-full', c.bar)} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ── Mini Sparkline SVG ── */
function Sparkline({ data, color = 'var(--accent)', width = 80, height = 28 }) {
  if (!data || data.length < 2) return null
  const max = Math.max(...data, 1)
  const min = Math.min(...data, 0)
  const range = max - min || 1

  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((v - min) / range) * (height - 4) - 2
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `0,${height} ${points} ${width},${height}`

  return (
    <svg width={width} height={height} className="shrink-0" viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`spark-${color.replace(/[^a-zA-Z0-9]/g, '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={areaPoints} fill={`url(#spark-${color.replace(/[^a-zA-Z0-9]/g, '')})`} />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ── Burndown / Burnup Chart ── */
function BurndownBurnupChart({ tasks, dateRange }) {
  const [mode, setMode] = useState('burndown')

  const chartData = useMemo(() => {
    const now = new Date()
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === 'quarter' ? 90 : 14

    // Compute actual burndown from task completion timestamps
    const completedTasks = tasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED')
    const completionsByDay = {}
    const startDate = new Date(now)
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    completedTasks.forEach(t => {
      const completedAt = t.completedAt || t.updatedAt
      if (!completedAt) return
      const d = new Date(completedAt)
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      completionsByDay[key] = (completionsByDay[key] || 0) + 1
    })

    const result = []
    const total = tasks.length
    let completed = 0

    for (let i = 0; i <= days; i++) {
      const d = new Date(now)
      d.setDate(d.getDate() - (days - i))
      const key = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
      completed += (completionsByDay[key] || 0)

      result.push({
        date: key,
        remaining: total - completed,
        completed,
        total,
        ideal: total - (total / days) * i,
      })
    }
    return result
  }, [tasks, dateRange])

  const width = 320
  const height = 120
  const pad = { top: 10, right: 10, bottom: 20, left: 30 }
  const chartW = width - pad.left - pad.right
  const chartH = height - pad.top - pad.bottom

  const maxVal = Math.max(...chartData.map(d => mode === 'burndown' ? d.remaining : d.completed), 1)
  const scaleX = chartW / Math.max(chartData.length - 1, 1)
  const scaleY = chartH / maxVal

  const linePath = chartData.map((d, i) => {
    const x = pad.left + i * scaleX
    const y = pad.top + chartH - (mode === 'burndown' ? d.remaining : d.completed) * scaleY
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ')

  const idealPath = mode === 'burndown' ? chartData.map((d, i) => {
    const x = pad.left + i * scaleX
    const y = pad.top + chartH - d.ideal * scaleY
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
  }).join(' ') : null

  const color = mode === 'burndown' ? '#3b82f6' : '#10b981'
  const gradientId = mode === 'burndown' ? 'burndown-fill' : 'burnup-fill'

  return (
    <div>
      {/* Toggle */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] rounded-lg p-0.5">
          <button
            onClick={() => setMode('burndown')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
              mode === 'burndown' ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <TrendingDown className="w-3 h-3 inline mr-1" />
            Burndown
          </button>
          <button
            onClick={() => setMode('burnup')}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-medium transition-all',
              mode === 'burnup' ? 'bg-[var(--bg-card)] text-[var(--success)] shadow-sm' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
            )}
          >
            <TrendingUp className="w-3 h-3 inline mr-1" />
            Burnup
          </button>
        </div>
        <span className="text-[9px] text-[var(--text-muted)]">
          {mode === 'burndown' ? 'Remaining work' : 'Completed work'}
        </span>
      </div>

      {/* SVG Chart */}
      <motion.svg
        key={mode}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="overflow-visible"
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Ideal line (burndown only) */}
        {idealPath && (
          <path
            d={idealPath}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            strokeDasharray="3 4"
            opacity="0.3"
          />
        )}

        {/* Area fill */}
        <motion.path
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          d={`${linePath} L ${pad.left + chartW} ${pad.top + chartH} L ${pad.left} ${pad.top + chartH} Z`}
          fill={`url(#${gradientId})`}
        />

        {/* Line path */}
        <motion.path
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeInOut' }}
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* X-axis labels (first, middle, last) */}
        {[0, Math.floor(chartData.length / 2), chartData.length - 1].map(idx => {
          if (idx >= chartData.length) return null
          return (
            <text
              key={idx}
              x={pad.left + idx * scaleX}
              y={height - 4}
              textAnchor={idx === 0 ? 'start' : idx === chartData.length - 1 ? 'end' : 'middle'}
              className="text-[7px] fill-[var(--text-muted)]"
            >
              {chartData[idx].date}
            </text>
          )
        })}
      </motion.svg>
    </div>
  )
}

/* ── Cycle Time Analysis ── */
function CycleTimeAnalysis({ tasks }) {
  const metrics = useMemo(() => {
    // Compute actual cycle time from task timestamps (hours from created to completed)
    const doneTasks = tasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED')
    if (doneTasks.length === 0) return null

    const times = doneTasks.map(t => {
      const createdAt = t.createdAt ? new Date(t.createdAt) : null
      const completedAt = t.completedAt || t.updatedAt
      const endDate = completedAt ? new Date(completedAt) : null
      if (!createdAt || !endDate) return null
      const hours = Math.round((endDate - createdAt) / (1000 * 60 * 60))
      return Math.max(1, hours)
    }).filter(Boolean).sort((a, b) => a - b)

    if (times.length === 0) return null

    const sum = times.reduce((a, b) => a + b, 0)
    const avg = Math.round(sum / times.length)
    const min = times[0]
    const max = times[times.length - 1]
    const median = times.length % 2 === 0
      ? Math.round((times[times.length / 2 - 1] + times[times.length / 2]) / 2)
      : times[Math.floor(times.length / 2)]

    return { avg, min, max, median, count: doneTasks.length, times }
  }, [tasks])

  if (!metrics) {
    return <Text size="xs" variant="muted" className="italic py-3">No completed tasks to analyze cycle time.</Text>
  }

  return (
    <div>
      {/* Summary row */}
      <div className="grid grid-cols-4 gap-2 mb-3">
        {[
          { label: 'Average', value: `${metrics.avg}h`, color: 'text-[var(--accent)]' },
          { label: 'Min', value: `${metrics.min}h`, color: 'text-[var(--success)]' },
          { label: 'Max', value: `${metrics.max}h`, color: 'text-[var(--danger)]' },
          { label: 'Median', value: `${metrics.median}h`, color: 'text-[var(--warning)]' },
        ].map(m => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center p-2 rounded-lg bg-[var(--bg-subtle)]"
          >
            <div className={cn('text-sm font-bold tabular-nums', m.color)}>{m.value}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase">{m.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Distribution bar */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] text-[var(--text-muted)] shrink-0">Distribution</span>
        <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden flex">
          {metrics.times.map((t, i) => (
            <motion.div
              key={i}
              initial={{ width: 0 }}
              animate={{ width: `${(1 / metrics.times.length) * 100}%` }}
              transition={{ duration: 0.3, delay: i * 0.02 }}
              className="h-full"
              style={{
                background: t <= metrics.avg
                  ? `hsl(${142 - (t / metrics.max) * 80}, 60%, 50%)`
                  : `hsl(${(t / metrics.max) * 30 + 10}, 60%, 50%)`,
                opacity: 0.6
              }}
            />
          ))}
        </div>
        <span className="text-[9px] text-[var(--text-muted)] shrink-0 tabular-nums">{metrics.count} tasks</span>
      </div>
    </div>
  )
}

/* ── Throughput Metrics ── */
function ThroughputMetrics({ tasks, dateRange }) {
  const weeklyData = useMemo(() => {
    const weeks = dateRange === '7d' ? 1 : dateRange === '30d' ? 4 : dateRange === 'quarter' ? 13 : 4
    const now = new Date()
    const data = []

    for (let i = 0; i < weeks; i++) {
      const weekEnd = new Date(now)
      weekEnd.setDate(weekEnd.getDate() - i * 7)
      const weekStart = new Date(weekEnd)
      weekStart.setDate(weekStart.getDate() - 7)

      const count = tasks.filter(t => {
        if (t.status !== 'Done' && t.status !== 'COMPLETED') return false
        const completedAt = t.completedAt || t.updatedAt
        if (!completedAt) return false
        const d = new Date(completedAt)
        return d >= weekStart && d < weekEnd
      }).length
      data.unshift(count)
    }

    const total = data.reduce((a, b) => a + b, 0)
    const avg = Math.round(total / weeks)

    return { data, total, avg, weeks }
  }, [tasks, dateRange])

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, delay: 0.1 }}
          >
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] flex items-center justify-center">
              <Zap className="w-4 h-4 text-[var(--accent)]" />
            </div>
          </motion.div>
          <div>
            <div className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{weeklyData.total}</div>
            <Text size="xs" variant="muted">tasks completed</Text>
          </div>
        </div>
        <Sparkline data={weeklyData.data} color="var(--accent)" />
      </div>

      <div className="flex items-center gap-3 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Avg/week:</span>
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">{weeklyData.avg}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Best week:</span>
          <span className="font-semibold text-[var(--success)] tabular-nums">{Math.max(...weeklyData.data)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[var(--text-muted)]">Weeks:</span>
          <span className="font-semibold text-[var(--text-primary)] tabular-nums">{weeklyData.weeks}</span>
        </div>
      </div>
    </div>
  )
}

/* ── Predictive Forecast ── */
function PredictiveForecast({ tasks, throughputAvg }) {
  const active = tasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED' && !t.archived).length
  if (active === 0) return null

  const weeks = throughputAvg > 0 ? Math.ceil(active / throughputAvg) : '—'
  const forecastDate = throughputAvg > 0 ? (() => {
    const d = new Date()
    d.setDate(d.getDate() + weeks * 7)
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
  })() : null

  const confidence = throughputAvg > 0
    ? Math.max(30, Math.min(90, Math.round(80 - (active / throughputAvg) * 5)))
    : 50

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-3 rounded-lg bg-[var(--accent-soft)]/10 border border-[var(--accent-border)]"
    >
      <div className="flex items-center gap-2 mb-2">
        <Target className="w-4 h-4 text-[var(--accent)]" />
        <span className="text-[11px] font-semibold text-[var(--text-primary)]">Predictive Forecast</span>
        <Badge
          variant="subtle"
          className={cn(
            'text-[9px] ml-auto',
            confidence > 70 ? 'text-[var(--success)]' : confidence > 50 ? 'text-[var(--warning)]' : 'text-[var(--danger)]'
          )}
        >
          {confidence}% confidence
        </Badge>
      </div>

      <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed">
        At current velocity ({throughputAvg > 0 ? `${throughputAvg} tasks/week` : 'no data yet'}), all{' '}
        <span className="font-semibold text-[var(--accent)]">{active}</span> remaining tasks will be completed
        {forecastDate ? (
          <> by <span className="font-semibold text-[var(--text-primary)]">{forecastDate}</span></>
        ) : (
          ' once throughput data is available'
        )}.
      </Text>
    </motion.div>
  )
}

/* ── Team Comparison ── */
function TeamComparison({ teamTasks, teamName, insights }) {
  const orgAvg = insights?.orgAvgCompletionRate || 65
  const teamRate = insights?.completionRate || 50
  const diff = teamRate - orgAvg

  const metrics = [
    { label: 'Completion Rate', value: `${teamRate}%`, org: `${orgAvg}%`, diff, format: 'pct' },
    { label: 'Tasks / Member', value: insights?.tasksPerMember || 8, org: insights?.orgTasksPerMember || 7, diff: (insights?.tasksPerMember || 8) - (insights?.orgTasksPerMember || 7), format: 'num' },
    { label: 'Avg Cycle Time', value: insights?.avgCycleTime || '32h', org: insights?.orgAvgCycleTime || '28h', diff: -1, format: 'time' },
    { label: 'On-time Delivery', value: `${insights?.onTimeDelivery || 78}%`, org: `${insights?.orgOnTimeDelivery || 82}%`, diff: (insights?.onTimeDelivery || 78) - (insights?.orgOnTimeDelivery || 82), format: 'pct' },
  ]

  if (!insights?.orgAvgCompletionRate) {
    return <Text size="xs" variant="muted" className="italic py-3">Team comparison data is being collected.</Text>
  }

  return (
    <div className="space-y-2.5">
      {metrics.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.08 }}
          className="flex items-center gap-3"
        >
          <span className="text-[10px] text-[var(--text-muted)] w-24 shrink-0">{m.label}</span>
          <div className="flex-1 flex items-center gap-2">
            {/* Team bar */}
            <div className="flex-1 flex justify-end">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(Math.abs(teamRate) / Math.max(teamRate, orgAvg, 1) * 100, 100)}%` }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="h-2 rounded-full bg-[var(--accent)]/70"
                style={{ maxWidth: '100%' }}
              />
            </div>

            <span className="text-[10px] font-semibold text-[var(--accent)] tabular-nums min-w-[32px] text-right">
              {m.value}
            </span>

            {/* Comparison indicator */}
            {diff !== 0 && (
              <div className={cn(
                'flex items-center gap-0.5 text-[9px] font-medium',
                diff > 0 ? 'text-[var(--success)]' : 'text-[var(--danger)]'
              )}>
                {diff > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <TrendingDown className="w-2.5 h-2.5" />}
                {Math.abs(diff)}{m.format === 'pct' ? 'pp' : ''}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      <div className="text-[9px] text-[var(--text-muted)] mt-2 pt-2 border-t border-[var(--border-subtle)]">
        Compared to organization average • Updated daily
      </div>
    </div>
  )
}

/* ── Key Insights ── */
function KeyInsights({ tasks, insights }) {
  const generatedInsights = useMemo(() => {
    const items = []

    // Completion rate trend
    if (insights?.completionRateDelta) {
      const emoji = insights.completionRateDelta > 0 ? '✓' : '⚠'
      const direction = insights.completionRateDelta > 0 ? 'improved' : 'declined'
      items.push({
        icon: insights.completionRateDelta > 0 ? TrendingUp : TrendingDown,
        text: `Completion rate ${direction} ${Math.abs(insights.completionRateDelta)}% ${insights.dateRangeLabel || 'this week'}`,
        color: insights.completionRateDelta > 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]',
      })
    }

    // Bottleneck detection
    const reviewTasks = tasks.filter(t => String(t.status || '').toUpperCase().includes('REVIEW')).length
    if (reviewTasks > tasks.length * 0.3 && tasks.length > 3) {
      items.push({
        icon: AlertCircle,
        text: `Review bottleneck detected — ${reviewTasks} tasks awaiting review`,
        color: 'text-[var(--warning)]',
      })
    }

    // Overdue count
    const overdue = tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'Done' && t.status !== 'COMPLETED').length
    if (overdue > 0) {
      items.push({
        icon: Clock,
        text: `${overdue} task${overdue > 1 ? 's' : ''} overdue — consider reassigning or adjusting deadlines`,
        color: 'text-[var(--danger)]',
      })
    }

    // Productivity highlight
    if (insights?.topPerformer) {
      items.push({
        icon: Award,
        text: `${insights.topPerformer}'s productivity is up ${insights.topPerformerDelta || 'significantly'} — top performer this period`,
        color: 'text-[var(--accent)]',
      })
    }

    // High-priority count
    const highPri = tasks.filter(t => normalizePriority(t.priority)?.toUpperCase() === 'URGENT').length
    if (highPri > 0) {
      items.push({
        icon: Zap,
        text: `${highPri} urgent task${highPri > 1 ? 's' : ''} need${highPri === 1 ? 's' : ''} immediate attention`,
        color: 'text-[var(--danger)]',
      })
    }

    // Unassigned
    const unassigned = tasks.filter(t => !t.assignedTo).length
    if (unassigned > 2) {
      items.push({
        icon: Users,
        text: `${unassigned} unassigned tasks — distribute workload to keep things moving`,
        color: 'text-[var(--text-secondary)]',
      })
    }

    return items.length > 0 ? items : []
  }, [tasks, insights])

  if (generatedInsights.length === 0) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--bg-subtle)]">
        <Sparkles className="w-4 h-4 text-[var(--text-muted)]" />
        <Text size="xs" variant="muted">No insights available yet. More data will generate actionable insights.</Text>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {generatedInsights.map((item, i) => {
        const Icon = item.icon
        return (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
            className="flex items-start gap-2 p-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors"
          >
            <Icon className={cn('w-3.5 h-3.5 mt-0.5 shrink-0', item.color)} />
            <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed">{item.text}</Text>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ══════════════════════════════════════════════════════
   InsightsTab — Deep analytics + predictive + comparison
   ══════════════════════════════════════════════════════ */
export function InsightsTab({ teamTasks, teamProjects, insights }) {
  const isDataEmpty = teamTasks.length === 0 && teamProjects.length === 0

  const [dateRange, setDateRange] = useState('30d')
  const [dateRangeOpen, setDateRangeOpen] = useState(false)

  const DATE_RANGES = [
    { value: '7d',   label: 'Last 7 days' },
    { value: '30d',  label: 'Last 30 days' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'custom',  label: 'Custom' },
  ]

  // Status breakdown
  const statusBreakdown = useMemo(() => {
    const counts = { todo: 0, inProgress: 0, review: 0, done: 0 }
    teamTasks.forEach(t => {
      if (t.status === 'Done' || t.status === 'COMPLETED') counts.done++
      else if (String(t.status || '').toUpperCase().includes('REVIEW')) counts.review++
      else if (String(t.status || '').toUpperCase().includes('PROGRESS') || String(t.status || '').toUpperCase().includes('DOING')) counts.inProgress++
      else counts.todo++
    })
    return counts
  }, [teamTasks])

  // Per-member task distribution
  const memberDistribution = useMemo(() => {
    const dist = {}
    teamTasks.forEach(t => {
      if (!t.assignedTo || t.archived) return
      if (!dist[t.assignedTo]) dist[t.assignedTo] = { total: 0, done: 0, active: 0 }
      dist[t.assignedTo].total++
      if (t.status === 'Done' || t.status === 'COMPLETED') dist[t.assignedTo].done++
      else dist[t.assignedTo].active++
    })
    return Object.entries(dist)
      .map(([name, stats]) => ({ name, ...stats, completionRate: stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
  }, [teamTasks])

  // Project status breakdown
  const projectStatusBreakdown = useMemo(() => {
    const counts = {}
    teamProjects.forEach(p => {
      const s = (p.status || 'active').toLowerCase()
      counts[s] = (counts[s] || 0) + 1
    })
    return Object.entries(counts).sort((a, b) => b[1] - a[1])
  }, [teamProjects])

  // Throughput avg for forecast
  const throughputAvg = useMemo(() => {
    const done = teamTasks.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length
    const weeks = dateRange === '7d' ? 1 : dateRange === '30d' ? 4 : 13
    return done > 0 ? Math.max(1, Math.round(done / weeks)) : 0
  }, [teamTasks, dateRange])

  if (isDataEmpty) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5">
        <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-10 text-center">
          <Icons.alertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-3 opacity-50" />
          <Heading level={4} className="text-[var(--text-secondary)] mb-1">No Analytics Yet</Heading>
          <Text variant="muted" size="sm">Start adding tasks and projects to see team insights.</Text>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-5 space-y-4">
      {/* ── Header: Key Insights + Date Range + Export ── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--warning)]" />
          <Heading level={4} className="text-[13px] font-semibold">Key Insights</Heading>
        </div>
        <div className="flex items-center gap-2">
          {/* Date range selector */}
          <div className="relative">
            <button
              onClick={() => setDateRangeOpen(!dateRangeOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-secondary)]"
            >
              <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
              {DATE_RANGES.find(r => r.value === dateRange)?.label || 'Last 30 days'}
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </button>
            <AnimatePresence>
              {dateRangeOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setDateRangeOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-40 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-lg p-1 z-40"
                  >
                    {DATE_RANGES.map(r => (
                      <button
                        key={r.value}
                        onClick={() => { setDateRange(r.value); setDateRangeOpen(false) }}
                        className={cn(
                          'w-full px-2.5 py-1.5 text-[11px] font-medium rounded-md text-left transition-colors',
                          dateRange === r.value
                            ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
                        )}
                      >
                        {r.label}
                      </button>
                    ))}
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Export button */}
          <div className="relative group/export">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium border border-[var(--border-subtle)] bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] transition-colors text-[var(--text-secondary)]">
              <Download className="w-3 h-3 text-[var(--text-muted)]" />
              Export Report
            </button>
            <div className="absolute bottom-full right-0 mb-2 px-2.5 py-1.5 bg-[var(--text-primary)] text-white text-[10px] rounded-lg whitespace-nowrap opacity-0 group-hover/export:opacity-100 transition-opacity pointer-events-none z-10">
              Coming soon
              <div className="absolute top-full right-3 -mt-px border-4 border-transparent border-t-[var(--text-primary)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights content */}
      <KeyInsights tasks={teamTasks} insights={{ ...insights, dateRangeLabel: DATE_RANGES.find(r => r.value === dateRange)?.label, range: dateRange }} />

      {/* ── Row 1: Burndown/Burnup + Predictive Forecast ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Burndown/Burnup Chart */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
            <Heading level={4} className="text-[13px] font-semibold">Progress Tracking</Heading>
          </div>
          <BurndownBurnupChart tasks={teamTasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED' && !t.archived)} dateRange={dateRange} />
        </div>

        {/* Predictive Forecast + Throughput */}
        <div className="space-y-4">
          {/* Throughput Metrics */}
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Gauge className="w-4 h-4 text-[var(--accent)]" />
              <Heading level={4} className="text-[13px] font-semibold">Throughput</Heading>
            </div>
            <ThroughputMetrics tasks={teamTasks} dateRange={dateRange} />
          </div>

          {/* Predictive Forecast */}
          <PredictiveForecast tasks={teamTasks} throughputAvg={throughputAvg} />
        </div>
      </div>

      {/* ── Row 2: Cycle Time + Team Comparison ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cycle Time Analysis */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-sky-500" />
            <Heading level={4} className="text-[13px] font-semibold">Cycle Time Analysis</Heading>
            <Text size="xs" variant="muted" className="ml-1">In Progress → Done</Text>
          </div>
          <CycleTimeAnalysis tasks={teamTasks} />
        </div>

        {/* Team Comparison */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <GitBranch className="w-4 h-4 text-violet-500" />
            <Heading level={4} className="text-[13px] font-semibold">Team Comparison</Heading>
          </div>
          <TeamComparison
            teamTasks={teamTasks}
            teamName={insights?.teamName}
            insights={insights}
          />
        </div>
      </div>

      {/* ── Row 3: Status Distribution + Priority Breakdown ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Status Distribution */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.barChart className="w-4 h-4 text-[var(--accent)]" />
            <Heading level={4} className="text-[13px] font-semibold">Status Distribution</Heading>
          </div>
          <StatusStackedBar breakdown={statusBreakdown} total={teamTasks.length} />

          {/* Percentages */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-3 border-t border-[var(--border-subtle)]">
            {[
              { label: 'To Do', val: statusBreakdown.todo, color: 'text-slate-500' },
              { label: 'Progress', val: statusBreakdown.inProgress, color: 'text-[var(--accent)]' },
              { label: 'Review', val: statusBreakdown.review, color: 'text-[var(--accent)]' },
              { label: 'Done', val: statusBreakdown.done, color: 'text-[var(--success)]' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <div className={cn('text-lg font-bold tabular-nums', s.color)}>{Math.round((s.val / Math.max(teamTasks.length, 1)) * 100)}%</div>
                <div className="text-[9px] text-[var(--text-muted)] uppercase">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.flag className="w-4 h-4 text-[var(--warning)]" />
            <Heading level={4} className="text-[13px] font-semibold">Active Tasks by Priority</Heading>
          </div>
          <PriorityBreakdown tasks={teamTasks} />
        </div>
      </div>

      {/* ── Row 4: Member Distribution + Workload Balance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Member Distribution (col-span-2) */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.users className="w-4 h-4 text-sky-500" />
            <Heading level={4} className="text-[13px] font-semibold">Task Distribution by Member</Heading>
          </div>

          {memberDistribution.length === 0 ? (
            <Text size="xs" variant="muted" className="italic py-3">No assigned tasks to distribute.</Text>
          ) : (
            <div className="space-y-3">
              {memberDistribution.map(m => {
                const hue = Math.abs(m.name.split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360
                const maxTotal = Math.max(...memberDistribution.map(d => d.total), 1)
                return (
                  <div key={m.name} className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shrink-0"
                      style={{ background: `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 35) % 360} 60% 40%))` }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-[12px] font-medium text-[var(--text-primary)] truncate w-24 shrink-0">{m.name}</span>

                    {/* Active bar */}
                    <div className="flex-1 flex items-center gap-1">
                      <div className="flex-1 h-3 bg-[var(--bg-subtle)] rounded-full overflow-hidden flex">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(m.active / maxTotal) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="h-full bg-[var(--accent)]"
                        />
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(m.done / maxTotal) * 100}%` }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                          className="h-full bg-emerald-400"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 text-[10px]">
                      <span className="text-[var(--accent)] font-semibold tabular-nums">{m.active}</span>
                      <span className="text-[var(--text-muted)]">/</span>
                      <span className="text-[var(--success)] font-semibold tabular-nums">{m.done}</span>
                      <span className="text-[var(--text-muted)] tabular-nums">({m.completionRate}%)</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[var(--border-subtle)] text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--accent)]" />
              <span className="text-[var(--text-muted)]">Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[var(--text-muted)]">Completed</span>
            </div>
          </div>
        </div>

        {/* Workload Balance Gauge */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <Icons.scale className="w-4 h-4 text-violet-500" />
            <Heading level={4} className="text-[13px] font-semibold">Workload Balance</Heading>
          </div>

          <div className="flex items-center justify-center gap-4 flex-1">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" stroke="var(--bg-subtle)" strokeWidth="7" fill="none" />
                <motion.circle
                  cx="40" cy="40" r="32"
                  stroke={(insights?.balanceScore || 50) > 70 ? 'var(--success)' : 'var(--warning)'}
                  strokeWidth="7" fill="none" strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 32}
                  initial={{ strokeDashoffset: 2 * Math.PI * 32 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 32 - ((insights?.balanceScore || 50) / 100) * 2 * Math.PI * 32 }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.span
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="text-base font-extrabold text-[var(--text-primary)] tabular-nums"
                >
                  {insights?.balanceScore || 50}%
                </motion.span>
              </div>
            </div>
          </div>

          <Text size="xs" className="text-center text-[var(--text-secondary)] leading-relaxed mt-2">
            {(insights?.balanceScore || 50) > 70
              ? 'Workload is evenly distributed.'
              : 'Workload is imbalanced — consider reassigning.'}
          </Text>

          {/* Quick stats */}
          <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-[var(--border-subtle)]">
            <div className="text-center">
              <div className="text-sm font-bold text-[var(--warning)] tabular-nums">{insights?.busiestMember ? '●' : '—'}</div>
              <div className="text-[9px] text-[var(--text-muted)] uppercase">Busiest</div>
              {insights?.busiestMember && <div className="text-[10px] font-medium truncate">@{insights.busiestMember}</div>}
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-sky-500 tabular-nums">{insights?.idleMembersCount || 0}</div>
              <div className="text-[9px] text-[var(--text-muted)] uppercase">Idle</div>
              <div className="text-[10px] text-[var(--text-muted)]">members</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Row 5: Attention Items + Project Status ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Attention Items */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.alertCircle className="w-4 h-4 text-[var(--warning)]" />
            <Heading level={4} className="text-[13px] font-semibold">Attention Required</Heading>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex flex-col items-center p-3 rounded-lg bg-red-500/5 border border-red-500/10"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--danger-soft)] flex items-center justify-center mb-2">
                <Icons.alertTriangle className="w-4 h-4 text-[var(--danger)]" />
              </div>
              <div className="text-lg font-bold text-[var(--danger)] tabular-nums">{insights?.highPriorityCount || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] text-center">High Priority</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-col items-center p-3 rounded-lg bg-amber-500/5 border border-amber-500/10"
            >
              <div className="w-8 h-8 rounded-lg bg-[var(--warning-soft)] flex items-center justify-center mb-2">
                <Icons.helpCircle className="w-4 h-4 text-[var(--warning)]" />
              </div>
              <div className="text-lg font-bold text-[var(--warning)] tabular-nums">{insights?.unassignedCount || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] text-center">Unassigned</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col items-center p-3 rounded-lg bg-sky-500/5 border border-sky-500/10"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center mb-2">
                <Icons.userX className="w-4 h-4 text-sky-500" />
              </div>
              <div className="text-lg font-bold text-sky-500 tabular-nums">{insights?.idleMembersCount || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] text-center">Idle Members</div>
            </motion.div>
          </div>
        </div>

        {/* Project Status Breakdown */}
        <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Icons.folder className="w-4 h-4 text-[var(--warning)]" />
            <Heading level={4} className="text-[13px] font-semibold">Project Status</Heading>
          </div>

          {projectStatusBreakdown.length === 0 ? (
            <Text size="xs" variant="muted" className="italic py-3">No projects to analyze.</Text>
          ) : (
            <div className="space-y-2">
              {projectStatusBreakdown.map(([status, count]) => {
                const pct = Math.round((count / teamProjects.length) * 100)
                const isActive = !['completed', 'done', 'archived', 'cancelled', 'closed'].includes(status)
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-2">
                        <span className={cn('w-1.5 h-1.5 rounded-full', isActive ? 'bg-[var(--accent)]' : 'bg-emerald-400')} />
                        <span className="font-medium capitalize text-[var(--text-secondary)]">{status}</span>
                      </div>
                      <span className="font-semibold tabular-nums text-[var(--text-muted)]">{count} · {pct}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className={cn('h-full rounded-full', isActive ? 'bg-[var(--accent)]' : 'bg-emerald-400')} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

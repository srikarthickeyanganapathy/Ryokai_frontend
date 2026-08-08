import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Flag, CalendarDays, Clock, Radar, ChevronRight, X } from '@/shared/ui/Icons'
import { isToday, isTomorrow, parseISO, isAfter, isBefore, isSameDay, startOfToday, startOfWeek, endOfWeek, format } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { EASING } from '@/shared/lib/uxTokens'

const WEEK_CAP = 20 // weekly load ring capacity

function countdownLabel(item) {
  const date = parseISO(item.__type === 'task' ? item.dueDate : item.startTime)
  const now = new Date()
  if (isToday(date)) {
    if (item.__type === 'event' && item.startTime) {
      const diffMs = parseISO(item.startTime) - now
      const diffH = diffMs / (1000 * 60 * 60)
      if (diffMs > 0 && diffH < 24) return diffH < 1 ? `in ${Math.max(1, Math.round(diffMs / 60000))}m` : `in ${Math.round(diffH)}h`
      return format(date, 'h:mm a')
    }
    return format(date, 'h:mm a')
  }
  if (isTomorrow(date)) return 'Tomorrow'
  return format(date, 'EEE · MMM d')
}

function RadarItem({ item, onClick }) {
  const isEvent = item.__type === 'event'
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.18, ease: EASING.out }}
      onClick={() => onClick(item)}
      className={cn(
        'p-2.5 rounded-lg border cursor-pointer hover:border-[var(--accent)] transition-colors group',
        isEvent ? 'bg-[var(--accent-soft)]/50 border-[var(--accent-border)]' : 'bg-[var(--bg-subtle)]/50 border-[var(--border-subtle)]'
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', isEvent ? 'bg-[var(--accent)]' : 'bg-[var(--warning)]')} />
          <Text size="sm" className={cn('font-medium line-clamp-2 text-[12px] group-hover:text-[var(--accent)] transition-colors', isEvent ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]')}>
            {item.type === 'MILESTONE' && <Flag className="w-2.5 h-2.5 inline mr-1 -mt-0.5 text-purple-500" />}
            {item.title}
          </Text>
        </div>
        <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)] whitespace-nowrap">
          {countdownLabel(item)}
        </span>
      </div>
      {isEvent && !item.isAllDay && item.startTime && (
        <Text size="xs" variant="muted" className="mt-1 text-[10px] pl-3">
          {format(parseISO(item.startTime), 'h:mm a')} – {item.endTime ? format(parseISO(item.endTime), 'h:mm a') : ''}
        </Text>
      )}
    </motion.div>
  )
}

/* ──────────────────────────────────────────────────────────
 * RadarPanel — Deadline Radar + Day Brief (right rail)
 * ────────────────────────────────────────────────────────── */
export function RadarPanel({ tasks = [], events = [], selectedDay, onTaskClick, onEventClick, onReset }) {
  const today = startOfToday()
  const weekStart = startOfWeek(today)
  const weekEnd = endOfWeek(today)

  const radar = useMemo(() => {
    const pendingTasks = tasks.filter(t => t.dueDate && t.status !== 'Done').map(t => ({ ...t, __type: 'task' }))
    const validEvents = events.filter(e => e.startTime).map(e => ({ ...e, __type: 'event' }))
    const groups = { today: [], tomorrow: [], upcoming: [] }
    let weekCount = 0
    for (const item of [...pendingTasks, ...validEvents]) {
      const date = parseISO(item.__type === 'task' ? item.dueDate : item.startTime)
      if (isToday(date)) groups.today.push(item)
      else if (isTomorrow(date)) groups.tomorrow.push(item)
      else if (isAfter(date, today) && !isBefore(date, weekStart) && !isAfter(date, weekEnd)) groups.upcoming.push(item)
      if (!isBefore(date, weekStart) && !isAfter(date, weekEnd)) weekCount++
    }
    groups.today.sort((a, b) => new Date(a.__type === 'task' ? a.dueDate : a.startTime) - new Date(b.__type === 'task' ? b.dueDate : b.startTime))
    groups.tomorrow.sort((a, b) => new Date(a.__type === 'task' ? a.dueDate : a.startTime) - new Date(b.__type === 'task' ? b.dueDate : b.startTime))
    groups.upcoming.sort((a, b) => new Date(a.__type === 'task' ? a.dueDate : a.startTime) - new Date(b.__type === 'task' ? b.dueDate : b.startTime))
    return { groups, weekCount }
  }, [tasks, events, today, weekStart, weekEnd])

  const brief = useMemo(() => {
    if (!selectedDay) return null
    const pendingTasks = tasks.filter(t => t.dueDate && t.status !== 'Done').map(t => ({ ...t, __type: 'task' }))
    const validEvents = events.filter(e => e.startTime).map(e => ({ ...e, __type: 'event' }))
    const items = [...pendingTasks, ...validEvents]
      .filter(item => isSameDay(parseISO(item.__type === 'task' ? item.dueDate : item.startTime), selectedDay))
      .sort((a, b) => new Date(a.__type === 'task' ? a.dueDate : a.startTime) - new Date(b.__type === 'task' ? b.dueDate : b.startTime))
    return items
  }, [tasks, events, selectedDay])

  const loadPct = Math.min(1, radar.weekCount / WEEK_CAP)
  const R = 24
  const CIRC = 2 * Math.PI * R

  return (
    <div className="h-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <Text size="base" className="font-semibold text-[var(--text-primary)] text-[14px] tracking-tight flex items-center gap-2">
            <Radar className="w-4 h-4 text-[var(--accent)]" /> Deadline Radar
          </Text>
          {/* Weekly load ring */}
          <div className="relative w-11 h-11" title={`${radar.weekCount} items this week (cap ${WEEK_CAP})`}>
            <svg viewBox="0 0 56 56" className="w-11 h-11 -rotate-90">
              <circle cx="28" cy="28" r={R} fill="none" stroke="var(--bg-subtle)" strokeWidth="5" />
              <motion.circle
                cx="28" cy="28" r={R} fill="none"
                stroke="var(--accent)" strokeWidth="5" strokeLinecap="round"
                strokeDasharray={CIRC}
                initial={{ strokeDashoffset: CIRC }}
                animate={{ strokeDashoffset: CIRC * (1 - loadPct) }}
                transition={{ duration: 0.8, ease: EASING.out }}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-bold text-[var(--text-primary)] tabular-nums">{radar.weekCount}</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
        {/* Day Brief (when a day is selected) */}
        <AnimatePresence>
          {brief && (
            <motion.div
              key={`brief-${format(selectedDay, 'yyyy-MM-dd')}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: EASING.out }}
              className="rounded-xl border border-[var(--accent-border)] bg-[var(--accent-soft)]/40 p-3"
            >
              <div className="flex items-center justify-between mb-2.5">
                <div>
                  <Text size="sm" className="font-bold text-[var(--text-primary)] text-[12px] flex items-center gap-1.5 uppercase tracking-wider">
                    <CalendarDays className="w-3.5 h-3.5 text-[var(--accent)]" /> {isToday(selectedDay) ? 'Today' : format(selectedDay, 'EEE, MMM d')}
                  </Text>
                  <Text size="xs" variant="muted" className="text-[10px] mt-0.5">{brief.length} item{brief.length !== 1 ? 's' : ''} scheduled</Text>
                </div>
                {onReset && (
                  <button onClick={onReset} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer p-1" title="Back to radar">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {brief.length === 0 ? (
                <div className="text-[11px] text-[var(--text-muted)] italic py-2">A clear day — no events or deadlines.</div>
              ) : (
                <div className="space-y-1.5">
                  {brief.map(item => (
                    <RadarItem key={`${item.__type}-${item.id}`} item={item} onClick={(it) => it.__type === 'event' ? onEventClick?.(it) : onTaskClick?.(it)} />
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Today */}
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2 text-[12px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span> Today
            <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{radar.groups.today.length}</span>
          </Text>
          {radar.groups.today.length === 0 ? (
            <Text size="sm" variant="muted" className="text-[12px]">Nothing due today. Enjoy the runway.</Text>
          ) : (
            <div className="space-y-1.5">
              {radar.groups.today.map(item => <RadarItem key={`${item.__type}-${item.id}`} item={item} onClick={(it) => it.__type === 'event' ? onEventClick?.(it) : onTaskClick?.(it)} />)}
            </div>
          )}
        </div>

        {/* Tomorrow */}
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2 text-[12px] uppercase tracking-wider">
            <Clock className="w-3 h-3" /> Tomorrow
            <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{radar.groups.tomorrow.length}</span>
          </Text>
          {radar.groups.tomorrow.length === 0 ? (
            <Text size="sm" variant="muted" className="text-[12px]">Nothing due tomorrow.</Text>
          ) : (
            <div className="space-y-1.5">
              {radar.groups.tomorrow.map(item => <RadarItem key={`${item.__type}-${item.id}`} item={item} onClick={(it) => it.__type === 'event' ? onEventClick?.(it) : onTaskClick?.(it)} />)}
            </div>
          )}
        </div>

        {/* This week */}
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2 text-[12px] uppercase tracking-wider">
            <ChevronRight className="w-3 h-3" /> Later This Week
            <span className="ml-auto font-mono text-[10px] text-[var(--text-muted)]">{radar.groups.upcoming.length}</span>
          </Text>
          {radar.groups.upcoming.length === 0 ? (
            <Text size="sm" variant="muted" className="text-[12px]">No upcoming items.</Text>
          ) : (
            <div className="space-y-1.5">
              {radar.groups.upcoming.slice(0, 6).map(item => <RadarItem key={`${item.__type}-${item.id}`} item={item} onClick={(it) => it.__type === 'event' ? onEventClick?.(it) : onTaskClick?.(it)} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

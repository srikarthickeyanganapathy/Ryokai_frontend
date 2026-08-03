import React, { useMemo } from 'react'
import { Text } from '@/shared/ui/Typography'
import { isToday, isTomorrow, parseISO, isAfter, startOfToday, format } from 'date-fns'
import { cn } from '@/shared/lib/cn'

export function MiniAgenda({ tasks = [], events = [], onTaskClick, onEventClick }) {
  const agendaItems = useMemo(() => {
    const today = startOfToday()
    const pendingTasks = tasks.filter(t => t.dueDate && t.status !== 'Done').map(t => ({ ...t, __type: 'task' }))
    const validEvents = events.filter(e => e.startTime).map(e => ({ ...e, __type: 'event' }))
    
    const allItems = [...pendingTasks, ...validEvents]
    allItems.sort((a, b) => new Date(a.__type === 'task' ? a.dueDate : a.startTime).getTime() - new Date(b.__type === 'task' ? b.dueDate : b.startTime).getTime())
    
    const groups = { today: [], tomorrow: [], upcoming: [] }
    allItems.forEach(item => {
      const date = parseISO(item.__type === 'task' ? item.dueDate : item.startTime)
      if (isToday(date)) groups.today.push(item)
      else if (isTomorrow(date)) groups.tomorrow.push(item)
      else if (isAfter(date, today)) groups.upcoming.push(item)
    })
    return groups
  }, [tasks, events])

  const renderItem = (item) => {
    if (item.__type === 'event') {
      return (
        <div key={`event-${item.id}`} onClick={() => onEventClick && onEventClick(item)} className="p-2.5 bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-md cursor-pointer hover:border-[var(--accent)] transition-colors group">
          <div className="flex items-start justify-between gap-2">
            <Text size="sm" className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 text-[12px]">
              <span className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-[var(--accent)] align-middle"></span>
              {item.title}
            </Text>
            {item.isAllDay && <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]">ALL DAY</span>}
          </div>
          {!item.isAllDay && <Text size="xs" className="mt-1.5 text-[var(--text-muted)] text-[11px]">{format(parseISO(item.startTime), 'h:mm a')} - {format(parseISO(item.endTime), 'h:mm a')}</Text>}
        </div>
      )
    }

    return (
      <div key={`task-${item.id}`} onClick={() => onTaskClick(item)} className="p-2.5 bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-md cursor-pointer hover:border-[var(--accent)] transition-colors group">
        <div className="flex items-start justify-between gap-2">
          <Text size="sm" className="font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors line-clamp-2 text-[12px]">
            {item.type === 'MILESTONE' && '🎯 '}
            {item.title}
          </Text>
          <span className="shrink-0 text-[9px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-subtle)]">{item.priority}</span>
        </div>
        {item.timeEstimateMinutes > 0 && <Text size="xs" variant="muted" className="mt-1.5 text-[11px]">{Math.floor(item.timeEstimateMinutes / 60)}h {item.timeEstimateMinutes % 60}m</Text>}
      </div>
    )
  }

  return (
    <div className="h-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col">
      <div className="p-4 border-b border-[var(--border-subtle)]">
        <Text size="base" className="font-semibold text-[var(--text-primary)] text-[14px] tracking-tight">Agenda</Text>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2 text-[12px] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span> Today
          </Text>
          {agendaItems.today.length === 0 ? <Text size="sm" variant="muted" className="text-[12px]">No items due today.</Text> : agendaItems.today.map(renderItem)}
        </div>
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 text-[12px] uppercase tracking-wider">Tomorrow</Text>
          {agendaItems.tomorrow.length === 0 ? <Text size="sm" variant="muted" className="text-[12px]">No items due tomorrow.</Text> : agendaItems.tomorrow.map(renderItem)}
        </div>
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 text-[12px] uppercase tracking-wider">Later This Week</Text>
          {agendaItems.upcoming.slice(0, 5).length === 0 ? <Text size="sm" variant="muted" className="text-[12px]">No upcoming items.</Text> : agendaItems.upcoming.slice(0, 5).map(renderItem)}
        </div>
      </div>
    </div>
  )
}
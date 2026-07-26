import React, { useMemo } from 'react'
import { Text } from '@/shared/ui/Typography'
import { isToday, isTomorrow, parseISO, isAfter, startOfToday, format } from 'date-fns'

export function MiniAgenda({ tasks = [], events = [], onTaskClick, onEventClick }) {
  
  const agendaItems = useMemo(() => {
    const today = startOfToday()
    
    // Filter out completed tasks and tasks without due dates
    const pendingTasks = tasks.filter(t => t.dueDate && t.status !== 'Done').map(t => ({ ...t, __type: 'task' }))
    const validEvents = events.filter(e => e.startTime).map(e => ({ ...e, __type: 'event' }))
    
    const allItems = [...pendingTasks, ...validEvents]
    
    // Sort by date ascending (dueDate for tasks, startTime for events)
    allItems.sort((a, b) => {
      const dateA = new Date(a.__type === 'task' ? a.dueDate : a.startTime).getTime()
      const dateB = new Date(b.__type === 'task' ? b.dueDate : b.startTime).getTime()
      return dateA - dateB
    })
    
    // Group them
    const groups = {
      today: [],
      tomorrow: [],
      upcoming: []
    }
    
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
        <div 
          key={`event-${item.id}`} 
          onClick={() => onEventClick && onEventClick(item)}
          className="p-3 mb-2 bg-[var(--info-soft,rgba(59,130,246,0.1))] border border-blue-500/20 rounded-lg cursor-pointer hover:border-blue-500/50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-2">
            <Text size="sm" className="font-medium text-blue-400 group-hover:text-blue-500 transition-colors line-clamp-2">
              <span className="inline-block w-1.5 h-1.5 mr-1.5 rounded-full bg-blue-400 align-middle"></span>
              {item.title}
            </Text>
            {item.isAllDay && (
              <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400">
                ALL DAY
              </span>
            )}
          </div>
          {!item.isAllDay && (
            <Text size="xs" className="mt-2 text-blue-400/80">
              {format(parseISO(item.startTime), 'h:mm a')} - {format(parseISO(item.endTime), 'h:mm a')}
            </Text>
          )}
        </div>
      )
    }

    // Task render
    return (
      <div 
        key={`task-${item.id}`} 
        onClick={() => onTaskClick(item)}
        className="p-3 mb-2 bg-[var(--bg-base)] border border-[var(--color-border-subtle)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors group"
      >
        <div className="flex items-start justify-between gap-2">
          <Text size="sm" className="font-medium group-hover:text-[var(--accent)] transition-colors line-clamp-2">
            {item.type === 'MILESTONE' && '🎯 '}
            {item.title}
          </Text>
          <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
            {item.priority}
          </span>
        </div>
        {item.timeEstimateMinutes > 0 && (
          <Text size="xs" variant="muted" className="mt-2">
            {Math.floor(item.timeEstimateMinutes / 60)}h {item.timeEstimateMinutes % 60}m
          </Text>
        )}
      </div>
    )
  }

  return (
    <div className="h-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg shadow-sm flex flex-col">
      <div className="p-4 border-b border-[var(--color-border-subtle)]">
        <Text size="base" className="font-semibold text-[var(--text-primary)]">Mini Agenda</Text>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse"></span>
            Today
          </Text>
          {agendaItems.today.length === 0 ? (
            <Text size="sm" variant="muted">No items due today.</Text>
          ) : (
            agendaItems.today.map(renderItem)
          )}
        </div>

        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3">Tomorrow</Text>
          {agendaItems.tomorrow.length === 0 ? (
            <Text size="sm" variant="muted">No items due tomorrow.</Text>
          ) : (
            agendaItems.tomorrow.map(renderItem)
          )}
        </div>

        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3">Later This Week</Text>
          {agendaItems.upcoming.slice(0, 5).length === 0 ? (
            <Text size="sm" variant="muted">No upcoming items.</Text>
          ) : (
            agendaItems.upcoming.slice(0, 5).map(renderItem)
          )}
        </div>

      </div>
    </div>
  )
}

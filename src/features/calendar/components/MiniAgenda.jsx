import React, { useMemo } from 'react'
import { Text } from '@/shared/ui/Typography'
import { isToday, isTomorrow, parseISO, isAfter, startOfToday, format } from 'date-fns'

export function MiniAgenda({ tasks = [], onTaskClick }) {
  
  const agendaItems = useMemo(() => {
    const today = startOfToday()
    
    // Filter out completed tasks and tasks without due dates
    const pending = tasks.filter(t => t.dueDate && t.status !== 'Done')
    
    // Sort by due date ascending
    pending.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    
    // Group them
    const groups = {
      today: [],
      tomorrow: [],
      upcoming: []
    }
    
    pending.forEach(task => {
      const date = parseISO(task.dueDate)
      if (isToday(date)) groups.today.push(task)
      else if (isTomorrow(date)) groups.tomorrow.push(task)
      else if (isAfter(date, today)) groups.upcoming.push(task)
    })
    
    return groups
  }, [tasks])

  const renderTask = (task) => (
    <div 
      key={task.id} 
      onClick={() => onTaskClick(task)}
      className="p-3 mb-2 bg-[var(--bg-base)] border border-[var(--color-border-subtle)] rounded-lg cursor-pointer hover:border-[var(--accent)] transition-colors group"
    >
      <div className="flex items-start justify-between gap-2">
        <Text size="sm" className="font-medium group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {task.type === 'MILESTONE' && '🎯 '}
          {task.title}
        </Text>
        <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-secondary)]">
          {task.priority}
        </span>
      </div>
      {task.timeEstimateMinutes > 0 && (
        <Text size="xs" variant="muted" className="mt-2">
          {Math.floor(task.timeEstimateMinutes / 60)}h {task.timeEstimateMinutes % 60}m
        </Text>
      )}
    </div>
  )

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
            <Text size="sm" variant="muted">No tasks due today.</Text>
          ) : (
            agendaItems.today.map(renderTask)
          )}
        </div>

        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3">Tomorrow</Text>
          {agendaItems.tomorrow.length === 0 ? (
            <Text size="sm" variant="muted">No tasks due tomorrow.</Text>
          ) : (
            agendaItems.tomorrow.map(renderTask)
          )}
        </div>

        <div>
          <Text size="sm" className="font-medium text-[var(--text-secondary)] mb-3">Later This Week</Text>
          {agendaItems.upcoming.slice(0, 5).length === 0 ? (
            <Text size="sm" variant="muted">No upcoming tasks.</Text>
          ) : (
            agendaItems.upcoming.slice(0, 5).map(renderTask)
          )}
        </div>

      </div>
    </div>
  )
}

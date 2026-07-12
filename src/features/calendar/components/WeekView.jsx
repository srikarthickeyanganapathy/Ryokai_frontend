import React, { useMemo } from 'react'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, parseISO } from 'date-fns'
import { cn } from '@/shared/lib/cn'
import { Plus } from 'lucide-react'

export function WeekView({ tasks = [], currentDate, isLoading, onTaskClick, onAddClick }) {
  
  const days = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(task => {
      if (task.dueDate) {
        const dateKey = format(parseISO(task.dueDate), 'yyyy-MM-dd')
        if (!map[dateKey]) map[dateKey] = []
        map[dateKey].push(task)
      }
    })
    return map
  }, [tasks])

  if (isLoading) {
    return <div className="p-8 text-center text-[var(--text-muted)]">Loading week...</div>
  }

  const priorityColors = {
    LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
    NORMAL: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20',
    HIGH: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20',
    URGENT: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20'
  }

  const typeColors = {
    MILESTONE: 'bg-purple-500/10 text-purple-400 border-purple-500/20 ring-1 ring-purple-500/30'
  }

  return (
    <div className="flex h-full min-h-[600px]">
      {days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        const dayTasks = tasksByDate[dateKey] || []
        
        return (
          <div key={dateKey} className="flex-1 border-r border-[var(--color-border-subtle)] last:border-r-0 flex flex-col">
            {/* Header */}
            <div className="p-3 border-b border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] text-center relative group">
              <div className="text-xs font-medium text-[var(--text-secondary)] uppercase tracking-wider mb-1">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                "text-lg font-semibold w-8 h-8 mx-auto flex items-center justify-center rounded-full",
                isToday(day) ? "bg-[var(--accent)] text-[var(--bg-base)]" : "text-[var(--text-primary)]"
              )}>
                {format(day, 'd')}
              </div>
              {onAddClick && (
                <button 
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    onAddClick(day)
                  }}
                  className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-all"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>
            
            {/* Tasks List */}
            <div className="flex-1 p-2 bg-[var(--bg-base)] flex flex-col gap-2 overflow-y-auto">
              {dayTasks.map(task => {
                const colorClass = task.type === 'MILESTONE' ? typeColors.MILESTONE : (priorityColors[task.priority] || priorityColors.NORMAL)
                
                return (
                  <div
                    key={task.id}
                    onClick={() => onTaskClick(task)}
                    className={cn(
                      "p-3 rounded-md border cursor-pointer hover:shadow-md transition-all text-sm",
                      colorClass,
                      task.status === 'Done' && "opacity-50 line-through"
                    )}
                  >
                    <div className="font-medium mb-1">
                      {task.type === 'MILESTONE' && '🎯 '}
                      {task.title}
                    </div>
                    {task.timeEstimateMinutes && (
                      <div className="text-xs opacity-75">
                        {Math.floor(task.timeEstimateMinutes / 60)}h {task.timeEstimateMinutes % 60}m
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

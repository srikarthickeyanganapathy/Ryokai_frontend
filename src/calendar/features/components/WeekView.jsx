import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';
import React, { useMemo } from 'react'
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isToday, parseISO } from 'date-fns'
import { PRIORITY_COLORS } from '@/shared/lib/priority'
import { cn } from '@/shared/lib/cn'
import { Plus } from 'lucide-react'

export function WeekView({ tasks = [], events = [], currentDate, isLoading, onTaskClick, onEventClick, onAddClick }) {
  const days = useMemo(() => {
    const start = startOfWeek(currentDate)
    const end = endOfWeek(currentDate)
    return eachDayOfInterval({ start, end })
  }, [currentDate])

  const tasksByDate = useMemo(() => {
    const map = {}
    tasks.forEach(task => { if (task.dueDate) { const k = format(parseISO(task.dueDate), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(task) } })
    return map
  }, [tasks])

  const eventsByDate = useMemo(() => {
    const map = {}
    events.forEach(ev => { if (ev.startTime) { const k = format(parseISO(ev.startTime), 'yyyy-MM-dd'); if (!map[k]) map[k] = []; map[k].push(ev) } })
    return map
  }, [events])

  if (isLoading) {
    return (
      <div className="flex h-full min-h-[600px] gap-2 p-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex-1 flex flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="flex-1 min-h-[500px] w-full rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  const typeColors = { MILESTONE: 'bg-purple-500/10 text-purple-500 border-purple-500/20' }

  return (
    <div className="flex h-full min-h-[600px]">
      {days.map(day => {
        const dateKey = format(day, 'yyyy-MM-dd')
        return (
          <div key={dateKey} className="flex-1 border-r border-[var(--border-subtle)] last:border-r-0 flex flex-col">
            <div className="p-3 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 text-center relative group">
              <div className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-1">{format(day, 'EEE')}</div>
              <div className={cn("text-[14px] font-semibold w-7 h-7 mx-auto flex items-center justify-center rounded-full", isToday(day) ? "bg-[var(--accent)] text-[var(--text-primary)]" : "text-[var(--text-primary)]")}>{format(day, 'd')}</div>
              {onAddClick && (
                <Button variant="ghost" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddClick(day) }} className="absolute top-2.5 right-1 opacity-0 group-hover:opacity-100 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded transition-all h-6 w-6">
                  <Plus className="w-3 h-3" />
                </Button>
              )}
            </div>
            <div className="flex-1 p-2 bg-[var(--bg-base)] flex flex-col gap-2 overflow-y-auto">
              {(tasksByDate[dateKey] || []).map(task => {
                const colorClass = task.type === 'MILESTONE' ? typeColors.MILESTONE : (PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)
                return (
                  <div key={task.id} onClick={() => onTaskClick(task)} className={cn("p-2.5 rounded-md border cursor-pointer hover:border-[var(--accent)] transition-colors text-[12px]", colorClass, task.status === 'Done' && "opacity-50 line-through")}>
                    <div className="font-medium mb-0.5">{task.type === 'MILESTONE' && '🎯 '}{task.title}</div>
                    {task.timeEstimateMinutes > 0 && <div className="text-[10px] opacity-75">{Math.floor(task.timeEstimateMinutes / 60)}h {task.timeEstimateMinutes % 60}m</div>}
                  </div>
                )
              })}
              {(eventsByDate[dateKey] || []).map(ev => (
                <div key={`event-${ev.id}`} onClick={() => onEventClick && onEventClick(ev)} className="p-2.5 rounded-md border cursor-pointer hover:border-[var(--accent)] transition-colors text-[12px] bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)] flex items-start gap-2">
                  <span className="w-1.5 h-1.5 mt-1.5 rounded-full bg-[var(--accent)] shrink-0" />
                  <div>
                    <div className="font-medium mb-0.5">{ev.title}</div>
                    <div className="text-[10px] opacity-75">{ev.isAllDay ? 'All Day' : `${format(parseISO(ev.startTime), 'h:mm a')} - ${format(parseISO(ev.endTime), 'h:mm a')}`}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
import React, { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns'
import { useTaskList } from '@/features/tasks/hooks/useTasks'
import { useCalendarEvents } from '@/features/calendar/hooks/useCalendar'
import { CalendarView } from '@/features/calendar/components/CalendarView'

export function CalendarPage() {
  // Grid range mirrors MonthView's own 6-week grid math exactly, so
  // events in leading/trailing days that are visible on screen are
  // always included in the fetch — not just the calendar-month bounds.
  const [visibleRange, setVisibleRange] = useState(() => {
    const now = new Date()
    return {
      start: startOfWeek(startOfMonth(now)),
      end: endOfWeek(endOfMonth(now)),
    }
  })

  const { data: tasks = [], isLoading: tasksLoading } = useTaskList()
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(
    visibleRange.start.toISOString(),
    visibleRange.end.toISOString()
  )

  return (
    <CalendarView
      tasks={tasks}
      events={events}
      isLoading={tasksLoading || eventsLoading}
      onVisibleRangeChange={setVisibleRange}
    />
  )
}

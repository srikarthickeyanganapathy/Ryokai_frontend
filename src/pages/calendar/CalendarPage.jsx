import React, { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'
import { useTaskList } from '@/features/tasks/hooks/useTasks'
import { useCalendarEvents } from '@/features/calendar/hooks/useCalendar'
import { CalendarView } from '@/features/calendar/components/CalendarView'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'

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

  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <div className="h-full flex flex-col relative">
      <CalendarView
        tasks={tasks}
        events={events}
        isLoading={tasksLoading || eventsLoading}
        onVisibleRangeChange={setVisibleRange}
        onTaskClick={setSelectedTask}
        onEventClick={setSelectedEvent}
      />
      
      {/* Task detail panel */}
      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Event detail modal */}
      <Modal open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
        <ModalContent className="sm:max-w-md bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] p-6">
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <Heading level={3} className="text-[var(--text-primary)]">{selectedEvent.title}</Heading>
                {selectedEvent.type && (
                  <Badge variant="outline" className="text-xs uppercase bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20">
                    {selectedEvent.type}
                  </Badge>
                )}
              </div>
              
              <div className="space-y-2 text-sm text-[var(--text-secondary)]">
                <p>
                  <strong>Start:</strong> {selectedEvent.startTime ? format(new Date(selectedEvent.startTime), 'PPp') : format(new Date(selectedEvent.date), 'PP')}
                </p>
                {selectedEvent.endTime && (
                  <p>
                    <strong>End:</strong> {format(new Date(selectedEvent.endTime), 'PPp')}
                  </p>
                )}
                {selectedEvent.location && (
                  <p>
                    <strong>Location:</strong> {selectedEvent.location}
                  </p>
                )}
              </div>
              
              {selectedEvent.description && (
                <div className="pt-4 border-t border-[var(--color-border-subtle)]">
                  <Text variant="secondary" className="whitespace-pre-wrap text-sm">
                    {selectedEvent.description}
                  </Text>
                </div>
              )}
            </div>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

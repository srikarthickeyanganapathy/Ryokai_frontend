import React, { useState } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format } from 'date-fns'
import { useTaskList } from '@/task'
import { useCalendarEvents } from '@/calendar'
import { CalendarView } from '@/calendar'
import { TaskPanel } from '@/task'
import { TaskForm } from '@/task'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { PageHeader } from '@/shared/ui/PageHeader'
import { WorkspaceShell, ManagementLayout } from '@/shared/workspace-framework'

export function CalendarPage() {
  const [visibleRange, setVisibleRange] = useState(() => {
    const now = new Date()
    return { start: startOfWeek(startOfMonth(now)), end: endOfWeek(endOfMonth(now)) }
  })

  const { data: tasks = [], isLoading: tasksLoading } = useTaskList()
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(visibleRange.start.toISOString(), visibleRange.end.toISOString())

  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)

  return (
    <WorkspaceShell maxWidth="wide">
      <ManagementLayout
        header={<PageHeader eyebrow="Orient" meta="• Schedule Matrix & Event Telemetry" title="Calendar & Task Deadlines" subtitle="View upcoming deadlines, scheduled milestones, and project events." />}
      >
        <div className="flex-1 min-h-0 pt-2">
          <CalendarView tasks={tasks} events={events} isLoading={tasksLoading || eventsLoading} onVisibleRangeChange={setVisibleRange} onTaskClick={setSelectedTask} onEventClick={setSelectedEvent} TaskFormComponent={TaskForm} />
        </div>
        
        <TaskPanel task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />

        <Modal open={!!selectedEvent} onOpenChange={(open) => !open && setSelectedEvent(null)}>
          <ModalContent className="sm:max-w-sm !bg-[var(--bg-card)] !backdrop-blur-none border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <Heading level={3} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)]">{selectedEvent.title}</Heading>
                  {selectedEvent.type && <Badge variant="outline" className="text-[10px] uppercase bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]">{selectedEvent.type}</Badge>}
                </div>
                <div className="space-y-2 text-[12px] text-[var(--text-secondary)]">
                  <p><strong>Start:</strong> {selectedEvent.startTime ? format(new Date(selectedEvent.startTime), 'PPp') : format(new Date(selectedEvent.date), 'PP')}</p>
                  {selectedEvent.endTime && <p><strong>End:</strong> {format(new Date(selectedEvent.endTime), 'PPp')}</p>}
                  {selectedEvent.location && <p><strong>Location:</strong> {selectedEvent.location}</p>}
                </div>
                {selectedEvent.description && (
                  <div className="pt-4 border-t border-[var(--border-subtle)]">
                    <Text variant="secondary" className="whitespace-pre-wrap text-[13px]">{selectedEvent.description}</Text>
                  </div>
                )}
              </div>
            )}
          </ModalContent>
        </Modal>
      </ManagementLayout>
    </WorkspaceShell>
  )
}
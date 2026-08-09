import React, { useState, useMemo } from 'react'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, format, isWithinInterval, parseISO } from 'date-fns'
import { useTaskList } from '@/task'
import { useCalendarEvents, useUpdateEvent, useDeleteEvent, CalendarView, EventForm } from '@/calendar'
import { TaskPanel } from '@/task'
import { TaskForm } from '@/task'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Edit3, CalendarDays, Target, Gauge, Zap } from '@/shared/ui/Icons'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'
import { PageShell, PageHero, PageContent, PageStats } from '@/shared/ui/PageShell'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

function StatChip({ icon: Icon, label, value, accent }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)]">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: `${accent}15` }}>
        <Icon className="w-4 h-4" style={{ color: accent }} />
      </div>
      <div className="min-w-0">
        <div className="text-[16px] font-bold text-[var(--text-primary)] tabular-nums leading-none font-mono">{value}</div>
        <div className="text-[9px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1 truncate">{label}</div>
      </div>
    </div>
  )
}

export function CalendarPage() {
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace()
  const scope = useMemo(() => {
    if (workspaceMode === 'ORG' && activeOrganization?.id) return { orgId: activeOrganization.id }
    if (workspaceMode === 'CREWS' && activeCrew?.id) return { crewId: activeCrew.id }
    return {}
  }, [workspaceMode, activeOrganization, activeCrew])

  const [visibleRange, setVisibleRange] = useState(() => {
    const now = new Date()
    return { start: startOfWeek(startOfMonth(now)), end: endOfWeek(endOfMonth(now)) }
  })

  const { data: { tasks = [] } = {}, isLoading: tasksLoading } = useTaskList()
  const { data: events = [], isLoading: eventsLoading } = useCalendarEvents(
    visibleRange.start.toISOString(), visibleRange.end.toISOString(), scope
  )

  const updateEvent = useUpdateEvent()
  const deleteEvent = useDeleteEvent()
  const { confirm, dialog } = useConfirmDialog()

  const [selectedTask, setSelectedTask] = useState(null)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [editingEvent, setEditingEvent] = useState(null)

  const closeEventModal = () => {
    setSelectedEvent(null)
    setEditingEvent(null)
  }

  const stats = useMemo(() => {
    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const weekStart = startOfWeek(now)
    const weekEnd = endOfWeek(now)
    const eventsThisMonth = events.filter(e => e.startTime && isWithinInterval(parseISO(e.startTime), { start: monthStart, end: monthEnd })).length
    const deadlinesThisWeek = tasks.filter(t => t.dueDate && isWithinInterval(parseISO(t.dueDate), { start: weekStart, end: weekEnd })).length
    const eventsThisWeek = events.filter(e => e.startTime && isWithinInterval(parseISO(e.startTime), { start: weekStart, end: weekEnd })).length
    const busyRatio = Math.min(100, Math.round(((eventsThisWeek + deadlinesThisWeek) / 7) * 100))
    const allItems = [
      ...events.filter(e => e.startTime).map(e => ({ t: parseISO(e.startTime), title: e.title, kind: 'event' })),
      ...tasks.filter(t => t.dueDate).map(t => ({ t: parseISO(t.dueDate), title: t.title, kind: 'task' })),
    ].filter(i => i.t >= now).sort((a, b) => a.t - b.t)
    const next = allItems[0] || null
    return { eventsThisMonth, deadlinesThisWeek, busyRatio, next }
  }, [events, tasks])

  const handleDeleteEvent = async (event) => {
    const confirmed = await confirm({
      title: 'Delete Event?',
      description: 'This event will be permanently removed from your calendar.',
      danger: true,
      confirmLabel: 'Delete Event',
    })
    if (confirmed) {
      deleteEvent.mutate(event.id, { onSuccess: closeEventModal })
    }
  }

  const workspaceModeLabel = workspaceMode === 'ORG' ? 'ORG' : workspaceMode === 'CREWS' ? 'CREWS' : 'PERSONAL'
  const workspaceName = workspaceMode === 'ORG' ? activeOrganization?.name : workspaceMode === 'CREWS' ? activeCrew?.name : null
  const eyebrow = workspaceName ? `${workspaceName} · Time Deck` : 'Schedule Matrix & Event Telemetry'

  return (
    <PageShell maxWidth="wide" workspaceMode={workspaceModeLabel}>
      <PageHero
        title="Calendar & Task Deadlines"
        subtitle="View upcoming deadlines, scheduled milestones, and project events."
        eyebrow={eyebrow}
      />

      {!tasksLoading && !eventsLoading && (
        <PageStats>
          <StatChip icon={CalendarDays} label="Events This Month" value={stats.eventsThisMonth} accent="var(--accent)" />
          <StatChip icon={Target} label="Deadlines This Week" value={stats.deadlinesThisWeek} accent="var(--warning)" />
          <StatChip icon={Gauge} label="Weekly Busy Ratio" value={`${stats.busyRatio}%`} accent="var(--info)" />
          <StatChip icon={Zap} label="Next Up" value={stats.next ? format(stats.next.t, 'MMM d · h:mm a') : 'Clear'} accent="var(--success)" />
        </PageStats>
      )}

      <PageContent>
        <div className="flex-1 min-h-0 pt-2">
          <CalendarView
            tasks={tasks}
            events={events}
            isLoading={tasksLoading || eventsLoading}
            onVisibleRangeChange={setVisibleRange}
            onTaskClick={setSelectedTask}
            onEventClick={setSelectedEvent}
            TaskFormComponent={TaskForm}
            scope={scope}
          />
        </div>

        <TaskPanel task={selectedTask} isOpen={!!selectedTask} onClose={() => setSelectedTask(null)} />

        <Modal open={!!selectedEvent || !!editingEvent} onOpenChange={(open) => !open && closeEventModal()}>
          <ModalContent className="sm:max-w-sm !bg-[var(--bg-card)] !backdrop-blur-none border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
            {editingEvent ? (
              <EventForm
                key={editingEvent.id}
                defaultValues={{
                  id: editingEvent.id,
                  title: editingEvent.title || '',
                  description: editingEvent.description || '',
                  location: editingEvent.location || '',
                  startTime: editingEvent.startTime ? format(new Date(editingEvent.startTime), "yyyy-MM-dd'T'HH:mm") : '',
                  endTime: editingEvent.endTime ? format(new Date(editingEvent.endTime), "yyyy-MM-dd'T'HH:mm") : '',
                  isAllDay: !!editingEvent.isAllDay,
                }}
                onSubmit={(payload) => updateEvent.mutate({ id: editingEvent.id, payload }, { onSuccess: () => setEditingEvent(null) })}
                onCancel={() => setEditingEvent(null)}
                onDelete={() => handleDeleteEvent(editingEvent)}
                isLoading={updateEvent.isPending}
                isDeleting={deleteEvent.isPending}
              />
            ) : selectedEvent ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-2">
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
                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border-subtle)]">
                  <Button variant="outline" size="sm" className="h-8 text-[12px] text-[var(--danger)] hover:bg-[var(--danger-soft)]" onClick={() => handleDeleteEvent(selectedEvent)}>
                    Delete
                  </Button>
                  <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => { setEditingEvent(selectedEvent); setSelectedEvent(null) }}>
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Button>
                </div>
              </div>
            ) : null}
          </ModalContent>
        </Modal>
        {dialog}
      </PageContent>
    </PageShell>
  )
}
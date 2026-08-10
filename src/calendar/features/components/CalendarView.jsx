import React, { useState } from 'react'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { RadarPanel } from './RadarPanel'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter } from '@/shared/ui/Icons'
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/shared/ui/Button'
import { Text, Heading } from '@/shared/ui/Typography'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { EventForm } from './EventForm'
import { useCreateTask } from '@/task'
import { useCreateEvent } from '../hooks/useCalendar'
import { cn } from '@/shared/lib/cn'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'

export function CalendarView({ tasks, events = [], isLoading, onTaskClick, onEventClick, onVisibleRangeChange, TaskFormComponent, scope = {} }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'month'

  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [selectedDay, setSelectedDay] = useState(null)
  const [quickAddDate, setQuickAddDate] = useState(null)
  const [createType, setCreateType] = useState('event')
  const [filterType, setFilterType] = useState('all')
  const [filterOpen, setFilterOpen] = useState(false)

  const createTaskMutation = useCreateTask()
  const createEventMutation = useCreateEvent(scope)

  const filteredTasks = filterType === 'events' ? [] : (tasks || [])
  const filteredEvents = filterType === 'tasks' ? [] : (events || [])

  const handleCreate = (payload) => {
    if (createType === 'task') {
      const taskPayload = { ...payload, dueDate: payload.dueDate ? new Date(payload.dueDate).toISOString() : null }
      createTaskMutation.mutate(taskPayload, { onSuccess: () => setQuickAddDate(null) })
    } else {
      const eventPayload = {
        ...payload,
        startTime: payload.startTime ? new Date(payload.startTime).toISOString() : null,
        endTime: payload.endTime ? new Date(payload.endTime).toISOString() : null
      }
      createEventMutation.mutate(eventPayload, { onSuccess: () => setQuickAddDate(null) })
    }
  }

  React.useEffect(() => {
    if (!onVisibleRangeChange) return
    const start = mode === 'month' ? startOfWeek(startOfMonth(currentDate)) : startOfWeek(currentDate)
    const end = mode === 'month' ? endOfWeek(endOfMonth(currentDate)) : endOfWeek(currentDate)
    onVisibleRangeChange({ start, end })
    setSelectedDay(null)
  }, [currentDate, mode, onVisibleRangeChange])

  const setMode = (newMode) => {
    setSearchParams(params => { params.set('mode', newMode); return params }, { replace: true })
  }

  const next = () => mode === 'month' ? setCurrentDate(addMonths(currentDate, 1)) : setCurrentDate(addWeeks(currentDate, 1))
  const prev = () => mode === 'month' ? setCurrentDate(subMonths(currentDate, 1)) : setCurrentDate(subWeeks(currentDate, 1))
  const today = () => { setCurrentDate(startOfToday()); setSelectedDay(null) }

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      <div className="flex-1 flex flex-col bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">
              {format(currentDate, mode === 'month' ? 'MMMM yyyy' : 'MMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={prev}><ChevronLeft className="w-4 h-4" /></Button>
              <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={today}>Today</Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={next}><ChevronRight className="w-4 h-4" /></Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]">
              <Button variant="ghost" onClick={() => setMode('month')} className={cn('px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto', mode === 'month' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}>Month</Button>
              <Button variant="ghost" onClick={() => setMode('week')} className={cn('px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto', mode === 'week' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]')}>Week</Button>
            </div>

            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5">
                  <Filter className="w-3 h-3" /> {filterType !== 'all' ? filterType : 'Filter'}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-40 p-1.5">
                <Text size="xs" variant="muted" className="px-2 py-1 uppercase font-bold tracking-wide text-[10px]">View Items</Text>
                <div className="space-y-0.5 mt-1">
                  {[{ id: 'all', label: 'All Items' }, { id: 'tasks', label: 'Tasks Only' }, { id: 'events', label: 'Events Only' }].map(item => (
                    <Button key={item.id} variant="ghost" size="sm" className="w-full justify-start" onClick={() => { setFilterType(item.id); setFilterOpen(false) }}>{item.label}</Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-[var(--bg-base)] flex flex-col min-h-0">
          {mode === 'month' ? (
            <MonthView tasks={filteredTasks} events={filteredEvents} currentDate={currentDate} isLoading={isLoading} onTaskClick={onTaskClick} onEventClick={onEventClick} onAddClick={(d) => setQuickAddDate(d)} onSelectDay={setSelectedDay} />
          ) : (
            <WeekView tasks={filteredTasks} events={filteredEvents} currentDate={currentDate} isLoading={isLoading} onTaskClick={onTaskClick} onEventClick={onEventClick} onAddClick={(d) => setQuickAddDate(d)} onSelectDay={setSelectedDay} />
          )}
        </div>
      </div>

      <div className="w-full lg:w-72 shrink-0">
        <RadarPanel tasks={filteredTasks} events={filteredEvents} selectedDay={selectedDay} onTaskClick={onTaskClick} onEventClick={onEventClick} onReset={() => setSelectedDay(null)} />
      </div>

      <Modal open={!!quickAddDate} onOpenChange={(open) => !open && setQuickAddDate(null)}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] !backdrop-blur-none border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <div className="flex items-center gap-1 mb-5 bg-[var(--bg-subtle)] rounded-md p-0.5 w-fit border border-[var(--border-subtle)]">
            <Button variant="ghost" onClick={() => setCreateType('event')} className={cn('px-3 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto', createType === 'event' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>Event</Button>
            <Button variant="ghost" onClick={() => setCreateType('task')} className={cn('px-3 py-1 text-[11px] font-medium rounded-sm transition-colors h-auto', createType === 'task' ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>Task</Button>
          </div>

          {createType === 'task' ? (
            TaskFormComponent ? (
              <TaskFormComponent onSubmit={handleCreate} isLoading={createTaskMutation.isPending} defaultValues={{ title: '', description: '', assigneeUsername: '', priority: 'MEDIUM', dueDate: quickAddDate ? format(quickAddDate, `yyyy-MM-dd'T'${format(new Date(), 'HH:mm')}`) : '', tags: '', teamId: '' }} />
            ) : null
          ) : (
            <EventForm onSubmit={handleCreate} onCancel={() => setQuickAddDate(null)} isLoading={createEventMutation.isPending} defaultValues={{ title: '', description: '', location: '', startTime: quickAddDate ? format(quickAddDate, "yyyy-MM-dd'T'HH:mm") : '', endTime: quickAddDate ? format(quickAddDate, "yyyy-MM-dd'T'HH:mm") : '', isAllDay: false }} />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

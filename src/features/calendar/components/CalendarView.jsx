import React, { useState } from 'react'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { MiniAgenda } from './MiniAgenda'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfToday, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Button } from '@/shared/ui/Button'
import { Text, Heading } from '@/shared/ui/Typography'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from '@/widgets/tasks/TaskForm'
import { EventForm } from './EventForm'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'
import { useCreateEvent } from '@/features/calendar/hooks/useCalendar'
import { cn } from '@/shared/lib/cn'

export function CalendarView({ tasks, events = [], isLoading, onTaskClick, onEventClick, onVisibleRangeChange }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'month'
  
  // Local state for calendar navigation
  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [quickAddDate, setQuickAddDate] = useState(null)
  const [createType, setCreateType] = useState('event')
  
  const createTaskMutation = useCreateTask()
  const createEventMutation = useCreateEvent()
  
  const handleCreate = (payload) => {
    if (createType === 'task') {
      createTaskMutation.mutate(payload, {
        onSuccess: () => setQuickAddDate(null)
      })
    } else {
      createEventMutation.mutate(payload, {
        onSuccess: () => setQuickAddDate(null)
      })
    }
  }

  React.useEffect(() => {
    if (!onVisibleRangeChange) return
    const start = mode === 'month'
      ? startOfWeek(startOfMonth(currentDate))
      : startOfWeek(currentDate)
    const end = mode === 'month'
      ? endOfWeek(endOfMonth(currentDate))
      : endOfWeek(currentDate)
    onVisibleRangeChange({ start, end })
  }, [currentDate, mode, onVisibleRangeChange])

  const setMode = (newMode) => {
    setSearchParams(params => {
      params.set('mode', newMode)
      return params
    }, { replace: true })
  }

  const next = () => {
    if (mode === 'month') setCurrentDate(addMonths(currentDate, 1))
    else setCurrentDate(addWeeks(currentDate, 1))
  }

  const prev = () => {
    if (mode === 'month') setCurrentDate(subMonths(currentDate, 1))
    else setCurrentDate(subWeeks(currentDate, 1))
  }

  const today = () => setCurrentDate(startOfToday())

  return (
    <div className="flex h-full gap-4">
      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg shadow-sm overflow-hidden">
        
        {/* Calendar Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-border-subtle)]">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              {format(currentDate, mode === 'month' ? 'MMMM yyyy' : 'MMM yyyy')}
            </h2>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={prev}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={today}>
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={next}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--color-border-subtle)]">
              <Button 
                variant="ghost"
                onClick={() => setMode('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${mode === 'month' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Month
              </Button>
              <Button 
                variant="ghost"
                onClick={() => setMode('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${mode === 'week' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Week
              </Button>
            </div>
            
            {/* Filter */}
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 overflow-auto bg-[var(--bg-base)]">
          {mode === 'month' ? (
            <MonthView 
              tasks={tasks}
              events={events}
              currentDate={currentDate} 
              isLoading={isLoading} 
              onTaskClick={onTaskClick}
              onEventClick={onEventClick}
              onAddClick={(d) => setQuickAddDate(d)}
            />
          ) : (
            <WeekView 
              tasks={tasks}
              events={events}
              currentDate={currentDate} 
              isLoading={isLoading} 
              onTaskClick={onTaskClick}
              onEventClick={onEventClick}
              onAddClick={(d) => setQuickAddDate(d)}
            />
          )}
        </div>
      </div>

      {/* Mini Agenda */}
      <div className="w-80 shrink-0 hidden lg:block">
        <MiniAgenda tasks={tasks} events={events} currentDate={currentDate} onTaskClick={onTaskClick} onEventClick={onEventClick} />
      </div>

      {/* Quick Create Modal */}
      <Modal open={!!quickAddDate} onOpenChange={(open) => !open && setQuickAddDate(null)}>
        <ModalContent className="sm:max-w-xl">
          <div className="flex items-center gap-1 mb-4 bg-[var(--bg-subtle)] rounded-md p-0.5 w-fit border border-[var(--color-border-subtle)]">
            <Button
              onClick={() => setCreateType('event')}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                createType === 'event' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}
            >
              Event
            </Button>
            <Button
              onClick={() => setCreateType('task')}
              className={cn('px-3 py-1.5 text-xs font-medium rounded-sm transition-colors',
                createType === 'task' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)]')}
            >
              Task
            </Button>
          </div>

          {createType === 'task' ? (
            <TaskForm 
              onSubmit={handleCreate} 
              isLoading={createTaskMutation.isPending} 
              defaultValues={{
                title: '',
                description: '',
                assigneeUsername: '',
                priority: 'MEDIUM',
                dueDate: quickAddDate ? format(quickAddDate, `yyyy-MM-dd'T'${format(new Date(), 'HH:mm')}`) : '',
                tags: '',
                teamId: '',
              }}
            />
          ) : (
            <EventForm 
              onSubmit={handleCreate} 
              isLoading={createEventMutation.isPending} 
              defaultValues={{
                title: '', description: '',
                startTime: quickAddDate ? format(quickAddDate, "yyyy-MM-dd'T'HH:mm") : '',
                endTime: quickAddDate ? format(quickAddDate, "yyyy-MM-dd'T'HH:mm") : '',
                isAllDay: false,
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

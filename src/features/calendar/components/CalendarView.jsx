import React, { useState } from 'react'
import { MonthView } from './MonthView'
import { WeekView } from './WeekView'
import { MiniAgenda } from './MiniAgenda'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { format, addMonths, subMonths, addWeeks, subWeeks, startOfToday } from 'date-fns'
import { Button } from '@/shared/ui/Button'
import { Text, Heading } from '@/shared/ui/Typography'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { TaskForm } from '@/widgets/tasks/TaskForm'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'

export function CalendarView({ tasks, isLoading, onTaskClick }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const mode = searchParams.get('mode') || 'month'
  
  // Local state for calendar navigation
  const [currentDate, setCurrentDate] = useState(startOfToday())
  const [quickAddDate, setQuickAddDate] = useState(null)
  
  const createTaskMutation = useCreateTask()
  
  const handleCreateTask = (payload) => {
    createTaskMutation.mutate(payload, {
      onSuccess: () => setQuickAddDate(null)
    })
  }

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
              <button 
                onClick={() => setMode('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${mode === 'month' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Month
              </button>
              <button 
                onClick={() => setMode('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-sm transition-colors ${mode === 'week' ? 'bg-[var(--bg-elevated)] shadow-sm text-[var(--text-primary)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Week
              </button>
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
              currentDate={currentDate} 
              isLoading={isLoading} 
              onTaskClick={onTaskClick}
              onAddClick={(d) => setQuickAddDate(d)}
            />
          ) : (
            <WeekView 
              tasks={tasks} 
              currentDate={currentDate} 
              isLoading={isLoading} 
              onTaskClick={onTaskClick}
              onAddClick={(d) => setQuickAddDate(d)}
            />
          )}
        </div>
      </div>

      {/* Mini Agenda */}
      <div className="w-80 shrink-0 hidden lg:block">
        <MiniAgenda tasks={tasks} currentDate={currentDate} onTaskClick={onTaskClick} />
      </div>

      {/* Quick Create Modal */}
      <Modal open={!!quickAddDate} onOpenChange={(open) => !open && setQuickAddDate(null)}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create New Task</Heading>
          {quickAddDate && (
            <TaskForm 
              onSubmit={handleCreateTask} 
              isLoading={createTaskMutation.isPending} 
              defaultValues={{
                title: '',
                description: '',
                assigneeUsername: '',
                priority: 'MEDIUM',
                dueDate: format(quickAddDate, `yyyy-MM-dd'T'${format(new Date(), 'HH:mm')}`),
                tags: '',
                teamId: '',
              }}
            />
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

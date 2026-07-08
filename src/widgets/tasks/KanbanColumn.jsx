import React, { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { KanbanTaskCard } from './KanbanTaskCard'
import { Icons } from '@/shared/ui/Icons'
import { Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'

export function KanbanColumn({ column, tasks, onTaskClick }) {
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const createTaskMutation = useCreateTask()

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    }
  })

  const taskIds = tasks.map(t => t.id)

  const handleQuickAdd = (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) {
      setIsQuickAdding(false)
      return
    }
    
    createTaskMutation.mutate({ title: newTaskTitle }, {
      onSuccess: () => {
        setNewTaskTitle('')
        setIsQuickAdding(false)
      }
    })
  }

  return (
    <div className="flex flex-col bg-[var(--bg-subtle)] rounded-xl h-full w-[320px] shrink-0 border border-[var(--color-border-subtle)]">
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Heading level={4} className="text-sm font-semibold">{column.title}</Heading>
          <span className="flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] text-[var(--text-secondary)] text-xs font-medium rounded-full w-5 h-5">
            {tasks.length}
          </span>
        </div>
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
          <Icons.settings className="w-4 h-4" /> {/* Placeholder for column settings/collapse */}
        </button>
      </div>

      {/* Task List (Droppable Area) */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 no-scrollbar flex flex-col gap-3">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[100px]">
            {tasks.map(task => (
              <KanbanTaskCard key={task.id} task={task} onClick={onTaskClick} />
            ))}
          </div>
        </SortableContext>

        {/* Quick Add Form inside Column */}
        {isQuickAdding ? (
          <form 
            onSubmit={handleQuickAdd}
            className="bg-[var(--bg-elevated)] border border-[var(--color-border-default)] rounded-xl p-3 shadow-md mt-2"
          >
            <input
              autoFocus
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => !newTaskTitle.trim() && setIsQuickAdding(false)}
              placeholder="Task title..."
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] mb-3"
              disabled={createTaskMutation.isPending}
            />
            <div className="flex items-center justify-end gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsQuickAdding(false)}
                disabled={createTaskMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                size="sm" 
                disabled={createTaskMutation.isPending}
              >
                Add
              </Button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsQuickAdding(true)}
            className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-lg p-2 text-sm font-medium transition-colors mt-2"
          >
            <Icons.check className="w-4 h-4 mr-2" /> {/* Use plus icon ideally, using check as placeholder if plus missing */}
            Add Task
          </button>
        )}
      </div>
    </div>
  )
}

import { Input } from '@/shared/ui/Input';

import React, { useState } from 'react'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { KanbanTaskCard } from './KanbanTaskCard'
import { Icons } from '@/shared/ui/Icons'
import { Heading } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { useCreateTask } from '@/features/tasks/hooks/useTasks'
import { cn } from '@/shared/lib/cn'

export function KanbanColumn({ column, tasks, onTaskClick }) {
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [collapsed, setCollapsed] = useState(false)
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
    <div className={cn(
      "flex flex-col bg-[var(--bg-subtle)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] transition-[width,min-width,flex,background-color] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
      collapsed ? "w-[52px] min-w-[52px] flex-none" : "flex-1 min-w-0"
    )}>
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 z-10">
        {collapsed ? (
          <Button
            variant="ghost"
            onClick={() => setCollapsed(false)}
            className="flex flex-col items-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors mx-auto"
            title={`Expand ${column.title}`}
          >
            <Icons.chevronRight className="w-4 h-4" />
            <span className="text-xs font-medium [writing-mode:vertical-rl] rotate-180">{column.title}</span>
            <span className="text-[10px] font-medium text-[var(--text-tertiary)]">{tasks.length}</span>
          </Button>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <Heading level={4} className="text-sm font-semibold">{column.title}</Heading>
              <span className="flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--inset-highlight-soft)] text-[var(--text-secondary)] text-xs font-medium rounded-full w-5 h-5 tabular-nums">
                {tasks.length}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => setCollapsed(true)}
              className="text-[var(--text-tertiary)] hover:text-[var(--text-primary)] transition-colors duration-[var(--duration-fast)]"
              title="Collapse column"
            >
              <Icons.chevronLeft className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {collapsed ? null : (
      <>
      {/* Task List (Droppable Area) */}
      <div className="flex-1 px-3 pb-3 flex flex-col gap-3">
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
            className="bg-[var(--bg-elevated)] border border-[var(--accent-border)] rounded-[var(--radius-lg)] p-3 shadow-[var(--accent-glow),var(--inset-highlight)] mt-2 spring-in"
          >
            <Input
              autoFocus
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onBlur={() => !newTaskTitle.trim() && setIsQuickAdding(false)}
              placeholder="Task title..."
              className="w-full bg-transparent border-none outline-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] mb-3"
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
          <Button 
            variant="ghost"
            onClick={() => setIsQuickAdding(true)}
            className="flex items-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)] rounded-full p-2 text-sm font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] mt-2"
          >
            <Icons.plus className="w-4 h-4 mr-2" />
            Add Task
          </Button>
        )}
      </div>
      </>
      )}
    </div>
  )
}
import React, { useState } from 'react'
import { Heading } from '@/shared/ui/Typography'
import { useTaskList, useCompleteCrewTask, useDeleteTask } from '@/features/tasks/hooks/useTasks'
import { TasksTable } from '@/widgets/tasks/TasksTable'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import { toast } from 'sonner'

export function CrewTasksPage() {
  const { data: tasks = [], isLoading } = useTaskList({ scope: 'crew' })
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)
  
  const completeCrewTaskMutation = useCompleteCrewTask()
  const deleteTaskMutation = useDeleteTask()

  const handleQuickComplete = (task) => {
    const current = task.currentStatus?.toUpperCase()
    if (current === 'TODO' || current === 'IN_PROGRESS') {
      completeCrewTaskMutation.mutate(task.id)
    } else if (current === 'COMPLETED') {
      toast.info('Task is already completed')
    } else {
      toast.error('Crew task must be in TODO or IN_PROGRESS status to complete')
    }
  }

  const handleQuickDelete = (task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => toast.success(`Task deleted.`)
    })
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 flex flex-col min-h-[calc(100vh-8rem)]">
      <Heading level={2} className="mb-6">Crew Tasks</Heading>
      
      <div className="flex-1 min-h-0 relative">
        <TasksTable 
          tasks={tasks} 
          isLoading={isLoading} 
          rowSelection={rowSelection}
          setRowSelection={setRowSelection}
          onTaskClick={setSelectedTask}
          onQuickComplete={handleQuickComplete}
          onQuickDelete={handleQuickDelete}
        />
      </div>

      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  )
}

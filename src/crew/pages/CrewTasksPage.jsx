import React, { useState, useMemo } from 'react'
import { Heading } from '@/shared/ui/Typography'
import { useTaskList, useCompleteCrewTask, useDeleteTask } from '@/task'
import { TasksTable } from '@/task'
import { TaskPanel } from '@/task'
import { toast } from 'sonner'
import { PageHeader } from '@/shared/ui/PageHeader'
import {
  WorkspaceShell,
  ManagementLayout,
} from '@/shared/workspace-framework'

export function CrewTasksPage() {
  const { data: rawTasks = [], isLoading } = useTaskList({ scope: 'crew' })
  const tasks = useMemo(() => {
    if (!Array.isArray(rawTasks)) return []
    return rawTasks.filter(t => !!(t.crewId || t.crew))
  }, [rawTasks])
  const [rowSelection, setRowSelection] = useState({})
  const [selectedTask, setSelectedTask] = useState(null)
  
  const completeCrewTaskMutation = useCompleteCrewTask()
  const deleteTaskMutation = useDeleteTask()

  const handleQuickComplete = (task) => {
    const current = (task.currentStatus || task.status || '').toUpperCase().replace(/\s+/g, '_')
    if (current === 'COMPLETED' || current === 'DONE' || current === 'APPROVED') {
      toast.info('Task is already completed')
    } else {
      completeCrewTaskMutation.mutate(task.id)
    }
  }

  const handleQuickDelete = (task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => toast.success(`Task deleted.`)
    })
  }

  return (
    <WorkspaceShell maxWidth="wide">
      <ManagementLayout
        header={
          <PageHeader
            eyebrow="Crews"
            meta={`• ${tasks.length} tasks`}
            title="Crew Tasks"
            subtitle="Central execution table for tasks assigned across all your active crews."
          />
        }
      >
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
      </ManagementLayout>
    </WorkspaceShell>
  )
}

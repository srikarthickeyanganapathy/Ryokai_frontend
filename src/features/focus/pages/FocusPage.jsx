import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { isToday, parseISO } from 'date-fns'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Switch } from '@/shared/ui/Switch'
import { useTaskList, useUpdateTask, useCompletePersonalTask, useCompleteCrewTask, useSubmitTask, useClaimTask } from '@/features/tasks/hooks/useTasks'
import { CheckCircle2, Play, Circle, Maximize2, Minimize2, Settings } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { normalizeStatus, isDoneStatus, toBackendStatus } from '@/shared/lib/status'
import { FocusTimer } from '../components/FocusTimer'

export function FocusPage() {
  const { data: tasks = [], isLoading } = useTaskList()
  const updateTaskMutation = useUpdateTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  // FIX (SM-C01): crew tasks use the complete-crew endpoint
  const completeCrewTaskMutation = useCompleteCrewTask()
  const submitTaskMutation = useSubmitTask()

  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [showProgress, setShowProgress] = React.useState(true)
  const [showNextUp, setShowNextUp] = React.useState(true)

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const { todayTasks, currentTask, remainingTasks, remainingTime, progress } = useMemo(() => {
    
    const today = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)))
    
    const pending = today.filter(t => !isDoneStatus(t.status) && normalizeStatus(t.status) !== 'Canceled')
      .sort((a, b) => {
        const aInProgress = normalizeStatus(a.status) === 'In Progress';
        const bInProgress = normalizeStatus(b.status) === 'In Progress';
        if (aInProgress && !bInProgress) return -1
        if (!aInProgress && bInProgress) return 1
        return 0
      })

    const completedCount = today.filter(t => isDoneStatus(t.status)).length
    const totalCount = today.length
    const prog = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100)
    
    const remainingTime = pending.reduce((acc, t) => acc + (t.timeEstimateMinutes || 60), 0)

    return {
      todayTasks: today,
      currentTask: pending[0] || null,
      remainingTasks: pending.slice(1),
      remainingTime,
      progress: prog
    }
  }, [tasks])

  const completeCurrent = () => {
    if (currentTask) {
      if (currentTask.isPersonal) {
        completePersonalTaskMutation.mutate(currentTask.id)
      } else if (currentTask.crewId || currentTask.crew) {
        // FIX (SM-C01): crew tasks follow ASSIGNED -> COMPLETED (no review pipeline)
        const st = currentTask.currentStatus?.toUpperCase()
        if (st === 'ASSIGNED') {
          completeCrewTaskMutation.mutate(currentTask.id)
        }
      } else {
        // org task: if ASSIGNED or REJECTED, can submit it. If already SUBMITTED, we leave it to approve.
        // For simplicity in FocusMode, submit it if possible.
        const st = currentTask.currentStatus?.toUpperCase()
        if (st === 'ASSIGNED' || st === 'REJECTED') {
          submitTaskMutation.mutate(currentTask.id)
        }
      }
    }
  }

  const startNext = (task) => {
    if (task.crewId || task.crew) {
      const st = task.currentStatus?.toUpperCase()
      if (st === 'TODO') {
        claimTaskMutation.mutate(task.id)
      }
    }
  }

  if (isLoading) return <div className="p-8 text-center"><Text variant="muted">Loading focus...</Text></div>

  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-10 px-4 transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]",
      isFullscreen ? "fixed inset-0 z-[100] bg-[var(--bg-base)] overflow-y-auto" : "min-h-[calc(100vh-8rem)]"
    )}>
      <div className="w-full max-w-2xl my-auto">
        
        {/* Header Options */}
        <div className="flex items-center justify-between mb-16">
          <Heading level={3} className="text-[var(--text-secondary)] font-normal tracking-wide">
            Today's Focus
          </Heading>
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Settings className="w-4 h-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-56 p-4">
                <Heading level={4} className="text-sm mb-4">Focus Settings</Heading>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Text size="sm">Show Progress</Text>
                    <Switch checked={showProgress} onCheckedChange={setShowProgress} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Text size="sm">Show Next Up</Text>
                    <Switch checked={showNextUp} onCheckedChange={setShowNextUp} />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            <Button variant="ghost" size="icon" className="rounded-full" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Progress */}
        {showProgress && (
          <div className="mb-12">
            <div className="flex justify-between items-end mb-4">
              <Text variant="muted" className="uppercase tracking-widest text-xs font-semibold">
                Progress
              </Text>
              <Text className="text-2xl font-light text-[var(--text-primary)]">
                {progress}%
              </Text>
            </div>
            <div className="h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-[var(--accent)] rounded-full"
              />
            </div>
          </div>
        )}

        {/* Current Task */}
        <div className="mb-16">
          <Text variant="muted" className="uppercase tracking-widest text-xs font-semibold mb-6">
            Current Task
          </Text>
          
          {currentTask ? (
            <motion.div 
              layoutId={currentTask.id}
              className="group flex items-start gap-5 p-5 rounded-[var(--radius-lg)] glass-panel hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-all duration-[var(--duration-base)]"
            >
              <Button 
                variant="ghost"
                onClick={completeCurrent}
                className="mt-1 shrink-0 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors duration-[var(--duration-base)]"
              >
                <Circle className="w-8 h-8" strokeWidth={1.5} />
              </Button>
              
              <div className="flex-1 min-w-0">
                <h2 className="text-3xl font-medium text-[var(--text-primary)] leading-tight mb-3">
                  {currentTask.title}
                </h2>
                <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
                  {currentTask.timeEstimateMinutes > 0 && (
                    <span className="flex items-center gap-1.5">
                      <Play className="w-3.5 h-3.5" />
                      {Math.floor(currentTask.timeEstimateMinutes / 60)}h {currentTask.timeEstimateMinutes % 60}m
                    </span>
                  )}
                  {currentTask.projectId && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-[11px] font-medium uppercase tracking-wider">
                      Project
                    </span>
                  )}
                </div>
                <div className="mt-5">
                  <FocusTimer task={currentTask} />
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="text-center p-12 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-default)]">
              <CheckCircle2 className="w-12 h-12 mx-auto text-[var(--accent)] mb-4 opacity-50" />
              <Heading level={4} className="mb-2">All caught up</Heading>
              <Text variant="muted">You have completed all your tasks for today.</Text>
            </div>
          )}
        </div>

        {/* Next Up */}
        {showNextUp && remainingTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <Text variant="muted" className="uppercase tracking-widest text-xs font-semibold">
                Next Up
              </Text>
              <Text size="sm" variant="muted">
                {remainingTasks.length} tasks • {Math.floor(remainingTime / 60)}h {remainingTime % 60}m
              </Text>
            </div>
            
            <div className="space-y-3">
              {remainingTasks.slice(0, 4).map(task => (
                <div 
                  key={task.id}
                  className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--bg-base)] border border-[var(--color-border-subtle)] hover:bg-[var(--bg-elevated)] hover:border-[var(--accent-border)] transition-all duration-[var(--duration-base)] group cursor-pointer"
                  onClick={() => startNext(task)}
                >
                  <div className="flex items-center gap-4">
                    <Circle className="w-5 h-5 text-[var(--text-muted)] opacity-50 group-hover:opacity-100 transition-opacity" />
                    <span className="text-base text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] font-medium transition-colors">
                      {task.title}
                    </span>
                  </div>
                  {task.timeEstimateMinutes > 0 && (
                    <Text size="sm" variant="muted" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      {Math.floor(task.timeEstimateMinutes / 60)}h {task.timeEstimateMinutes % 60}m
                    </Text>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
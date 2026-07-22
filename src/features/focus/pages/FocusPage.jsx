import React, { useMemo, useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { isToday, parseISO } from 'date-fns'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Switch } from '@/shared/ui/Switch'
import { useTaskList, useUpdateTask, useCompletePersonalTask, useCompleteCrewTask, useSubmitTask, useClaimTask } from '@/features/tasks/hooks/useTasks'
import { CheckCircle2, Play, Circle, Maximize2, Minimize2, Settings, Sparkles, Flame, Moon, Check, Calendar, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { normalizeStatus, isDoneStatus, toBackendStatus } from '@/shared/lib/status'
import { FocusTimer } from '../components/FocusTimer'

export function FocusPage() {
  const { data: tasks = [], isLoading } = useTaskList()
  const updateTaskMutation = useUpdateTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()
  const submitTaskMutation = useSubmitTask()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showProgress, setShowProgress] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const zenContainerRef = useRef(null)

  // Native HTML5 Videoplayer-style Element Fullscreen Integration
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isNativeFullscreen = Boolean(
        document.fullscreenElement || 
        document.webkitFullscreenElement || 
        document.mozFullScreenElement
      )
      setIsFullscreen(isNativeFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    }
  }, [])

  const toggleFullscreen = async () => {
    try {
      const activeFS = document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement
      if (!activeFS) {
        const target = zenContainerRef.current || document.documentElement
        if (target.requestFullscreen) {
          await target.requestFullscreen()
        } else if (target.webkitRequestFullscreen) {
          await target.webkitRequestFullscreen()
        } else if (target.msRequestFullscreen) {
          await target.msRequestFullscreen()
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if (document.webkitExitFullscreen) {
          await document.webkitExitFullscreen()
        }
      }
    } catch (err) {
      console.error('Fullscreen request error:', err)
      setIsFullscreen(prev => !prev)
    }
  }

  const { todayTasks, currentTask, remainingTime, progress, completedCount, totalCount } = useMemo(() => {
    const today = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)))
    
    const pending = today.filter(t => !isDoneStatus(t.status) && normalizeStatus(t.status) !== 'Canceled')
      .sort((a, b) => {
        const aInProgress = normalizeStatus(a.status) === 'In Progress';
        const bInProgress = normalizeStatus(b.status) === 'In Progress';
        if (aInProgress && !bInProgress) return -1
        if (!aInProgress && bInProgress) return 1
        return 0
      })

    const completed = today.filter(t => isDoneStatus(t.status)).length
    const total = today.length
    const prog = total === 0 ? 0 : Math.round((completed / total) * 100)
    
    const remainingTime = pending.reduce((acc, t) => acc + (t.timeEstimateMinutes || 60), 0)

    const active = selectedTaskId 
      ? today.find(t => t.id === selectedTaskId) || pending[0] || null
      : pending[0] || null

    return {
      todayTasks: today,
      currentTask: active,
      remainingTime,
      progress: prog,
      completedCount: completed,
      totalCount: total
    }
  }, [tasks, selectedTaskId])

  const completeTask = (taskToComplete) => {
    if (!taskToComplete) return
    if (taskToComplete.isPersonal) {
      completePersonalTaskMutation.mutate(taskToComplete.id)
    } else if (taskToComplete.crewId || taskToComplete.crew) {
      completeCrewTaskMutation.mutate(taskToComplete.id)
    } else {
      submitTaskMutation.mutate(taskToComplete.id)
    }
  }

  if (isLoading) return <div className="p-8 text-center"><Text variant="muted">Loading Zen focus sanctuary...</Text></div>

  const mainContent = (
    <div 
      ref={zenContainerRef}
      className={cn(
        "flex flex-col transition-all duration-500 ease-out select-none max-w-7xl mx-auto w-full min-w-0 overflow-hidden text-[var(--text-primary)] [&:fullscreen]:w-screen [&:fullscreen]:h-screen [&:fullscreen]:bg-[#09090b] [&:fullscreen]:p-6 [&:fullscreen]:md:p-12 [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:justify-center [&:fullscreen]:items-center [&:fullscreen]:overflow-y-auto",
        isFullscreen 
          ? "fixed inset-0 z-[999999] bg-[#09090b] w-screen h-screen p-6 md:p-12 flex flex-col justify-center items-center overflow-y-auto" 
          : "h-full min-h-0 flex-1 py-2 px-2 sm:px-4"
      )}
    >
      
      {/* ZEN AMBIENT BACKDROP GLOW */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center opacity-20">
        <div className="w-[600px] h-[600px] rounded-full bg-radial from-[var(--accent)]/30 to-transparent blur-3xl" />
      </div>

      {/* Floating Exit Button in Fullscreen Mode */}
      {isFullscreen && (
        <div className="absolute top-6 right-6 z-50 flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full w-9 h-9 bg-[var(--bg-elevated)] border-[var(--color-border-subtle)]">
                <Settings className="w-4 h-4 text-[var(--text-secondary)]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-4">
              <Heading level={4} className="text-sm mb-4">Focus Settings</Heading>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Text size="sm">Show Progress Bar</Text>
                  <Switch checked={showProgress} onCheckedChange={setShowProgress} />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-9 h-9 bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            onClick={toggleFullscreen}
            title="Exit Zen Mode"
          >
            <Minimize2 className="w-4.5 h-4.5" />
          </Button>
        </div>
      )}

      <div className="w-full relative z-10 space-y-4 my-auto flex flex-col justify-center">
        
        {/* ⚡ EXECUTE MODE STICKY HEADER (Hidden in Fullscreen for 1st Image Match) */}
        {!isFullscreen && (
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)] shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[9px] uppercase tracking-wider font-semibold flex items-center gap-1">
                  <Moon className="w-3 h-3" />
                  EXECUTE Mode
                </span>
                <span className="text-[11px] text-[var(--text-muted)] truncate">• Distraction-Free Zen Sanctuary</span>
              </div>
              <Heading level={2} className="tracking-tight text-lg sm:text-xl font-semibold mb-0">Zen Focus Stage</Heading>
            </div>
            <div className="flex items-center gap-2 text-[var(--text-muted)]">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
                    <Settings className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-4">
                  <Heading level={4} className="text-sm mb-4">Focus Settings</Heading>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Text size="sm">Show Progress Bar</Text>
                      <Switch checked={showProgress} onCheckedChange={setShowProgress} />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full w-8 h-8"
                onClick={toggleFullscreen}
                title="Enter Zen Mode"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* 2-COLUMN RESPONSIVE SPLIT LAYOUT (LEFT: POMODORO STAGE, RIGHT: TODAY'S TASKS) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-stretch">
          
          {/* LEFT COLUMN: ZEN POMODORO TIMER STAGE */}
          <div className="xl:col-span-7 space-y-4 w-full min-w-0 flex flex-col">
            <div className="p-4 sm:p-6 rounded-3xl bg-[var(--bg-elevated)]/70 backdrop-blur-xl border border-[var(--color-border-subtle)] shadow-xl flex-1 flex flex-col justify-center space-y-4">
              
              {/* CURRENT ACTIVE TARGET HEADER */}
              {currentTask ? (
                <div className="text-center space-y-1.5 shrink-0">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] text-[11px] font-semibold border border-[var(--accent-border)]">
                    <Flame className="w-3 h-3" />
                    <span>Active Target</span>
                  </div>
                  <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--text-primary)] truncate max-w-md mx-auto">
                    {currentTask.title}
                  </h1>
                  <div className="flex items-center justify-center gap-2 pt-0.5">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => completeTask(currentTask)}
                      className="rounded-full text-xs h-7 px-3 gap-1 border-[var(--accent-border)] hover:bg-[var(--accent-soft)] text-[var(--accent)]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Mark Complete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2 space-y-1 shrink-0">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-[var(--accent)] opacity-60" />
                  <Heading level={4} className="text-sm font-semibold">No active task queued</Heading>
                  <Text variant="muted" className="text-[11px]">Select a task from today's list on the right or take a rest break.</Text>
                </div>
              )}

              {/* CIRCULAR ZEN POMODORO TIMER */}
              <FocusTimer task={currentTask} />
            </div>
          </div>

          {/* RIGHT COLUMN: TODAY'S TASKS TO BE COMPLETED */}
          <div className="xl:col-span-5 space-y-4 w-full min-w-0 flex flex-col">
            
            {/* TODAY's HEADER & PROGRESS CARD */}
            <div className="p-4 rounded-2xl bg-[var(--bg-elevated)]/80 border border-[var(--color-border-subtle)] space-y-3 shadow-sm shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <Text variant="muted" className="uppercase tracking-widest text-[9px] font-mono font-semibold flex items-center gap-1 text-[var(--accent)]">
                    <Calendar className="w-3 h-3" />
                    Today's Target List
                  </Text>
                  <Heading level={3} className="text-sm font-bold mt-0.5">
                    {completedCount} of {totalCount} Tasks Complete
                  </Heading>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold font-mono text-[var(--text-primary)]">{progress}%</span>
                </div>
              </div>

              {/* PROGRESS BAR */}
              {showProgress && (
                <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-[var(--accent)] to-emerald-400 rounded-full"
                  />
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] pt-0.5 border-t border-[var(--color-border-subtle)]">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> ~{Math.floor(remainingTime / 60)}h {remainingTime % 60}m remaining
                </span>
                <span>Click task to target</span>
              </div>
            </div>

            {/* TASKS SCROLLABLE LIST */}
            <div className="space-y-2 max-h-[260px] sm:max-h-[300px] xl:max-h-[340px] overflow-y-auto custom-scrollbar pr-1 flex-1">
              {todayTasks.length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-[var(--bg-base)] border border-dashed border-[var(--color-border-subtle)] space-y-1.5">
                  <CheckCircle2 className="w-7 h-7 mx-auto text-[var(--text-muted)] opacity-50" />
                  <Text className="text-xs font-medium">No tasks scheduled for today</Text>
                  <Text variant="muted" className="text-[11px]">Enjoy your relaxed Zen day!</Text>
                </div>
              )}

              {todayTasks.map(task => {
                const isDone = isDoneStatus(task.status)
                const isCurrentTarget = currentTask?.id === task.id

                return (
                  <div
                    key={task.id}
                    onClick={() => !isDone && setSelectedTaskId(task.id)}
                    className={cn(
                      "group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none",
                      isCurrentTarget
                        ? "bg-[var(--accent-soft)]/60 border-[var(--accent)] shadow-sm"
                        : isDone
                        ? "bg-[var(--bg-base)] opacity-60 border-[var(--color-border-subtle)]"
                        : "bg-[var(--bg-base)] hover:bg-[var(--bg-elevated)] border-[var(--color-border-subtle)] hover:border-[var(--accent-border)]"
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          completeTask(task)
                        }}
                        className={cn(
                          "w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                          isDone
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "border-[var(--color-border-subtle)] hover:border-[var(--accent)] text-transparent hover:text-[var(--accent)]"
                        )}
                        title={isDone ? "Task Completed" : "Mark Complete"}
                      >
                        <Check className="w-3 h-3 stroke-[3]" />
                      </button>

                      <div className="min-w-0 flex-1">
                        <span className={cn(
                          "text-xs font-medium block truncate",
                          isDone ? "line-through text-[var(--text-muted)]" : "text-[var(--text-primary)]"
                        )}>
                          {task.title}
                        </span>
                        {task.timeEstimateMinutes > 0 && (
                          <span className="text-[10px] font-mono text-[var(--text-muted)]">
                            {Math.floor(task.timeEstimateMinutes / 60)}h {task.timeEstimateMinutes % 60}m
                          </span>
                        )}
                      </div>
                    </div>

                    {isCurrentTarget && !isDone && (
                      <span className="px-2 py-0.5 rounded-full bg-[var(--accent)] text-white font-mono text-[9px] uppercase font-semibold flex items-center gap-1 shrink-0 ml-2">
                        Targeting <ArrowRight className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

          </div>

        </div>

      </div>
    </div>
  )

  return mainContent
}
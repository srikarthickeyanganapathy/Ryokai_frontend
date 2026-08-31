import React, { useMemo, useState, useEffect, useRef } from 'react'
import { isToday, parseISO } from 'date-fns'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Switch } from '@/shared/ui/Switch'
import { useTaskList, useUpdateTask, useClaimTask, useCompletePersonalTask, useCompleteCrewTask, useSubmitTask } from '@/task'
import { Check, Settings, Maximize2, Minimize2 } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { normalizeStatus, isDoneStatus } from '@/shared/lib/status'
import { FocusTimer, useActiveFocus } from '@/focus'
import { PageShell } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import './focus-stage.css'
import { Skeleton } from '@/shared/ui/Skeleton';

const fmtDur = (m) => `${Math.floor(m / 60)}h ${m % 60}m`

const StarGlyph = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path d="m12 2 2.9 6.3 6.9.8-5.1 4.7 1.4 6.8-6.1-3.5-6.1 3.5 1.4-6.8L2.2 9.1l6.9-.8z" />
  </svg>
)

function Starfield({ count = 80 }) {
  const stars = useMemo(() => Array.from({ length: count }, () => {
    const r = Math.random()
    const cls = r < 0.08 ? 'fz-star b' : r < 0.2 ? 'fz-star y' : r < 0.32 ? 'fz-star c' : r < 0.5 ? 'fz-star s' : 'fz-star'
    return {
      left: (Math.random() * 100).toFixed(2),
      top: (Math.random() * 100).toFixed(2),
      delay: (Math.random() * 5).toFixed(2),
      dur: (3 + Math.random() * 4).toFixed(2),
      cls,
    }
  }), [count])
  return (
    <div className="fz-stars" aria-hidden="true">
      {stars.map((s, i) => (
        <span
          key={i}
          className={s.cls}
          style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, animationDuration: `${s.dur}s` }}
        />
      ))}
    </div>
  )
}

export function FocusPage() {
  const { data: { tasks = [] } = {}, isLoading } = useTaskList()
  const updateTaskMutation = useUpdateTask()
  const claimTaskMutation = useClaimTask()
  const completePersonalTaskMutation = useCompletePersonalTask()
  const completeCrewTaskMutation = useCompleteCrewTask()
  const submitTaskMutation = useSubmitTask()
  const { data: activeSession } = useActiveFocus()

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showProgress, setShowProgress] = useState(true)
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [railCollapsed, setRailCollapsed] = useState(false)
  const zenContainerRef = useRef(null)
  const centerRef = useRef(null)

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

  useEffect(() => {
    if (!window.matchMedia || !window.matchMedia('(pointer:fine)').matches) return
    let tx = 0, ty = 0, cx = 0, cy = 0, raf = null
    const onMove = (e) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 14
      ty = (e.clientY / window.innerHeight - 0.5) * 10
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const loop = () => {
      cx += (tx - cx) * 0.06
      cy += (ty - cy) * 0.06
      if (centerRef.current) {
        centerRef.current.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`
      }
      raf = Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05 ? requestAnimationFrame(loop) : null
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  const busy =
    completePersonalTaskMutation.isPending ||
    completeCrewTaskMutation.isPending ||
    submitTaskMutation.isPending

  const pageState = isLoading ? 'loading' : 'ready'

  return (
    <PageShell maxWidth="default">
      <PageState state={pageState} stateProps={{skeleton: <FocusSkeleton />,  loadingVariant: 'dashboard' }}>
        <div
          ref={zenContainerRef}
          className={cn(
            'fz-stage relative w-full min-w-0 overflow-hidden transition-all duration-500',
            'bg-[var(--bg-base)] [&:fullscreen]:bg-[var(--bg-base)]',
            isFullscreen
              ? 'fixed inset-0 z-[999999] w-screen h-screen items-center justify-center'
              : 'py-2'
          )}
        >
          <Starfield />
          <div className="fz-nebula n1" />
          <div className="fz-nebula n2" />
          <div className="fz-nebula n3" />
          <div className="fz-vignette" />

          {/* Floating HUD */}
          <div className="fz-hud">
            <div className="fz-hud-brand font-mono">
              <span className="fz-hud-divider" />
              <span>Zen Focus</span>
            </div>
            <div className="fz-hud-actions">
              <span className="fz-hud-status font-mono">
                <i className="fz-dot" />
                {activeSession ? 'Session live' : 'Focus ready'}
              </span>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full w-9 h-9 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--text-secondary)]"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-4">
                  <Heading level={4} className="text-sm mb-4">Focus Settings</Heading>
                  <div className="flex items-center justify-between">
                    <Text size="sm">Show Progress Bar</Text>
                    <Switch checked={showProgress} onCheckedChange={setShowProgress} />
                  </div>
                </PopoverContent>
              </Popover>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                title={isFullscreen ? 'Exit Zen Mode' : 'Enter Zen Mode'}
                className="rounded-full w-9 h-9 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Center instrument */}
          <div ref={centerRef} className="fz-center">
            {currentTask ? (
              <div className="fz-plaque">
                <span className="fz-lockchip font-mono"><i className="fz-xhair" /> Target Lock</span>
                <h2 className="fz-plaque-title">{currentTask.title}</h2>
                <span className="fz-plaque-sub font-mono">
                  {currentTask.isPersonal ? 'Personal' : (currentTask.crewId || currentTask.crew) ? 'Crew' : 'Submit'}   {fmtDur(currentTask.timeEstimateMinutes || 60)}
                </span>
                <button
                  type="button"
                  className="fz-key"
                  disabled={busy}
                  onClick={() => completeTask(currentTask)}
                  title="Mark complete"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
              </div>
            ) : (
              <div className="fz-plaque">
                <span className="fz-lockchip font-mono"><i className="fz-xhair" /> No Target</span>
                <h2 className="fz-plaque-title" style={{ color: 'var(--text-tertiary)' }}>The sky is clear tonight</h2>
                <span className="fz-plaque-sub font-mono">Pick a star from the chart</span>
              </div>
            )}

            <FocusTimer task={currentTask} />
          </div>

          {/* Star Chart rail */}
          <aside className={cn('fz-rail', railCollapsed && 'collapsed')}>
            <div className="fz-rail-head">
              <span className="fz-rail-title font-mono" data-count={totalCount}>
                <StarGlyph />
                <span>Star Chart</span>
              </span>
              <button
                type="button"
                className="fz-rail-collapse"
                onClick={() => setRailCollapsed(c => !c)}
                title={railCollapsed ? 'Expand chart' : 'Collapse chart'}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="m15 18-6-6 6-6" /></svg>
              </button>
            </div>
            <div className="fz-rail-meta">
              <span className="fz-rail-cnt tnum">{completedCount} of {totalCount} done</span>
              <span className="fz-rail-pct tnum">{progress}%</span>
            </div>
            {showProgress && (
              <div className="fz-constellation">
                <div
                  className={cn('fz-constfill', progress > 0 && progress < 100 && 'lit')}
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}
            <div className="fz-rail-tasks">
              {todayTasks.length === 0 && (
                <div className="fz-rail-empty">
                  <span className="fz-rail-empty-star"> </span>
                  <p>No tasks scheduled for today</p>
                  <span>Enjoy your clear sky.</span>
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
                      'fz-trow',
                      isCurrentTarget && !isDone && 'locked',
                      isDone && 'done'
                    )}
                  >
                    <button
                      type="button"
                      className="fz-star-glyph"
                      onClick={(e) => { e.stopPropagation(); completeTask(task) }}
                      title={isDone ? 'Task Completed' : 'Mark Complete'}
                    >
                      <StarGlyph />
                    </button>

                    <div className="fz-tinfo">
                      <span className={cn('fz-tinfo-title', isDone && 'done')}>{task.title}</span>
                      {task.timeEstimateMinutes > 0 && (
                        <span className="fz-tinfo-est tnum">{fmtDur(task.timeEstimateMinutes)}</span>
                      )}
                    </div>

                    {isCurrentTarget && !isDone && (
                      <span className="fz-lock-tag font-mono">Locked</span>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="fz-rail-foot font-mono">
              <span className="tnum">~{Math.floor(remainingTime / 60)}h {remainingTime % 60}m left</span>
              <span>Click a star to lock</span>
            </div>
          </aside>
        </div>
      </PageState>
    </PageShell>
  )
}

function FocusSkeleton() {
  return (
    <div className="fz-stage relative w-full min-w-0 overflow-hidden py-2">
      <div className="fz-hud">
        <div className="fz-hud-brand font-mono">
          <span className="fz-hud-divider" />
          <Skeleton className="h-3 w-24 rounded" />
        </div>
        <div className="fz-hud-actions">
          <Skeleton className="h-8 w-28 rounded-full" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </div>
      <div className="fz-center">
        <div className="fz-plaque items-center text-center">
          <Skeleton className="h-4 w-28 rounded-full mx-auto" />
          <Skeleton className="h-6 w-64 rounded-lg mx-auto mt-2" />
          <Skeleton className="h-3 w-40 rounded mx-auto mt-2" />
          <Skeleton className="w-36 h-36 rounded-full mx-auto mt-6" />
        </div>
      </div>
      <aside className="fz-rail">
        <div className="fz-rail-head"><Skeleton className="h-4 w-28 rounded" /></div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-2">
            <Skeleton className="w-6 h-6 rounded-md shrink-0" />
            <div className="flex-1 space-y-1"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-2.5 w-1/2" /></div>
          </div>
        ))}
      </aside>
    </div>
  );
}

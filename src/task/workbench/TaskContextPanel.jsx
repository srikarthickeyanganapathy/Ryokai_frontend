import React, { useCallback, useRef, useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TaskPanel } from '../components/TaskPanel/TaskPanel'
import { Icons } from '@/shared/ui/Icons'
import { Button } from '@/shared/ui/Button'

/**
 * TaskContextPanel
 *
 * Thin wrapper around the canonical TaskPanel.
 *
 * CRITICAL: TaskPanel.jsx already handles its own animation via motion.aside.
 * We do NOT wrap it with another AnimatePresence/motion — that causes double-animation glitches.
 *
 * This component adds:
 *   - Desktop: resize handle (3px draggable left edge)
 *   - Mobile (<768px): fullscreen overlay with back button
 *   - Loading/error skeletons (replace TaskPanel while loading)
 */
const MOBILE_BREAKPOINT = 768

export function TaskContextPanel({
  task,
  isOpen,
  onClose,
  width = 420,
  onWidthChange,
  isLoading = false,
  isError = false,
  onRetry,
}) {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false,
  )
  const dragRef = useRef({ dragging: false, startX: 0, startWidth: 0 })

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const handleDragStart = useCallback(
    (e) => {
      if (isMobile) return
      e.preventDefault()
      dragRef.current = { dragging: true, startX: e.clientX, startWidth: width }
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
      const move = (me) => {
        if (!dragRef.current.dragging) return
        const delta = dragRef.current.startX - me.clientX
        onWidthChange?.(Math.min(640, Math.max(320, dragRef.current.startWidth + delta)))
      }
      const up = () => {
        dragRef.current.dragging = false
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
        window.removeEventListener('mousemove', move)
        window.removeEventListener('mouseup', up)
      }
      window.addEventListener('mousemove', move)
      window.addEventListener('mouseup', up)
    },
    [width, onWidthChange, isMobile],
  )

  /* ── Mobile: full-screen overlay ── */
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-50 bg-[var(--bg-base)] flex flex-col"
          >
            <div className="flex items-center justify-between h-11 px-3 shrink-0 border-b border-[var(--color-border-subtle)] bg-[var(--bg-card)]">
              <button
                onClick={onClose}
                className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--accent)]"
              >
                <Icons.chevronLeft className="w-4 h-4" />
                Tasks
              </button>
              <span className="text-[11px] text-[var(--text-muted)] truncate max-w-[55%]">
                {task?.title || 'Task'}
              </span>
              <div className="w-6" />
            </div>
            <div className="flex-1 overflow-hidden">
              {isLoading ? <PanelSkeleton /> : isError ? <PanelError onRetry={onRetry} /> : task ? (
                <TaskPanel task={task} isOpen={true} onClose={onClose} />
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    )
  }

  /* ── Desktop: TaskPanel handles its own animation ── */
  if (!isOpen) return null

  return (
    <div className="flex shrink-0 h-full">
      {/* Resize handle — user drags left to resize */}
      <div
        onMouseDown={handleDragStart}
        className="w-[3px] shrink-0 cursor-col-resize hover:bg-[var(--accent)]/30 transition-colors z-10"
      />

      {/* Loading / Error / TaskPanel */}
      {isLoading ? (
        <PanelSkeleton />
      ) : isError ? (
        <div className="border-l border-[var(--color-border-subtle)] h-full">
          <PanelError onRetry={onRetry} />
        </div>
      ) : task ? (
        <div className="h-full border-l border-[var(--color-border-subtle)] flex flex-col shrink-0" style={{ width }}>
          <TaskPanel task={task} isOpen={isOpen} onClose={onClose} isDocked={true} />
        </div>
      ) : null}
    </div>
  )
}

/* ── Panel loading skeleton ── */
function PanelSkeleton() {
  return (
    <div className="h-full flex flex-col animate-pulse border-l border-[var(--color-border-subtle)] bg-[var(--bg-card)]" style={{ width: 420 }}>
      <div className="h-1 bg-[var(--bg-subtle)]" />
      <div className="px-5 py-3 space-y-2">
        <div className="h-4 w-16 bg-[var(--bg-subtle)] rounded" />
        <div className="h-6 w-48 bg-[var(--bg-subtle)] rounded" />
        <div className="flex gap-2">
          <div className="h-5 w-20 bg-[var(--bg-subtle)] rounded-full" />
          <div className="h-5 w-16 bg-[var(--bg-subtle)] rounded-full" />
        </div>
      </div>
      <div className="flex border-b border-[var(--color-border-subtle)]">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 flex-1 bg-[var(--bg-subtle)] m-1 rounded" />
        ))}
      </div>
      <div className="flex-1 p-5 space-y-4">
        <div className="h-4 w-full bg-[var(--bg-subtle)] rounded" />
        <div className="h-4 w-3/4 bg-[var(--bg-subtle)] rounded" />
        <div className="h-3 w-1/2 bg-[var(--bg-subtle)] rounded" />
        <div className="h-20 bg-[var(--bg-subtle)] rounded-lg mt-4" />
        <div className="h-20 bg-[var(--bg-subtle)] rounded-lg" />
      </div>
    </div>
  )
}

/* ── Panel error ── */
function PanelError({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6" style={{ width: 420 }}>
      <div className="w-10 h-10 rounded-full bg-[var(--danger-soft)] flex items-center justify-center">
        <Icons.alert className="w-5 h-5 text-[var(--danger)]" />
      </div>
      <div>
        <div className="text-[13px] font-semibold text-[var(--text-primary)]">Unable to load task</div>
        <div className="text-[11px] text-[var(--text-muted)] mt-1">The task details could not be loaded.</div>
      </div>
      {onRetry && (
        <Button size="xs" variant="outline" onClick={onRetry} className="gap-1">
          <Icons.refresh className="w-3 h-3" />
          Retry
        </Button>
      )}
    </div>
  )
}

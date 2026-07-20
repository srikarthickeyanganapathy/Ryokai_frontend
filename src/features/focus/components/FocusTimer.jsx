import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Play, Square, Timer as TimerIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useActiveFocus, useStartFocus, useStopFocus } from '../hooks/useFocus'

export function FocusTimer({ task }) {
  const { data: activeSession, isLoading: activeLoading } = useActiveFocus()
  const startMutation = useStartFocus()
  const stopMutation = useStopFocus()

  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const intervalRef = useRef(null)
  const lastTickRef = useRef(null)

  const status = activeSession ? 'running' : 'idle'

  // Hydrate elapsed time from the server-known startedAt on mount / when
  // an active session is (re)discovered — this is what makes a page
  // refresh resume the clock correctly instead of resetting to 0.
  useEffect(() => {
    if (activeSession?.startedAt) {
      const startedMs = new Date(activeSession.startedAt).getTime()
      setElapsedSeconds(Math.max(0, Math.round((Date.now() - startedMs) / 1000)))
      startInterval()
    } else {
      stopInterval()
      setElapsedSeconds(0)
    }
    return stopInterval
  }, [activeSession?.id])

  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }

  const startInterval = () => {
    stopInterval()
    lastTickRef.current = Date.now()
    intervalRef.current = setInterval(() => {
      const now = Date.now()
      const deltaSec = Math.round((now - lastTickRef.current) / 1000)
      lastTickRef.current = now
      setElapsedSeconds(prev => prev + deltaSec)
    }, 1000)
  }

  const handleStart = useCallback(() => {
    startMutation.mutate(task?.id)
  }, [task?.id, startMutation])

  const handleStop = useCallback(() => {
    if (activeSession?.id) {
      stopMutation.mutate(activeSession.id)
    }
  }, [activeSession?.id, stopMutation])

  const formatTime = (totalSeconds) => {
    const h = Math.floor(totalSeconds / 3600)
    const m = Math.floor((totalSeconds % 3600) / 60)
    const s = totalSeconds % 60
    const pad = (n) => String(n).padStart(2, '0')
    return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
  }

  if (activeLoading) return null

  return (
    <div className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)] glass-panel border border-[var(--color-border-subtle)]">
      <div className="flex items-center gap-3 min-w-[140px]">
        <div
          className={cn(
            'relative flex h-9 w-9 items-center justify-center rounded-full shrink-0',
            status === 'running'
              ? 'bg-[var(--accent)]/15 text-[var(--accent)]'
              : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
          )}
        >
          {status === 'running' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-20" />
          )}
          <TimerIcon className="w-4 h-4 relative z-10" strokeWidth={1.75} />
        </div>
        <div>
          <Text
            className={cn(
              'text-2xl font-medium tabular-nums leading-none',
              status === 'idle' ? 'text-[var(--text-muted)]' : 'text-[var(--text-primary)]'
            )}
          >
            {formatTime(elapsedSeconds)}
          </Text>
          <Text size="sm" variant="muted" className="mt-0.5">
            {status === 'running' ? 'Focusing…' : 'Not started'}
          </Text>
        </div>
      </div>

      <div className="w-px h-8 bg-[var(--color-border-subtle)]" />

      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait" initial={false}>
          {status === 'idle' && (
            <motion.div key="start" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }}>
              <Button
                size="sm"
                onClick={handleStart}
                disabled={!task || startMutation.isPending}
                className="rounded-full gap-1.5 bg-[var(--accent)] text-[var(--bg-base)] hover:opacity-90"
              >
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                Start Focus
              </Button>
            </motion.div>
          )}

          {status === 'running' && (
            <motion.div key="running-controls" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.15 }} className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleStop}
                disabled={stopMutation.isPending}
                className="rounded-full gap-1.5"
              >
                <Square className="w-3 h-3" />
                Stop
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

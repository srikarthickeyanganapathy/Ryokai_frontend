import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { motion } from 'framer-motion'
import { Button, IconButton } from '@/shared/ui/Button'
import { Play, Pause, RotateCcw, Sparkles, Flame, Volume2, VolumeX } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useActiveFocus, useStartFocus, useStopFocus } from '../hooks/useFocus'
import '../../pages/focus-stage.css'

const POMODORO_MODES = [
  { id: 'focus', label: '25m Focus', minutes: 25 },
  { id: 'shortBreak', label: '5m Break', minutes: 5 },
  { id: 'longBreak', label: '15m Reset', minutes: 15 },
]

/**
 * THE PULSAR — the timer is the Ryokai brand instrument:
 * a tilted accretion disk (elliptical progress), a white-hot core
 * (clock), a relativistic jet (running state) and orbiting
 * accretion nodes (pomodoro counter). Presentation-only rewrite:
 * state, hooks and API contracts are unchanged.
 */
export function FocusTimer({ task, onTaskComplete }) {
  const { data: activeSession, isLoading: activeLoading } = useActiveFocus()
  const startMutation = useStartFocus()
  const stopMutation = useStopFocus()

  const [mode, setMode] = useState('focus') // 'focus' | 'shortBreak' | 'longBreak'
  const [isRunning, setIsRunning] = useState(false)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [completedPomodoros, setCompletedPomodoros] = useState(1)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const currentMode = POMODORO_MODES.find(m => m.id === mode) || POMODORO_MODES[0]
  const totalSeconds = currentMode.minutes * 60
  const progressPercent = Math.min(100, Math.max(0, ((totalSeconds - timeLeft) / totalSeconds) * 100))

  const intervalRef = useRef(null)
  const diskRef = useRef(null)
  const diskLenRef = useRef(null)

  // Switch modes and set countdown target
  const selectMode = (newModeId) => {
    const target = POMODORO_MODES.find(m => m.id === newModeId) || POMODORO_MODES[0]
    setMode(newModeId)
    setIsRunning(false)
    setTimeLeft(target.minutes * 60)
  }

  // Play gentle Web Audio API chime
  const playChime = useCallback(() => {
    if (!soundEnabled) return
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5
      gain.gain.setValueAtTime(0.1, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + 1.5)
    } catch (e) {
      // Audio context fallback
    }
  }, [soundEnabled])

  // Handle countdown interval
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current)
            setIsRunning(false)
            playChime()

            if (mode === 'focus') {
              setCompletedPomodoros(c => c + 1)
              // Auto suggest short break
              selectMode('shortBreak')
            } else {
              selectMode('focus')
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning, mode, playChime])

  const toggleStartPause = () => {
    if (!isRunning && mode === 'focus' && task?.id) {
      startMutation.mutate(task.id)
    } else if (isRunning && activeSession?.id) {
      stopMutation.mutate(activeSession.id)
    }
    setIsRunning(!isRunning)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(totalSeconds)
  }

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    const pad = (n) => String(n).padStart(2, '0')
    return `${pad(m)}:${pad(s)}`
  }

  // Elliptical accretion-disk progress (path-based dashoffset)
  useLayoutEffect(() => {
    const path = diskRef.current
    if (!path) return
    if (diskLenRef.current == null) {
      diskLenRef.current = path.getTotalLength()
      path.style.strokeDasharray = diskLenRef.current
    }
    path.style.strokeDashoffset = diskLenRef.current * (1 - progressPercent / 100)
  }, [progressPercent])

  return (
    <div className="flex flex-col items-center justify-center gap-4 w-full select-none">
      {/* POMODORO MODE SELECTOR PILLS */}
      <div className="fz-modes">
        {POMODORO_MODES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            className={cn('fz-mode-pill', mode === m.id && 'on')}
          >
            {m.id === 'focus' && <Flame className="w-3.5 h-3.5" />}
            {m.id === 'shortBreak' && <Sparkles className="w-3.5 h-3.5" />}
            {m.id === 'longBreak' && <RotateCcw className="w-3.5 h-3.5" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* THE PULSAR */}
      <div className={cn('fz-pulsar', isRunning && 'running')}>
        {/* relativistic jet beam */}
        <div className="fz-jet" />

        {/* tilted accretion disk + elliptical progress */}
        <div className="fz-disk-tilt">
          <svg viewBox="-250 -160 500 320">
            <defs>
              <linearGradient id="fzDiskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="var(--pulsar-disk-a)" />
                <stop offset="100%" stopColor="var(--pulsar-disk-b)" />
              </linearGradient>
            </defs>
            <ellipse className="fz-disk-tick" cx="0" cy="0" rx="200" ry="108" />
            <path className="fz-disk-track" d="M 205 0 A 205 112 0 1 1 -205 0 A 205 112 0 1 1 205 0" />
            <path ref={diskRef} className="fz-disk-prog" d="M 205 0 A 205 112 0 1 1 -205 0 A 205 112 0 1 1 205 0" />
          </svg>
        </div>

        {/* orbiting accretion nodes */}
        <div className="fz-orbit-tilt">
          <div className="fz-moons">
            {[1, 2, 3, 4].map(idx => (
              <span key={idx} className={cn('fz-moon', 'm' + idx, idx <= completedPomodoros && 'lit')}>
                <i />
              </span>
            ))}
          </div>
        </div>

        {/* white-hot core + clock */}
        <div className="fz-core-glow" />
        <div className="fz-core-clock">
          <motion.span
            key={timeLeft}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="fz-time"
          >
            {formatTime(timeLeft)}
          </motion.span>
          <span className="fz-state">
            {isRunning ? (mode === 'focus' ? 'Deep Focus...' : 'Resting...') : 'Paused'}
          </span>
        </div>
      </div>

      {/* POMODORO CYCLE TRACKER */}
      <div className="fz-pomo-note tnum">{completedPomodoros} / 4 moons lit</div>

      {/* CONTROLS TOOLBAR */}
      <div className="flex items-center gap-3 sm:gap-4">
        <IconButton
          variant="outline"
          size="lg"
          title="Reset Timer"
          aria-label="Reset timer"
          onClick={resetTimer}
          className="rounded-full w-9 h-9 sm:w-10 sm:h-10 border-[var(--border-subtle)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] bg-[var(--glass-bg)] backdrop-blur-xl"
        >
          <RotateCcw className="w-4 h-4" />
        </IconButton>

        <Button
          size="lg"
          onClick={toggleStartPause}
          disabled={startMutation.isPending || stopMutation.isPending}
          isLoading={startMutation.isPending || stopMutation.isPending}
          className={cn(
            "rounded-full h-10 sm:h-11 px-6 sm:px-8 text-xs sm:text-sm font-semibold tracking-wide gap-2 shadow-lg transition-all duration-300 hover:scale-105",
            isRunning
              ? "bg-amber-500 hover:bg-amber-600 text-white"
              : "bg-[var(--accent)] text-[var(--text-on-accent)] hover:opacity-90"
          )}
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              Pause Focus
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current ml-0.5" />
              Start Focus
            </>
          )}
        </Button>

        <IconButton
          variant="outline"
          size="lg"
          title={soundEnabled ? "Mute Chime" : "Enable Chime"}
          aria-label={soundEnabled ? "Mute chime" : "Enable chime"}
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            "rounded-full w-9 h-9 sm:w-10 sm:h-10 border-[var(--border-subtle)] transition-colors bg-[var(--glass-bg)] backdrop-blur-xl",
            soundEnabled ? "text-[var(--accent)]" : "text-[var(--text-tertiary)]"
          )}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </IconButton>
      </div>
    </div>
  )
}

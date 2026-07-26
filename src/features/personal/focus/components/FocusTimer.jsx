import React, { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text, Heading } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Play, Pause, RotateCcw, SkipForward, Sparkles, Flame, CheckCircle, Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useActiveFocus, useStartFocus, useStopFocus } from '../hooks/useFocus'

const POMODORO_MODES = [
  { id: 'focus', label: '25m Focus', minutes: 25, accent: 'var(--accent)' },
  { id: 'shortBreak', label: '5m Break', minutes: 5, accent: '#10B981' },
  { id: 'longBreak', label: '15m Reset', minutes: 15, accent: '#8B5CF6' },
]

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

  // Switch modes and set countdown target
  const selectMode = (newModeId) => {
    const target = POMODORO_MODES.find(m => m.id === newModeId) || POMODORO_MODES[0]
    setMode(newModeId)
    setIsRunning(false)
    setTimeLeft(target.minutes * 60)
  }

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
  }, [isRunning, mode])

  // Play gentle Web Audio API chime
  const playChime = () => {
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
  }

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

  // SVG Circular Ring calculation
  const radius = 110
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference

  return (
    <div className="flex flex-col items-center justify-center space-y-3 sm:space-y-4 w-full max-w-lg mx-auto py-1 select-none">
      
      {/* POMODORO MODE SELECTOR PILLS */}
      <div className="flex items-center flex-wrap justify-center gap-1 bg-[var(--bg-elevated)]/80 backdrop-blur-md border border-[var(--color-border-subtle)] p-1 rounded-2xl sm:rounded-full shadow-inner">
        {POMODORO_MODES.map(m => (
          <button
            key={m.id}
            type="button"
            onClick={() => selectMode(m.id)}
            className={cn(
              'px-3 sm:px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold tracking-wide transition-all duration-300 flex items-center gap-1.5',
              mode === m.id
                ? 'bg-[var(--accent)] text-white shadow-md scale-105'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {m.id === 'focus' && <Flame className="w-3.5 h-3.5" />}
            {m.id === 'shortBreak' && <Sparkles className="w-3.5 h-3.5" />}
            {m.id === 'longBreak' && <RotateCcw className="w-3.5 h-3.5" />}
            {m.label}
          </button>
        ))}
      </div>

      {/* ZEN CIRCULAR POMODORO CLOCK */}
      <div className="relative flex items-center justify-center">
        {/* Ambient Pulsing Glow Circle */}
        <div 
          className={cn(
            "absolute inset-0 rounded-full blur-2xl transition-opacity duration-1000",
            isRunning ? "opacity-30 animate-pulse bg-[var(--accent)]" : "opacity-0 bg-transparent"
          )}
        />

        <svg viewBox="0 0 288 288" className="w-44 h-44 sm:w-52 sm:h-52 md:w-56 md:h-56 transform -rotate-90">
          {/* Background Track Circle */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="var(--color-border-subtle)"
            strokeWidth="8"
            fill="transparent"
          />
          {/* Active Progress Ring */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke={currentMode.accent}
            strokeWidth="9"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-linear"
          />
        </svg>

        {/* Center Clock Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center space-y-1">
          <motion.span 
            key={timeLeft}
            initial={{ scale: 0.98 }}
            animate={{ scale: 1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-mono font-bold tracking-tighter text-[var(--text-primary)]"
          >
            {formatTime(timeLeft)}
          </motion.span>

          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] font-semibold">
            {isRunning ? (mode === 'focus' ? 'Deep Focus...' : 'Resting...') : 'Paused'}
          </span>
        </div>
      </div>

      {/* POMODORO CYCLE TRACKER */}
      <div className="flex items-center gap-3">
        <Text className="text-xs font-mono text-[var(--text-muted)] uppercase tracking-wider">
          Pomodoros:
        </Text>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4].map(idx => (
            <div
              key={idx}
              className={cn(
                "w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-all duration-300",
                idx <= completedPomodoros
                  ? "bg-[var(--accent)] shadow-[0_0_8px_var(--accent)] scale-110"
                  : "bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]"
              )}
              title={`Pomodoro Session ${idx}`}
            />
          ))}
        </div>
      </div>

      {/* CONTROLS TOOLBAR */}
      <div className="flex items-center gap-3 sm:gap-4 pt-1">
        <IconButton
          variant="outline"
          size="lg"
          title="Reset Timer"
          onClick={resetTimer}
          className="rounded-full w-9 h-9 sm:w-10 sm:h-10 border-[var(--color-border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        >
          <RotateCcw className="w-4 h-4" />
        </IconButton>

        <Button
          size="lg"
          onClick={toggleStartPause}
          className={cn(
            "rounded-full h-10 sm:h-11 px-6 sm:px-8 text-xs sm:text-sm font-semibold tracking-wide gap-2 shadow-lg transition-all duration-300 hover:scale-105",
            isRunning ? "bg-amber-500 hover:bg-amber-600 text-white" : "bg-[var(--accent)] text-white hover:opacity-90"
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
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={cn(
            "rounded-full w-9 h-9 sm:w-10 sm:h-10 border-[var(--color-border-subtle)] transition-colors",
            soundEnabled ? "text-[var(--accent)]" : "text-[var(--text-muted)]"
          )}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </IconButton>
      </div>

    </div>
  )
}

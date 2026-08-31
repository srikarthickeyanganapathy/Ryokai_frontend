import React, { useEffect } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/* ===
 * MINI UI PRIMITIVES (extracted from TeamsPage)
 * TaskCompletionRing / MiniProgressBar / AnimatedCounter
 * === */

export function TaskCompletionRing({ rate, size = 36, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (rate / 100) * circumference
  const hue = rate >= 65 ? 140 : rate >= 35 ? 40 : 0
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--bg-subtle)" strokeWidth={strokeWidth}
      />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none"
        stroke={`hsl(${hue} 70% 48%)`}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      <text
        x={size / 2} y={size / 2}
        textAnchor="middle" dominantBaseline="central"
        className="text-[9px] font-bold"
        fill="var(--text-primary)"
      >
        {rate}%
      </text>
    </svg>
  )
}

export function MiniProgressBar({ value, max = 100, hue = 220, className }) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn('h-1 rounded-full bg-[var(--bg-subtle)] overflow-hidden', className)}>
      <motion.div
        className="h-full rounded-full"
        style={{ background: `linear-gradient(90deg, hsl(${hue} 70% 50%), hsl(${(hue + 30) % 360} 60% 55%))` }}
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      />
    </div>
  )
}

export function AnimatedCounter({ value, duration = 0.8 }) {
  const springValue = useSpring(0, { stiffness: 80, damping: 20, duration: duration * 1000 })
  const display = useTransform(springValue, v => Math.round(v))

  useEffect(() => { springValue.set(value || 0) }, [value, springValue])

  return (
    <motion.span className="tabular-nums font-bold">
      {display}
    </motion.span>
  )
}

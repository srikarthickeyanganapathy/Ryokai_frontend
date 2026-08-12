import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { AnimatedCounter } from './primitives'

/* ══════════════════════════════════════════════════════
 * STAT KPI CARD (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export function StatKPI({ icon: Icon, label, value, trend, trendLabel, hue = 220 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 transition-all duration-200 hover:border-[var(--accent-border)] hover:shadow-sm overflow-hidden"
    >
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 55%), transparent 80%)` }}
      />
      <div className="relative">
        <div className="flex items-start justify-between mb-2">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 50% / 0.18), hsl(${hue} 70% 40% / 0.08))` }}
          >
            <Icon className="w-4 h-4" style={{ color: `hsl(${hue} 70% 50%)` }} />
          </div>
          {trend !== undefined && (
            <span
              className={cn(
                'text-[10px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-full',
                trend > 0
                  ? 'text-[var(--success)] bg-[var(--success)]/8'
                  : trend < 0
                    ? 'text-[var(--danger)] bg-[var(--danger)]/8'
                    : 'text-[var(--text-muted)] bg-[var(--bg-subtle)]'
              )}
            >
              <span>{trend > 0 ? '↑' : trend < 0 ? '↓' : '→'}</span>
              <span>{Math.abs(trend)}%</span>
            </span>
          )}
        </div>
        <div className="text-[26px] font-bold text-[var(--text-primary)] tracking-tight leading-none mb-0.5">
          <AnimatedCounter value={value} />
        </div>
        <div className="text-[11px] text-[var(--text-secondary)] font-medium">{label}</div>
        {trendLabel && (
          <div className="text-[10px] text-[var(--text-muted)] mt-1">{trendLabel}</div>
        )}
      </div>
    </motion.div>
  )
}

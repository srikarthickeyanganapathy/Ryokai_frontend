import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/* ══════════════════════════════════════════════════════
 * SMART CATEGORIZATION BAR — CategoryChip (extracted from TeamsPage)
 * ══════════════════════════════════════════════════════ */

export function CategoryChip({ label, count, isActive, onClick, hue }) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        'relative px-4 py-2 rounded-xl text-[13px] font-medium transition-colors duration-200 whitespace-nowrap',
        isActive
          ? 'text-[var(--text-primary)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)]'
      )}
    >
      <span>{label}</span>
      <span
        className={cn(
          'ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full tabular-nums',
          isActive ? 'bg-[var(--accent)]/12 text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
        )}
      >
        {count}
      </span>
      {isActive && (
        <motion.div
          layoutId="category-indicator"
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 rounded-full"
          style={{ background: `hsl(${hue} 70% 50%)` }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
    </motion.button>
  )
}

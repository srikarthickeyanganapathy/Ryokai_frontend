import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

const TABS = [
  { id: 'details',  label: 'Details',  icon: 'alignLeft' },
  { id: 'comments', label: 'Comments', icon: 'messageSquare' },
  { id: 'evidence', label: 'Evidence', icon: 'link' },
  { id: 'activity', label: 'Activity', icon: 'clock' },
]

export function TaskPanelTabs({ activeTab, onChange, counts }) {
  return (
    <div className="flex items-center border-b border-[var(--color-border-subtle)] bg-[var(--bg-subtle)]/30">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        const count = counts?.[tab.id]
        return (
          <motion.button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              'relative flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors',
              isActive
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <motion.span
                animate={{ scale: isActive ? 1 : 0.95 }}
                className={cn(
                  'text-[10px] px-1.5 py-0 rounded-full tabular-nums font-semibold',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                )}
              >
                {count}
              </motion.span>
            )}
            {isActive && (
              <motion.div
                layoutId="task-panel-tab-indicator"
                className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--accent)] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </motion.button>
        )
      })}
    </div>
  )
}

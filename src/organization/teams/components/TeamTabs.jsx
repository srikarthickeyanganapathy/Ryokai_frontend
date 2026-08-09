import React, { useRef, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Icons } from '@/shared/ui/Icons'
import { FolderIcon, ChecklistIcon, ChatIcon, InsightsIcon } from './Shared'
import { cn } from '@/shared/lib/cn'
import { SPRINGS } from '@/shared/lib/uxTokens'

const TABS = [
  { id: 'overview', label: 'Pulse', icon: null },
  { id: 'projects', label: 'Projects', icon: FolderIcon },
  { id: 'tasks', label: 'Board', icon: ChecklistIcon },
  { id: 'members', label: 'Roster', icon: Icons.users },
  { id: 'chat', label: 'Chat', icon: ChatIcon },
  { id: 'insights', label: 'Analytics', icon: InsightsIcon },
]

export function TeamTabs({ activeTab, setActiveTab, tabCounts }) {
  const containerRef = useRef(null)
  const [indicatorStyle, setIndicatorStyle] = useState({ left: 0, width: 0 })
  const [prevCounts, setPrevCounts] = useState(tabCounts ?? {})

  // Animate count changes
  useEffect(() => {
    if (!tabCounts) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- deliberate tab-count animation sync
    setPrevCounts(tabCounts)
  }, [tabCounts])

  // Measure indicator position
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const activeEl = container.querySelector(`[data-tab-id="${activeTab}"]`)
    if (activeEl) {
      const { offsetLeft, offsetWidth } = activeEl
      setIndicatorStyle({ left: offsetLeft, width: offsetWidth })
    }
  }, [activeTab])

  return (
    <div className="relative pb-px">
      {/* ── Gradient Bottom Border ── */}
      <div
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--border-subtle) 20%, var(--border-subtle) 80%, transparent)',
        }}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        className="relative flex items-center gap-1 py-3 overflow-x-auto scrollbar-hide"
        role="tablist"
      >
        {/* ── Animated Underline Indicator ── */}
        <motion.div
          className="absolute bottom-2 h-[2.5px] rounded-full bg-[var(--accent)] shadow-sm shadow-[var(--accent)]/30"
          animate={indicatorStyle}
          transition={{ type: 'spring', stiffness: 500, damping: 35, mass: 0.8 }}
        />

        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          const count = tabCounts?.[tab.id]
          const prevCount = prevCounts?.[tab.id]
          const countChanged = count !== undefined && prevCount !== undefined && count !== prevCount
          const TabIcon = tab.icon

          return (
            <motion.button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              transition={SPRINGS.fast}
              className={cn(
                'relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 shrink-0',
                isActive
                  ? 'text-[var(--accent)] bg-[var(--accent-soft)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]/60',
              )}
            >
              {TabIcon && (
                <TabIcon className={cn(
                  'w-4 h-4 transition-colors duration-150',
                  isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]',
                )} />
              )}
              <span>{tab.label}</span>
              {count !== undefined && count > 0 && (
                <motion.span
                  key={`${tab.id}-${count}`}
                  initial={countChanged ? { scale: 1.4 } : false}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={cn(
                    'ml-0.5 min-w-[20px] h-[18px] flex items-center justify-center px-1.5 rounded-full text-[10px] font-semibold tabular-nums leading-none',
                    isActive
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]',
                  )}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * EditorLayout
 * ---
 * Layout archetype for canvas / studio / split-pane editors.
 * Target pages: Role Studio.
 *
 * Structure:
 *   Header -> Toolbar -> [ Sidebar | Canvas | Inspector ]
 *
 * Designed for full-height, side-by-side editing experiences.
 * This layout renders ONLY structure. No business logic.
 *
 * Responsive:
 *   Desktop  -- Side-by-side canvas & inspector
 *   Tablet   -- Collapsible inspector as sheet
 *   Mobile   -- Fullscreen step canvas (inspector as overlay)
 */
export function EditorLayout({
  header,
  toolbar,
  sidebar,
  inspector,
  children,
  className,
}) {
  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* --- Header Slot --- */}
      {header && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="shrink-0 pb-4 border-b border-[var(--border-subtle)]"
        >
          {header}
        </motion.div>
      )}

      {/* --- Toolbar Slot --- */}
      {toolbar && (
        <div className="shrink-0 py-2.5 border-b border-[var(--border-subtle)]">
          {toolbar}
        </div>
      )}

      {/* --- Editor Body --- */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Optional sidebar (e.g. role list) */}
        {sidebar && (
          <motion.aside
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden md:flex w-56 lg:w-64 shrink-0 border-r border-[var(--border-subtle)] overflow-y-auto custom-scrollbar"
          >
            {sidebar}
          </motion.aside>
        )}

        {/* Main canvas */}
        <main className="flex-1 min-w-0 overflow-y-auto custom-scrollbar">
          {children}
        </main>

        {/* Optional inspector (e.g. permission inspector) */}
        {inspector && (
          <motion.aside
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:flex w-72 xl:w-80 shrink-0 border-l border-[var(--border-subtle)] overflow-y-auto custom-scrollbar"
          >
            {inspector}
          </motion.aside>
        )}
      </div>
    </div>
  )
}

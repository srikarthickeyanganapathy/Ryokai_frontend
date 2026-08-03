import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { layoutClasses } from '../tokens/layoutTokens'

/**
 * ManagementLayout
 * ─────────────────────────────────────────────────────────
 * Layout archetype for CRUD / operational pages.
 * Target pages: Projects, Tasks, Teams, Directory (People Hub), Announcements.
 *
 * Structure:
 *   Compact Header (Title + Metric Chips) → Toolbar → Content View
 *
 * All slots are optional — pages opt in to what they need.
 * This layout renders ONLY structure. No business logic.
 *
 * Responsive:
 *   Desktop  — Inline toolbar + multi-column/table content
 *   Tablet   — Stacked toolbar + compact cards
 *   Mobile   — Drawer toolbar + single-column list
 */
export function ManagementLayout({
  header,
  toolbar,
  tabs,
  sidebar,
  children,
  className,
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* ── Compact Header Slot ───────────────────────── */}
      {header && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={layoutClasses.headerBorder}
        >
          {header}
        </motion.div>
      )}

      {/* ── Tabs Slot ─────────────────────────────────── */}
      {tabs && (
        <div className="border-b border-[var(--border-subtle)] overflow-hidden">
          {tabs}
        </div>
      )}

      {/* ── Toolbar Slot ──────────────────────────────── */}
      {toolbar && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="py-3"
        >
          {toolbar}
        </motion.div>
      )}

      {/* ── Content Area (with optional sidebar) ──────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={cn(
          'flex-1 min-h-0',
          sidebar ? 'flex gap-6' : ''
        )}
      >
        {/* Main content */}
        <div className={cn('flex-1 min-w-0', layoutClasses.sectionStack)}>
          {children}
        </div>

        {/* Optional sidebar */}
        {sidebar && (
          <aside className="hidden lg:block w-72 xl:w-80 shrink-0">
            {sidebar}
          </aside>
        )}
      </motion.div>
    </div>
  )
}

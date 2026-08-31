import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { layoutClasses } from '../tokens/layoutTokens'

/**
 * CommandLayout
 * ---
 * Layout archetype for action-first operational pages.
 * Target pages: Dashboard (Mission Control), Goals.
 *
 * Structure:
 *   Hero -> Metrics Strip -> Quick Actions -> Widget Grid
 *
 * All slots are optional -- pages opt in to what they need.
 * This layout renders ONLY structure. No business logic.
 *
 * Responsive:
 *   Desktop  -- Full hero + inline metrics + multi-column widgets
 *   Tablet   -- Collapsed hero + stacked metrics
 *   Mobile   -- Compact action stack + single column
 */
export function CommandLayout({
  hero,
  metrics,
  actions,
  children,
  className,
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* --- Hero Slot --- */}
      {hero && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          {hero}
        </motion.div>
      )}

      {/* --- Metrics Strip Slot --- */}
      {metrics && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          {metrics}
        </motion.div>
      )}

      {/* --- Quick Actions Slot --- */}
      {actions && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-6"
        >
          {actions}
        </motion.div>
      )}

      {/* --- Content / Widget Grid --- */}
      {children && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className={layoutClasses.sectionStack}
        >
          {children}
        </motion.div>
      )}
    </div>
  )
}

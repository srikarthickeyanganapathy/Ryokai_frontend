import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { layoutClasses } from '../tokens/layoutTokens'

/**
 * InsightLayout
 * ─────────────────────────────────────────────────────────
 * Layout archetype for question-driven analysis pages.
 * Target pages: Analytics, Workload.
 *
 * Structure:
 *   Header → View Switcher → Question Sections → Trends → Breakdowns
 *
 * Organizes analytics around operational questions:
 *   "What is improving?" → "What's blocked?" → "Who's overloaded?"
 *
 * This layout renders ONLY structure. No business logic.
 *
 * Responsive:
 *   Desktop  — Side-by-side chart panels
 *   Tablet   — Accordion question sections
 *   Mobile   — Stacked single-column charts
 */
export function InsightLayout({
  header,
  viewSwitcher,
  children,
  className,
}) {
  return (
    <div className={cn('flex flex-col', className)}>
      {/* ── Header Slot ───────────────────────────────── */}
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

      {/* ── View Switcher Slot ────────────────────────── */}
      {viewSwitcher && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="py-3"
        >
          {viewSwitcher}
        </motion.div>
      )}

      {/* ── Insight Sections ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className={layoutClasses.sectionStack}
      >
        {children}
      </motion.div>
    </div>
  )
}

/**
 * InsightSection
 * ─────────────────────────────────────────────────────────
 * A question-driven section within InsightLayout.
 * Groups related charts/metrics under a single operational question.
 *
 * @param {string} question — The operational question (e.g. "What is improving?")
 * @param {string} [description] — Supporting context
 * @param {React.ReactNode} children — Charts / metric cards
 */
export function InsightSection({ question, description, children, className }) {
  return (
    <section className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
          {question}
        </h3>
        {description && (
          <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {children}
      </div>
    </section>
  )
}

import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'

/**
 * PageHeader
 * Shared top-of-page header used across all module pages (Analytics, Directory,
 * Announcements, Workload, Teams, Settings). Standardizes the eyebrow/title/subtitle
 * hierarchy that was previously copy-pasted with drifting labels ("MANAGE Mode",
 * "ANNOUNCEMENTS Mode", "Directory") and inconsistent heading levels.
 *
 * - eyebrow: short section label, sentence case, no "Mode" suffix (e.g. "Teams")
 * - meta: optional trailing context after the eyebrow (e.g. "12 members")
 * - title / subtitle: page name and one-line description
 * - icon: optional lucide icon shown beside the title
 * - actions: optional right-aligned buttons
 */
export function PageHeader({ eyebrow, meta, title, subtitle, icon: Icon, actions, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-[var(--color-border-subtle)] ${className}`}
    >
      <div className="min-w-0">
        {(eyebrow || meta) && (
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {eyebrow && (
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                {eyebrow}
              </span>
            )}
            {meta && <span className="text-[11px] text-[var(--text-muted)]">{meta}</span>}
          </div>
        )}
        <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate">
          {Icon && <Icon className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />}
          {title}
        </Heading>
        {subtitle && <Text variant="muted" className="text-[13px] leading-relaxed">{subtitle}</Text>}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </motion.div>
  )
}
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * ConfigurationLayout
 * ─────────────────────────────────────────────────────────
 * Layout archetype for settings / configuration / admin pages.
 * Target pages: Organization Settings, Security, Audit, Permissions.
 *
 * Structure:
 *   Breadcrumb → Compact Title → Tab Navigation → Form/Content Panel
 *
 * This layout renders ONLY structure. No business logic.
 *
 * Responsive:
 *   Desktop  — Left vertical tabs + right form panel (or top horizontal tabs)
 *   Tablet   — Top scrollable horizontal tabs
 *   Mobile   — Select dropdown for tabs
 */
export function ConfigurationLayout({
  header,
  tabs,
  activeTab,
  onTabChange,
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
          className="pb-5 border-b border-[var(--border-subtle)]"
        >
          {header}
        </motion.div>
      )}

      {/* ── Tab Navigation + Content ──────────────────── */}
      <div className="flex flex-col lg:flex-row gap-0 lg:gap-8 mt-5">
        {/* Tab Navigation */}
        {tabs && tabs.length > 0 && (
          <>
            {/* Desktop: Vertical tab list */}
            <nav className="hidden lg:flex flex-col w-52 shrink-0 space-y-0.5">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange?.(tab.id)}
                  className={cn(
                    'flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all duration-150 text-left',
                    activeTab === tab.id
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]'
                      : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                  )}
                >
                  {tab.icon && (
                    <tab.icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        activeTab === tab.id ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'
                      )}
                      strokeWidth={1.5}
                    />
                  )}
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-tertiary)]">
                      {tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            {/* Tablet: Horizontal scrollable tabs */}
            <div className="lg:hidden overflow-x-auto border-b border-[var(--border-subtle)] mb-5 -mx-4 px-4">
              <div className="flex gap-0.5 min-w-max">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange?.(tab.id)}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2.5 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2',
                      activeTab === tab.id
                        ? 'text-[var(--accent)] border-[var(--accent)]'
                        : 'text-[var(--text-secondary)] border-transparent hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
                    )}
                  >
                    {tab.icon && <tab.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ── Content Panel ───────────────────────────── */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 min-w-0"
        >
          {children}
        </motion.div>
      </div>
    </div>
  )
}

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * Inspector
 * ─────────────────────────────────────────────────────────
 * Reusable side-panel UX primitive for detail inspection.
 * Used inside EditorLayout and ManagementLayout for
 * viewing detail alongside a list or canvas.
 *
 * Unlike DrawerManager (global overlay), Inspector is an
 * inline panel that sits beside the main content.
 *
 * @param {boolean} isOpen — Whether the inspector is visible
 * @param {function} onClose — Close handler
 * @param {string} [title] — Inspector header title
 * @param {React.ReactNode} [actions] — Header action buttons
 * @param {React.ReactNode} [footer] — Sticky footer content
 * @param {'sm'|'md'|'lg'} [width='md'] — Panel width
 * @param {React.ReactNode} children — Inspector body content
 */
export function Inspector({
  isOpen,
  onClose,
  title,
  actions,
  footer,
  width = 'md',
  className,
  children,
}) {
  const widthClasses = {
    sm: 'w-72',
    md: 'w-80 xl:w-96',
    lg: 'w-96 xl:w-[420px]',
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, x: 20, width: 0 }}
          animate={{ opacity: 1, x: 0, width: 'auto' }}
          exit={{ opacity: 0, x: 20, width: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className={cn(
            'shrink-0 border-l border-[var(--border-subtle)] bg-[var(--bg-elevated)] flex flex-col overflow-hidden',
            widthClasses[width],
            className
          )}
        >
          {/* Header */}
          {(title || actions || onClose) && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
              {title && (
                <h3 className="text-[14px] font-semibold text-[var(--text-primary)] truncate">
                  {title}
                </h3>
              )}
              <div className="flex items-center gap-1.5 ml-auto">
                {actions}
                {onClose && (
                  <button
                    onClick={onClose}
                    className="p-1 rounded-[var(--radius-xs)] text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="shrink-0 border-t border-[var(--border-subtle)] px-4 py-3">
              {footer}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

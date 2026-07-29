import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'

/**
 * ReviewPanel
 * ─────────────────────────────────────────────────────────
 * UX primitive for review/approval workflows.
 * Renders a structured review view with metadata,
 * diff/changes summary, and approve/reject actions.
 *
 * @param {string} title — Review item title
 * @param {string} [subtitle] — Supporting context
 * @param {string} [status] — Current status badge ('pending'|'approved'|'rejected')
 * @param {React.ReactNode} [metadata] — Key-value metadata section
 * @param {React.ReactNode} children — Review body (diffs, details)
 * @param {function} [onApprove] — Approve handler
 * @param {function} [onReject] — Reject handler
 * @param {string} [approveLabel='Approve']
 * @param {string} [rejectLabel='Reject']
 */
export function ReviewPanel({
  title,
  subtitle,
  status,
  metadata,
  children,
  onApprove,
  onReject,
  approveLabel = 'Approve',
  rejectLabel = 'Reject',
  className,
}) {
  const statusStyles = {
    pending: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/30',
    approved: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30',
    rejected: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/30',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-[var(--border-subtle)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-[12px] text-[var(--text-tertiary)] mt-0.5">{subtitle}</p>
            )}
          </div>
          {status && (
            <span className={cn(
              'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border shrink-0',
              statusStyles[status] || statusStyles.pending
            )}>
              {status}
            </span>
          )}
        </div>

        {/* Metadata */}
        {metadata && (
          <div className="mt-3 pt-3 border-t border-[var(--border-subtle)]">
            {metadata}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="p-5">
        {children}
      </div>

      {/* Actions */}
      {(onApprove || onReject) && (
        <div className="px-5 py-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2 bg-[var(--bg-subtle)]/30">
          {onReject && (
            <button
              onClick={onReject}
              className="px-4 py-2 text-[12px] font-semibold rounded-[var(--radius-md)] border border-[var(--danger)]/30 text-[var(--danger)] bg-[var(--danger-soft)]/20 hover:bg-[var(--danger-soft)]/40 transition-colors"
            >
              {rejectLabel}
            </button>
          )}
          {onApprove && (
            <button
              onClick={onApprove}
              className="px-4 py-2 text-[12px] font-semibold rounded-[var(--radius-md)] bg-[var(--success)] text-white hover:bg-[var(--success)]/90 transition-colors shadow-[var(--shadow-xs)]"
            >
              {approveLabel}
            </button>
          )}
        </div>
      )}
    </motion.div>
  )
}

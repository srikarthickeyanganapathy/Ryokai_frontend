import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * FrameworkEmptyState
 * ---
 * Standardized zero-state component for WEF layouts.
 * Extends the existing EmptyState with framework-consistent styling
 * and an optional illustration slot.
 *
 * @param {React.Component} [icon] -- Lucide icon component
 * @param {string} title -- Primary message
 * @param {string} [description] -- Supporting description
 * @param {string} [actionLabel] -- CTA button text
 * @param {function} [onAction] -- CTA click handler
 * @param {React.ReactNode} [illustration] -- Custom illustration slot
 */
export function FrameworkEmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  illustration,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-10 text-center min-h-[320px]',
        'bg-[var(--bg-subtle)]/20 rounded-[var(--radius-lg)]',
        'border border-[var(--border-subtle)] border-dashed animate-in fade-in slide-in-from-bottom-4 duration-500',
        className
      )}
    >
      {/* Illustration or Icon */}
      {illustration ? (
        <div className="mb-5">{illustration}</div>
      ) : Icon ? (
        <div className="w-16 h-16 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] flex items-center justify-center mb-5 animate-in zoom-in spin-in-6 duration-500 delay-100 fill-mode-backwards">
          <Icon className="w-8 h-8 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        </div>
      ) : null}

      {/* Title */}
      <h3 className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight mb-1.5">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-[var(--radius-md)] bg-[var(--accent)] text-white hover:bg-[var(--accent-hover)] transition-colors shadow-[var(--shadow-sm)] active:scale-[0.98]"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

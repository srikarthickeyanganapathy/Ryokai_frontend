import React from 'react'
import { cn } from '@/shared/lib/cn'
import { FrameworkLoadingState } from './FrameworkLoadingState'
import { FrameworkEmptyState } from './FrameworkEmptyState'

/**
 * PageStateContainer
 * ─────────────────────────────────────────────────────────
 * Unified page lifecycle renderer.
 * The PAGE decides WHICH state is active.
 * This component only RENDERS the appropriate UI feedback.
 *
 * Lifecycle: Loading → Ready → Refreshing → Empty | Error | Offline | Unauthorized
 *
 * @param {'loading'|'ready'|'empty'|'error'|'offline'|'unauthorized'} state
 * @param {Object} [loadingConfig] — Skeleton config. Pass `skeleton` (React node) for a
 *                  structure-matched skeleton, or { variant, rows, columns } for generic.
 * @param {Object} [emptyConfig] — Zero-state config { icon, title, description, actionLabel, onAction }
 * @param {Object} [errorConfig] — Error config { title, description, onRetry }
 * @param {React.ReactNode} children — Rendered when state === 'ready'
 */
export function PageStateContainer({
  state = 'ready',
  loadingConfig,
  emptyConfig,
  errorConfig,
  className,
  children,
}) {
  switch (state) {
    case 'loading':
      // Custom structure-matched skeleton wins over the generic variant
      if (loadingConfig?.skeleton) {
        return <>{loadingConfig.skeleton}</>
      }
      return (
        <FrameworkLoadingState
          variant={loadingConfig?.variant || 'default'}
          rows={loadingConfig?.rows}
          columns={loadingConfig?.columns}
          className={className}
        />
      )

    case 'empty':
      return (
        <FrameworkEmptyState
          icon={emptyConfig?.icon}
          title={emptyConfig?.title || 'Nothing here yet'}
          description={emptyConfig?.description || 'Get started by creating your first item.'}
          actionLabel={emptyConfig?.actionLabel}
          onAction={emptyConfig?.onAction}
          className={className}
        />
      )

    case 'error':
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-[var(--danger-soft)]/30 border border-[var(--danger)]/20 rounded-[var(--radius-lg)]',
            className
          )}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[var(--danger)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1">
            {errorConfig?.title || 'Something went wrong'}
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-5 leading-relaxed">
            {errorConfig?.description || 'There was a problem loading this data. Please try again.'}
          </p>
          {errorConfig?.onRetry && (
            <button
              onClick={errorConfig.onRetry}
              className="px-4 py-2 text-[13px] font-semibold bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shadow-[var(--shadow-xs)]"
            >
              Try Again
            </button>
          )}
        </div>
      )

    case 'offline':
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-[var(--warning-soft)]/30 border border-[var(--warning)]/20 rounded-[var(--radius-lg)]',
            className
          )}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--warning-soft)] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[var(--warning)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1">
            You're offline
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
            Check your internet connection and try again.
          </p>
        </div>
      )

    case 'unauthorized':
      return (
        <div
          className={cn(
            'flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-[var(--bg-subtle)]/30 border border-[var(--border-subtle)] border-dashed rounded-[var(--radius-lg)]',
            className
          )}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] flex items-center justify-center mb-4">
            <svg className="w-7 h-7 text-[var(--text-tertiary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1">
            Access restricted
          </h3>
          <p className="text-sm text-[var(--text-secondary)] max-w-sm leading-relaxed">
            You don't have permission to view this content. Contact your organization admin for access.
          </p>
        </div>
      )

    case 'ready':
    default:
      return <>{children}</>
  }
}

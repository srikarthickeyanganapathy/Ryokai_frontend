import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * ExportPlugin
 * ─────────────────────────────────────────────────────────
 * Toolbar export button plugin.
 * Stateless — page provides the onExport handler.
 *
 * @param {function} onExport — Export click handler
 * @param {string} [label='Export'] — Button label
 * @param {boolean} [loading=false] — Loading state
 */
export function ExportPlugin({ onExport, label = 'Export', loading = false, className }) {
  return (
    <button
      onClick={onExport}
      disabled={loading}
      className={cn(
        'inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-[var(--radius-md)] border transition-colors',
        'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)]',
        'hover:text-[var(--text-primary)] hover:border-[var(--border-default)]',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M12 2v4m0 12v4m-7.07-3.93l2.83-2.83m8.48-8.48l2.83-2.83M2 12h4m12 0h4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
        </svg>
      )}
      <span>{label}</span>
    </button>
  )
}

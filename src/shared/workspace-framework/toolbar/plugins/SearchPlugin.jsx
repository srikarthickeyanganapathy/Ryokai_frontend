import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * SearchPlugin
 * ---
 * Toolbar search input plugin.
 * Stateless -- page provides value and onChange.
 *
 * @param {string} value -- Current search value
 * @param {function} onChange -- Search value change handler
 * @param {string} [placeholder='Search...'] -- Input placeholder
 */
export function SearchPlugin({ value, onChange, placeholder = 'Search...', className }) {
  return (
    <div className={cn('relative', className)}>
      <svg
        className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)] pointer-events-none"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="h-8 w-48 lg:w-56 pl-8 pr-3 text-[12px] rounded-[var(--radius-md)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent-border)] transition-colors"
      />
    </div>
  )
}

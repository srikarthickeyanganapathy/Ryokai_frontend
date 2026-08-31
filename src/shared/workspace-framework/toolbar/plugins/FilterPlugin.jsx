import React, { useState, useRef, useEffect } from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * FilterPlugin
 * ---
 * Toolbar filter dropdown plugin.
 * Stateless -- page provides filters config, activeFilters, and onChange.
 *
 * @param {Array<{id, label, options: Array<{value, label}>}>} filters -- Filter definitions
 * @param {Object} activeFilters -- Current active filter values { [filterId]: value }
 * @param {function} onChange -- Filter change handler (filterId, value)
 * @param {function} [onClear] -- Clear all filters handler
 */
export function FilterPlugin({ filters = [], activeFilters = {}, onChange, onClear, className }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  const activeCount = Object.values(activeFilters).filter(Boolean).length

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center gap-1.5 h-8 px-3 text-[12px] font-medium rounded-[var(--radius-md)] border transition-colors',
          activeCount > 0
            ? 'bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]'
            : 'bg-[var(--bg-elevated)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]'
        )}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
        </svg>
        <span>Filter</span>
        {activeCount > 0 && (
          <span className="ml-0.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[var(--accent)] text-white min-w-[18px] text-center">
            {activeCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 mt-1.5 w-56 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-[var(--shadow-lg)] p-2 z-40 space-y-2">
          {filters.map((filter) => (
            <div key={filter.id}>
              <label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] px-2 mb-1 block">
                {filter.label}
              </label>
              <select
                value={activeFilters[filter.id] || ''}
                onChange={(e) => onChange(filter.id, e.target.value || null)}
                className="w-full h-8 px-2 text-[12px] rounded-[var(--radius-sm)] bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent)]"
              >
                <option value="">All</option>
                {filter.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          ))}

          {activeCount > 0 && onClear && (
            <button
              onClick={() => { onClear(); setOpen(false) }}
              className="w-full text-[11px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]/30 rounded-[var(--radius-sm)] py-1.5 transition-colors"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}
    </div>
  )
}

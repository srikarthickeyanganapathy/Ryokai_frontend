import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * DensityPlugin
 * ─────────────────────────────────────────────────────────
 * Toolbar row density toggle plugin.
 * Stateless — page provides value and onChange.
 *
 * @param {'compact'|'normal'|'comfortable'} value — Current density
 * @param {function} onChange — Density change handler
 */
export function DensityPlugin({ value = 'normal', onChange, className }) {
  const densities = [
    { id: 'compact', label: 'Compact', icon: CompactIcon },
    { id: 'normal', label: 'Normal', icon: NormalIcon },
    { id: 'comfortable', label: 'Comfortable', icon: ComfortableIcon },
  ]

  return (
    <div className={cn('inline-flex items-center rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-elevated)] p-0.5', className)}>
      {densities.map((d) => (
        <button
          key={d.id}
          onClick={() => onChange(d.id)}
          title={d.label}
          className={cn(
            'flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] transition-colors',
            value === d.id
              ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
              : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
          )}
        >
          <d.icon />
        </button>
      ))}
    </div>
  )
}

function CompactIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="3" x2="12" y2="3" />
      <line x1="2" y1="6" x2="12" y2="6" />
      <line x1="2" y1="9" x2="12" y2="9" />
      <line x1="2" y1="12" x2="12" y2="12" />
    </svg>
  )
}

function NormalIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="3.5" x2="12" y2="3.5" />
      <line x1="2" y1="7" x2="12" y2="7" />
      <line x1="2" y1="10.5" x2="12" y2="10.5" />
    </svg>
  )
}

function ComfortableIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="2" y1="4.5" x2="12" y2="4.5" />
      <line x1="2" y1="9.5" x2="12" y2="9.5" />
    </svg>
  )
}

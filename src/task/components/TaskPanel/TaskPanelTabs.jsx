import React from 'react'
import { cn } from '@/shared/lib/cn'

const TABS = [
  { id: 'details',  label: 'Details',  icon: 'alignLeft' },
  { id: 'comments', label: 'Comments', icon: 'messageSquare' },
  { id: 'evidence', label: 'Evidence', icon: 'link' },
  { id: 'activity', label: 'Activity', icon: 'clock' },
]

export function TaskPanelTabs({ activeTab, onChange, counts }) {
  return (
    <div className="flex items-center bg-[var(--bg-subtle)] rounded-md p-0.5 border border-[var(--border-subtle)]">
      {TABS.map(tab => {
        const isActive = activeTab === tab.id
        const count = counts?.[tab.id]
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-sm transition-colors',
              isActive
                ? 'bg-[var(--bg-card)] shadow-sm text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {tab.label}
            {typeof count === 'number' && count > 0 && (
              <span
                className={cn(
                  'text-[9px] px-1.5 py-0 rounded-full tabular-nums font-semibold',
                  isActive
                    ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                    : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                )}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}

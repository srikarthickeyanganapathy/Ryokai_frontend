import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * DetailTabs
 * ─────────────────────────────────────────────────────────
 * Shared underline tab navigation for detail pages.
 * Replaces inline hand-rolled copies (e.g. TeamTabs, CrewTabs).
 *
 * @param {Array<{id: string, label: string, icon?: React.ElementType}>} tabs - Tab definitions
 * @param {string} activeTab - Currently active tab id
 * @param {(id: string) => void} onChange - Callback when tab is clicked
 * @param {Object} [counts] - Optional map of tab id → count badge number
 * @param {boolean} [sticky=true] - Whether the tab bar should stick to the top
 * @param {string} [className] - Additional container classes
 */
export function DetailTabs({ tabs, activeTab, onChange, counts, sticky = true, className }) {
  return (
    <div
      className={cn(
        'z-20 bg-[var(--bg-base)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]',
        sticky && 'sticky top-0',
        className
      )}
    >
      <div className="flex items-center gap-1 px-2 sm:px-4 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const IconEl = tab.icon;
          const count = counts ? counts[tab.id] : undefined;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-3 py-3 text-[13px] font-medium transition-colors whitespace-nowrap border-b-2 cursor-pointer',
                isActive
                  ? 'border-[var(--accent)] text-[var(--text-primary)]'
                  : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {IconEl && <IconEl className="w-3.5 h-3.5" aria-hidden="true" />}
              {tab.label}
              {typeof count === 'number' && count > 0 && (
                <span
                  className={cn(
                    'text-[10px] px-1.5 rounded-full tabular-nums font-semibold',
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  )}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * DetailTabs
 * ---
 * Shared underline tab navigation for detail pages.
 * Features animated tab indicator that slides between tabs.
 *
 * @param {Array<{id: string, label: string, icon?: React.ElementType}>} tabs - Tab definitions
 * @param {string} activeTab - Currently active tab id
 * @param {(id: string) => void} onChange - Callback when tab is clicked
 * @param {Object} [counts] - Optional map of tab id -> count badge number
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
      <div className="flex items-center gap-1 px-2 sm:px-4 overflow-x-auto overflow-y-hidden no-scrollbar pt-1 pb-0.5">
        {tabs.map((tab) => {
          const IconEl = tab.icon;
          const count = counts ? counts[tab.id] : undefined;
          const isActive = activeTab === tab.id;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className={cn(
                'relative flex items-center gap-2 px-3 py-3 text-[13px] font-medium whitespace-nowrap cursor-pointer select-none',
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {IconEl && (
                <motion.span
                  animate={{ rotate: isActive ? 0 : 0, scale: isActive ? 1.1 : 1 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                >
                  <IconEl className="w-3.5 h-3.5" aria-hidden="true" />
                </motion.span>
              )}
              {tab.label}
              {typeof count === 'number' && count > 0 && (
                <motion.span
                  animate={{ scale: isActive ? 1 : 0.95 }}
                  className={cn(
                    'text-[10px] px-1.5 rounded-full tabular-nums font-semibold',
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  )}
                >
                  {count}
                </motion.span>
              )}

              {/* Sliding underline indicator */}
              {isActive && (
                <motion.div
                  layoutId="detail-tabs-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-[var(--accent)] rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

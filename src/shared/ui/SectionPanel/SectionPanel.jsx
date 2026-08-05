import React from 'react';
import { cn } from '@/shared/lib/cn';
import { Heading, Text } from '@/shared/ui/Typography';

/**
 * SectionPanel
 * ─────────────────────────────────────────────────────────
 * Standardized section card with an optional icon, title, subtitle, and actions.
 * Unifies various hand-rolled content cards across pages.
 *
 * @param {React.ElementType} [icon] - Lucide icon for the header
 * @param {string} title - Section title
 * @param {string} [subtitle] - Section subtitle
 * @param {React.ReactNode} [actions] - Action buttons placed on the right of the header
 * @param {React.ReactNode} children - Panel content
 * @param {boolean} [noPadding=false] - If true, removes padding from content area
 * @param {string} [className] - Additional container classes
 */
export function SectionPanel({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
  className,
}) {
  return (
    <div
      className={cn(
        'relative bg-[var(--bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden shadow-sm flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between p-4 sm:p-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
          )}
          <div>
            <Heading level={3} className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
              {title}
            </Heading>
            {subtitle && (
              <Text variant="muted" className="text-[12px] mt-0.5">
                {subtitle}
              </Text>
            )}
          </div>
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">
            {actions}
          </div>
        )}
      </div>

      <div className={cn('flex-1', !noPadding && 'p-4 sm:p-5')}>
        {children}
      </div>
    </div>
  );
}

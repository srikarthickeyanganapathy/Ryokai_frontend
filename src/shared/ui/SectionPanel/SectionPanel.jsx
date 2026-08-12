import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { Heading, Text } from '@/shared/ui/Typography';

/**
 * SectionPanel
 * ─────────────────────────────────────────────────────────
 * Standardized section card with an optional icon, title, subtitle, and actions.
 * Wrapped in a fade-up motion container for premium entrance feel.
 *
 * @param {React.ElementType} [icon] - Lucide icon for the header
 * @param {string} title - Section title
 * @param {string} [subtitle] - Section subtitle
 * @param {React.ReactNode} [actions] - Action buttons placed on the right of the header
 * @param {React.ReactNode} children - Panel content
 * @param {boolean} [noPadding=false] - If true, removes padding from content area
 * @param {number} [staggerIndex=0] - Animation stagger index (0 = no delay)
 * @param {string} [className] - Additional container classes
 */
export function SectionPanel({
  icon: Icon,
  title,
  subtitle,
  actions,
  children,
  noPadding = false,
  staggerIndex = 0,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: staggerIndex * 0.06,
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      className={cn(
        'relative bg-[var(--bg-card)] border border-[var(--color-border-subtle)] rounded-xl overflow-hidden shadow-sm flex flex-col',
        className
      )}
    >
      <div className="flex items-center justify-between flex-wrap gap-x-3 gap-y-1.5 p-4 sm:p-5 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-center gap-3 min-w-0">
          {Icon && (
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] flex items-center justify-center shrink-0">
              <Icon className="w-4 h-4 text-[var(--text-muted)]" aria-hidden="true" />
            </div>
          )}
          <div className="min-w-0">
            <Heading level={3} className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight truncate">
              {title}
            </Heading>
            {subtitle && (
              <Text variant="muted" className="text-[12px] mt-0.5 truncate">
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
    </motion.div>
  );
}

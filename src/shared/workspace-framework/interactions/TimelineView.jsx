import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * TimelineView
 * ─────────────────────────────────────────────────────────
 * Vertical timeline UX primitive for activity streams,
 * event logs, and chronological data visualization.
 *
 * @param {Array<{id, icon, color, title, description, time, children}>} items
 * @param {string} [className]
 */
export function TimelineView({ items = [], className }) {
  if (items.length === 0) return null

  return (
    <div className={cn('relative', className)}>
      {/* Vertical line */}
      <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[var(--border-subtle)]" />

      <div className="space-y-0">
        {items.map((item, idx) => (
          <TimelineItem key={item.id || idx} {...item} isLast={idx === items.length - 1} />
        ))}
      </div>
    </div>
  )
}

function TimelineItem({ icon: Icon, color = 'accent', title, description, time, children, isLast }) {
  const dotColors = {
    accent: 'bg-[var(--accent)] border-[var(--accent-border)]',
    success: 'bg-[var(--success)] border-[var(--success)]/30',
    warning: 'bg-[var(--warning)] border-[var(--warning)]/30',
    danger: 'bg-[var(--danger)] border-[var(--danger)]/30',
    muted: 'bg-[var(--text-tertiary)] border-[var(--border-default)]',
  }

  return (
    <div className={cn('relative flex gap-3 pl-0', !isLast && 'pb-5')}>
      {/* Dot / Icon */}
      <div className="relative z-10 shrink-0 flex items-start pt-0.5">
        {Icon ? (
          <div className={cn(
            'w-[30px] h-[30px] rounded-full flex items-center justify-center border',
            dotColors[color] || dotColors.accent
          )}>
            <Icon className="w-3.5 h-3.5 text-white" strokeWidth={2} />
          </div>
        ) : (
          <div className={cn(
            'w-[30px] h-[30px] rounded-full border-2 bg-[var(--bg-elevated)]',
            dotColors[color] || dotColors.accent
          )} />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-[13px] font-medium text-[var(--text-primary)] leading-snug">
            {title}
          </p>
          {time && (
            <span className="text-[11px] text-[var(--text-tertiary)] shrink-0 tabular-nums">
              {time}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[12px] text-[var(--text-secondary)] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
        {children && <div className="mt-2">{children}</div>}
      </div>
    </div>
  )
}

/**
 * TimelineGroup
 * ─────────────────────────────────────────────────────────
 * Groups timeline items under a date/label heading.
 *
 * @param {string} label — Group label (e.g. "Today", "Yesterday", "Jul 28")
 * @param {React.ReactNode} children — TimelineView or items
 */
export function TimelineGroup({ label, children, className }) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          {label}
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
      {children}
    </div>
  )
}

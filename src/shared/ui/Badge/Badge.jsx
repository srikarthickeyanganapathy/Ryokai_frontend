import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Badge({ className, variant = 'default', size = 'md', ...props }) {
  const badgeVariants = {
    default: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    primary: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]',
    secondary: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--border-default)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)] border border-transparent',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border border-transparent',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border border-transparent',
  }

  const badgeSizes = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-[var(--radius-xs)]',
    sm: 'text-[11px] px-1.5 py-0.5 rounded-[var(--radius-xs)]',
    md: 'text-[11px] px-2 py-0.5 rounded-[var(--radius-sm)]',
    lg: 'text-xs px-2.5 py-1 rounded-[var(--radius-sm)]',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-medium leading-none whitespace-nowrap transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)]',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  )
}
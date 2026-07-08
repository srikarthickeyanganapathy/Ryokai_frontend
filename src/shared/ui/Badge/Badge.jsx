import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Badge({ className, variant = 'default', size = 'md', ...props }) {
  const badgeVariants = {
    default: 'bg-[var(--bg-elevated)] text-[var(--text-primary)] border border-[var(--color-border-default)]',
    primary: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/20',
    secondary: 'bg-[var(--accent-violet)]/10 text-[var(--accent-violet)] border border-[var(--accent-violet)]/20',
    success: 'bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/20',
    warning: 'bg-[var(--warning)]/10 text-[var(--warning)] border border-[var(--warning)]/20',
    danger: 'bg-[var(--error)]/10 text-[var(--error)] border border-[var(--error)]/20',
  }

  const badgeSizes = {
    xs: 'text-[10px] px-1.5 py-0.5 rounded-sm',
    sm: 'text-xs px-2 py-0.5 rounded',
    md: 'text-xs px-2.5 py-1 rounded-md',
    lg: 'text-sm px-3 py-1 rounded-md',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center font-semibold transition-colors',
        badgeVariants[variant],
        badgeSizes[size],
        className
      )}
      {...props}
    />
  )
}

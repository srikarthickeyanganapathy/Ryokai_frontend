import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Text({ 
  children, 
  className, 
  variant = 'default',
  size = 'md',
  ...props 
}) {
  const sizes = {
    xs: 'text-[11px] leading-[1.5]',
    sm: 'text-[13px] leading-[1.55]',
    md: 'text-[14px] leading-[1.6]',
    lg: 'text-base leading-[1.6]',
    xl: 'text-lg leading-[1.5]',
  }

  const variants = {
    default: 'text-[var(--text-primary)]',
    muted: 'text-[var(--text-secondary)]',
    tertiary: 'text-[var(--text-tertiary)]',
    success: 'text-[var(--success)]',
    warning: 'text-[var(--warning)]',
    danger: 'text-[var(--error)]',
  }

  return (
    <p 
      className={cn(
        sizes[size],
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </p>
  )
}
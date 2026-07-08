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
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
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
        'leading-7',
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

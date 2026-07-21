import React, { forwardRef } from 'react'
import { cn } from '@/shared/lib/cn'

export const Surface = forwardRef(({ 
  className, 
  variant = 'flat', 
  radius = 'md',
  as: Component = 'div',
  ...props 
}, ref) => {
  const variants = {
    flat: 'bg-[var(--bg-base)] border border-transparent',
    elevated: 'bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
    glass: 'bg-[var(--bg-elevated)]/60 backdrop-blur-2xl border border-[var(--border-subtle)]/50 shadow-[var(--shadow-md),var(--inset-highlight-soft)]',
    outlined: 'bg-transparent border border-[var(--border-strong)]',
    interactive: 'bg-[var(--bg-elevated)]/80 backdrop-blur-xl border border-[var(--border-subtle)] shadow-[var(--shadow-sm),var(--inset-highlight-soft)] hover:bg-[var(--bg-elevated)] hover:border-[var(--border-default)] hover:shadow-[var(--shadow-md),var(--inset-highlight)] hover:-translate-y-[2px] active:translate-y-0 active:shadow-[var(--shadow-xs)] transition-all cursor-pointer',
  }

  const radii = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-md)]',
    md: 'rounded-[var(--radius-lg)]',
    lg: 'rounded-[var(--radius-xl)]',
    xl: 'rounded-[var(--radius-2xl)]',
    '2xl': 'rounded-[var(--radius-3xl)]',
    pill: 'rounded-[var(--radius-pill)]',
  }

  return (
    <Component
      ref={ref}
      className={cn(
        'transition-[background-color,border-color,box-shadow,transform] duration-[var(--duration-base)] ease-[var(--ease-out)]',
        variants[variant],
        radii[radius],
        className
      )}
      {...props}
    />
  )
})

Surface.displayName = 'Surface'
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
    elevated: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs),var(--inset-highlight-soft)]',
    glass: 'glass-panel shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
    outlined: 'bg-transparent border border-[var(--border-strong)]',
    interactive: 'bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-[var(--shadow-xs),var(--inset-highlight-soft)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-md),var(--inset-highlight)] hover:-translate-y-[1px] active:translate-y-0 active:shadow-[var(--shadow-xs),var(--inset-highlight-soft)] active:duration-[var(--duration-fast)] cursor-pointer',
  }

  const radii = {
    none: 'rounded-none',
    sm: 'rounded-[var(--radius-sm)]',
    md: 'rounded-[var(--radius-md)]',
    lg: 'rounded-[var(--radius-lg)]',
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
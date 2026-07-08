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
    elevated: 'bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-level-1)]',
    glass: 'bg-[var(--bg-glass)] backdrop-blur-xl border border-[var(--color-border-default)] shadow-[var(--shadow-level-2)]',
    outlined: 'bg-transparent border border-[var(--color-border-strong)]',
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
        'transition-colors duration-200',
        variants[variant],
        radii[radius],
        className
      )}
      {...props}
    />
  )
})

Surface.displayName = 'Surface'

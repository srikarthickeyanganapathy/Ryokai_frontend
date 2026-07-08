import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Caption({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <span 
      className={cn(
        'text-sm text-[var(--text-secondary)] font-medium',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

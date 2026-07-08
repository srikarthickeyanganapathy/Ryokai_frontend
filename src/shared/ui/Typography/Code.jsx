import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Code({ 
  children, 
  className, 
  ...props 
}) {
  return (
    <code 
      className={cn(
        'relative rounded bg-[var(--bg-elevated)] px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-[var(--text-primary)] border border-[var(--color-border-subtle)]',
        className
      )}
      {...props}
    >
      {children}
    </code>
  )
}

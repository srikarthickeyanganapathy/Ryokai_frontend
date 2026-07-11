import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Spinner({ className, size = 'md', ...props }) {
  const sizes = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  }

  return (
    <div
      className={cn(
        'inline-block animate-spin rounded-full border-solid border-current border-r-transparent text-[var(--accent)] motion-reduce:animate-[spin_1.5s_linear_infinite]',
        sizes[size],
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}
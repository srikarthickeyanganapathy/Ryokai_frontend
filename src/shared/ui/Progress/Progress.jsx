import React, { forwardRef } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'
import { cn } from '@/shared/lib/cn'

export const Progress = forwardRef(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn(
      'relative h-2 w-full overflow-hidden rounded-full bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]',
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="h-full w-full flex-1 rounded-full bg-[var(--accent)] shadow-[0_0_8px_-1px_var(--accent)] transition-all duration-500 ease-[var(--ease-out)]"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
))
Progress.displayName = ProgressPrimitive.Root.displayName
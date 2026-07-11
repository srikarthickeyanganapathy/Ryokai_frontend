import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * A wrapper component that applies the standard focus ring.
 * Useful for custom interactive elements that don't have it built-in.
 */
export function FocusRing({ children, className }) {
  return (
    <div className={cn('focus-within:outline-none focus-within:shadow-[0_0_0_2px_var(--bg-base),0_0_0_4px_var(--accent)] rounded-[inherit] transition-shadow duration-[var(--duration-base)] ease-[var(--ease-out)]', className)}>
      {children}
    </div>
  )
}
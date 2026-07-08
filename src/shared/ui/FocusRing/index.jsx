import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * A wrapper component that applies the standard focus ring.
 * Useful for custom interactive elements that don't have it built-in.
 */
export function FocusRing({ children, className }) {
  return (
    <div className={cn('focus-within:ring-2 focus-within:ring-[var(--accent-cyan)] focus-within:ring-offset-2 focus-within:ring-offset-[var(--bg-base)] rounded-[inherit]', className)}>
      {children}
    </div>
  )
}

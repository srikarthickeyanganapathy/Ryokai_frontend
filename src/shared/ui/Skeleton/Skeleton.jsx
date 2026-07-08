import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--bg-elevated)]/50', className)}
      {...props}
    />
  )
}

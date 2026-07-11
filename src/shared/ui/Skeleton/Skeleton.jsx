import React from 'react'
import { cn } from '@/shared/lib/cn'

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-md bg-[var(--bg-hover)]',
        'before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--bg-elevated)]/60 before:to-transparent',
        className
      )}
      {...props}
    />
  )
}
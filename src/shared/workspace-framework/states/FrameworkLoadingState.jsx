import React from 'react'
import { cn } from '@/shared/lib/cn'

/**
 * FrameworkLoadingState
 * ---
 * Standardized skeleton loader variants for WEF layouts.
 * Matches the visual rhythm of the layout archetype it fills.
 *
 * @param {'default'|'cards'|'table'|'editor'|'insight'} variant
 * @param {number} [rows=5] -- Number of skeleton rows (for table variant)
 * @param {number} [columns=4] -- Number of skeleton columns (for table variant)
 */
const Bone = ({ className: boneClass }) => (
  <div className={cn('animate-pulse rounded-[var(--radius-md)] bg-[var(--bg-subtle)]/70 border border-[var(--border-subtle)]/30', boneClass)} />
)

export function FrameworkLoadingState({
  variant = 'default',
  rows = 5,
  columns = 4,
  className,
}) {

  if (variant === 'cards') {
    return (
      <div className={cn('space-y-6', className)}>
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Bone className="h-3 w-16" />
            <Bone className="h-6 w-48" />
          </div>
          <Bone className="h-9 w-28 rounded-[var(--radius-md)]" />
        </div>
        {/* Card grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Bone key={i} className="h-36 rounded-[var(--radius-lg)]" />
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={cn('space-y-4', className)}>
        {/* Header + toolbar skeleton */}
        <div className="flex items-center justify-between">
          <Bone className="h-6 w-40" />
          <div className="flex gap-2">
            <Bone className="h-9 w-32 rounded-[var(--radius-md)]" />
            <Bone className="h-9 w-24 rounded-[var(--radius-md)]" />
          </div>
        </div>
        {/* Table rows */}
        <div className="space-y-2">
          <div className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)]">
            {Array.from({ length: columns }).map((_, i) => (
              <Bone key={i} className={cn('h-3', i === 0 ? 'w-32' : 'w-20', 'flex-1')} />
            ))}
          </div>
          {Array.from({ length: rows }).map((_, rowIdx) => (
            <div key={rowIdx} className="flex items-center gap-4 py-2.5">
              {Array.from({ length: columns }).map((_, colIdx) => (
                <Bone key={colIdx} className={cn('h-3', colIdx === 0 ? 'w-40' : 'w-16', 'flex-1')} />
              ))}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (variant === 'editor') {
    return (
      <div className={cn('flex gap-4 h-[500px]', className)}>
        <Bone className="w-56 h-full rounded-[var(--radius-lg)]" />
        <Bone className="flex-1 h-full rounded-[var(--radius-lg)]" />
        <Bone className="w-72 h-full rounded-[var(--radius-lg)]" />
      </div>
    )
  }

  if (variant === 'insight') {
    return (
      <div className={cn('space-y-8', className)}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Bone className="h-5 w-52" />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              <Bone className="h-44 rounded-[var(--radius-lg)]" />
              <Bone className="h-44 rounded-[var(--radius-lg)]" />
              <Bone className="h-44 rounded-[var(--radius-lg)]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  // default
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Bone className="h-3 w-20" />
        <Bone className="h-7 w-56" />
        <Bone className="h-4 w-80" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Bone className="h-28 rounded-[var(--radius-lg)]" />
        <Bone className="h-28 rounded-[var(--radius-lg)]" />
        <Bone className="h-28 rounded-[var(--radius-lg)]" />
      </div>
      <Bone className="h-64 rounded-[var(--radius-lg)]" />
    </div>
  )
}

import React, { memo } from 'react';
import { cn } from '@/shared/lib/cn';

export const Skeleton = memo(function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--bg-subtle)]/70 border border-[var(--color-border-subtle)]/30', className)}
      {...props}
    />
  );
})

export function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex w-full items-center justify-between border-b border-[var(--color-border-subtle)] pb-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 w-[100px]" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex w-full items-center justify-between py-2">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              className={cn('h-4', colIndex === 0 ? 'w-[150px]' : 'w-[80px]')}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonTaskCard({ className }) {
  return (
    <div className={cn("w-full min-h-[105px] bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-md)] p-3 mb-2.5 space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-12 rounded-full" />
      </div>
      <div className="flex items-center justify-between pt-1">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
}

export function SkeletonDashboardCard({ className }) {
  return (
    <div className={cn("p-4 rounded-xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] space-y-2", className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-4 rounded" />
      </div>
      <Skeleton className="h-8 w-16" />
    </div>
  );
}

export function SkeletonSidebar({ className }) {
  return (
    <div className={cn("w-64 h-full p-4 bg-[var(--bg-elevated)] border-r border-[var(--color-border-subtle)] space-y-4", className)}>
      <Skeleton className="h-6 w-32 mb-6" />
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 py-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-36" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonTaskPanel({ className }) {
  return (
    <div className={cn("w-[480px] h-full p-6 bg-[var(--bg-elevated)] border-l border-[var(--color-border-subtle)] space-y-5", className)}>
      <div className="flex items-center justify-between border-b border-[var(--color-border-subtle)] pb-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-5 w-5 rounded" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-20 w-full rounded-lg" />
      </div>
      <div className="space-y-3 pt-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-full rounded" />
        <Skeleton className="h-8 w-full rounded" />
      </div>
    </div>
  );
}

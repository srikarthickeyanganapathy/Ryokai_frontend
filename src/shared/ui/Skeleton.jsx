import React from 'react';
import { cn } from '@/shared/lib/cn';

export function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-[var(--bg-subtle)]', className)}
      {...props}
    />
  );
}

export function TableSkeleton({ rows = 5, columns = 4, className }) {
  return (
    <div className={cn('w-full space-y-3', className)}>
      <div className="flex w-full items-center justify-between border-b border-[var(--border-subtle)] pb-4">
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

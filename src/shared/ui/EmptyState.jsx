import React from 'react';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[300px] bg-[var(--bg-subtle)]/30 rounded-[var(--radius-lg)] border border-[var(--border-subtle)] border-dashed',
        className
      )}
    >
      {Icon && (
        <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-[var(--shadow-sm)] flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-[var(--text-secondary)]" strokeWidth={1.5} />
        </div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--text-secondary)] max-w-sm mb-6 leading-relaxed">
          {description}
        </p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * PremiumCard — standardised premium card for all dashboard widgets.
 * Replaces the 4 different card styling approaches (interactive, glass, custom, elevated)
 * with one consistent premium visual language.
 *
 * Variants:
 *   'default' — elevated card with subtle glow on hover
 *   'accent'  — elevated card with accent left border and soft accent glow
 *   'glass'   — glassmorphism card for overlays
 *   'flat'    — flat card for inline content
 */
export function PremiumCard({
  children,
  variant = 'default',
  className,
  onClick,
  ...props
}) {
  const baseClasses = cn(
    'rounded-[var(--radius-xl)] transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]',
    onClick && 'cursor-pointer'
  );

  const variantClasses = {
    default: cn(
      'bg-[var(--bg-elevated)]/90 backdrop-blur-xl',
      'border border-[var(--border-subtle)]',
      'shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
      'hover:border-[var(--accent-border)]',
      'hover:shadow-[var(--shadow-md),0_0_20px_var(--accent-border)]',
      'hover:-translate-y-[1px]'
    ),
    accent: cn(
      'bg-[var(--bg-elevated)]/90 backdrop-blur-xl',
      'border border-[var(--color-border-subtle)]',
      'border-l-[3px] border-l-[var(--accent)]',
      'shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
      'hover:shadow-[var(--shadow-md),0_0_24px_var(--accent-border)]',
      'hover:-translate-y-[1px]'
    ),
    glass: cn(
      'glass-panel',
      'shadow-[var(--shadow-md),var(--inset-highlight)]'
    ),
    flat: cn(
      'bg-transparent',
      'border border-transparent',
      'hover:border-[var(--border-subtle)]'
    ),
  };

  return (
    <div
      className={cn(baseClasses, variantClasses[variant], className)}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function PremiumCardHeader({ children, className }) {
  return (
    <div className={cn('flex items-center justify-between px-5 pt-5 pb-3', className)}>
      {children}
    </div>
  );
}

export function PremiumCardTitle({ children, icon: Icon, className }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {Icon && <Icon className="h-4 w-4 text-[var(--accent)] shrink-0" />}
      <h3 className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
        {children}
      </h3>
    </div>
  );
}

export function PremiumCardContent({ children, className }) {
  return (
    <div className={cn('px-5 pb-5', className)}>
      {children}
    </div>
  );
}

export function PremiumCardFooter({ children, className }) {
  return (
    <div className={cn('flex items-center gap-2 px-5 pb-5 border-t border-[var(--border-subtle)] pt-3 mt-1', className)}>
      {children}
    </div>
  );
}

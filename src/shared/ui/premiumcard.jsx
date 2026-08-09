import React from 'react';
import { cn } from '@/shared/lib/cn';

/**
 * PremiumCard — elevated card system with premium visual language.
 *
 * Variants:
 *   'default'  — elevated card with subtle glow hover
 *   'accent'   — accent left border + soft accent glow
 *   'gradient' — subtle gradient top bar + depth
 *   'glass'    — glassmorphism card for overlays
 *   'flat'     — flat card for inline content
 *   'stat'     — compact stat display with icon accent
 *   'insight'  — AI insight card with purple shimmer
 */
export function PremiumCard({
  children,
  variant = 'default',
  className,
  onClick,
  padded = true,
  ...props
}) {
  const baseClasses = cn(
    'transition-all duration-[var(--duration-slow)] ease-[var(--ease-out)]',
    onClick && 'cursor-pointer'
  );

  const variantClasses = {
    default: cn(
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-subtle)]',
      'rounded-[var(--radius-2xl)]',
      'shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
      'hover:border-[var(--accent-border)]',
      'hover:shadow-[var(--shadow-md),0_0_24px_var(--accent-border)]',
      'hover:-translate-y-[1px]'
    ),
    accent: cn(
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-subtle)]',
      'border-l-[3px] border-l-[var(--accent)]',
      'rounded-[var(--radius-2xl)]',
      'shadow-[var(--shadow-sm),var(--inset-highlight-soft)]',
      'hover:shadow-[var(--shadow-md),0_0_24px_var(--accent-border)]',
      'hover:-translate-y-[1px]'
    ),
    gradient: cn(
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-subtle)]',
      'rounded-[var(--radius-2xl)]',
      'shadow-[var(--shadow-sm)]',
      'relative overflow-hidden',
      'before:absolute before:inset-x-0 before:top-0 before:h-[3px]',
      'before:bg-[var(--accent-gradient)]',
      'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300',
      'hover:shadow-[var(--shadow-lg)] hover:-translate-y-[1px]'
    ),
    glass: cn(
      'glass-panel',
      'rounded-[var(--radius-2xl)]',
      'shadow-[var(--shadow-md),var(--inset-highlight)]'
    ),
    flat: cn(
      'bg-transparent',
      'border border-transparent rounded-[var(--radius-2xl)]',
      'hover:border-[var(--border-subtle)]'
    ),
    stat: cn(
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-subtle)]',
      'rounded-[var(--radius-xl)]',
      'shadow-[var(--shadow-xs)]',
      'hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-sm)]',
      'hover:-translate-y-[1px]',
      'transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]',
      onClick && 'cursor-pointer'
    ),
    insight: cn(
      'bg-[var(--bg-elevated)]',
      'border border-[var(--border-subtle)]',
      'rounded-[var(--radius-2xl)]',
      'shadow-[var(--shadow-sm)]',
      'relative overflow-hidden',
      'before:absolute before:inset-0 before:bg-gradient-to-br before:from-purple-500/3 before:via-transparent before:to-transparent',
      'before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-500',
      'hover:border-purple-500/20 hover:shadow-[var(--shadow-md),0_0_30px_rgba(139,92,246,0.1)]',
      'hover:-translate-y-[1px]'
    ),
  };

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        padded && variant !== 'stat' && 'p-5',
        padded && variant === 'stat' && 'p-4',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export function PremiumCardHeader({ children, className, divider = false }) {
  return (
    <div className={cn(
      'flex items-center justify-between px-5 pt-5 pb-3',
      divider && 'border-b border-[var(--border-subtle)] pb-4',
      className
    )}>
      {children}
    </div>
  );
}

export function PremiumCardTitle({ children, icon: Icon, className, accent = false }) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      {Icon && (
        <div className={cn(
          'w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center shrink-0',
          accent ? 'bg-[var(--accent-soft)]' : 'bg-[var(--bg-subtle)]'
        )}>
          <Icon className={cn(
            'w-4 h-4',
            accent ? 'text-[var(--accent)]' : 'text-[var(--text-secondary)]'
          )} strokeWidth={1.5} />
        </div>
      )}
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
    <div className={cn(
      'flex items-center gap-2 px-5 pb-5',
      'border-t border-[var(--border-subtle)] pt-3 mt-1',
      className
    )}>
      {children}
    </div>
  );
}

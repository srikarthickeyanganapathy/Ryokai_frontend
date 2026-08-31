import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { EASING } from '@/shared/lib/uxTokens';
import { useModuleIdentity } from '@/shared/lib/workspaceAwareness';
import {
  AlertTriangle, WifiOff, Shield, Circle, CheckCircle2,
  FolderKanban, Plus, RefreshCw
} from 'lucide-react';
import { Button } from '@/shared/ui/Button';
import { Skeleton } from '@/shared/ui/Skeleton';

/**
 * PageState -- Unified page lifecycle renderer.
 * ---
 * Replaces per-page ad-hoc state handling with a single wrapper.
 * Every page becomes:
 *
 *   <PageShell>
 *     <PageHero />
 *     <PageState state={pageState}>
 *       <PageContent>...</PageContent>
 *     </PageState>
 *   </PageShell>
 *
 * Supported states:
 *   loading      -- Skeleton loader; pass `stateProps.skeleton` for a
 *                  structure-matched skeleton, or pick `loadingVariant`
 *                  from table | cards | dashboard | list | insight | calendar
 *   empty        -- Module-aware empty state with CTA
 *   error        -- Error with retry
 *   offline      -- Offline indicator
 *   unauthorized -- Access denied
 *   ready        -- Passes children through
 *
 * Every state is presented with consistent spacing, typography,
 * and animation -- no page deviates.
 */

const stateConfigs = {
  loading: {
    icon: null, // skeleton handles its own visual
    title: null,
    tone: 'neutral',
  },
  empty: {
    icon: FolderKanban,
    tone: 'neutral',
  },
  error: {
    icon: AlertTriangle,
    title: 'Something went wrong',
    description: 'There was a problem loading this data. Please try again.',
    tone: 'danger',
  },
  offline: {
    icon: WifiOff,
    title: "You're offline",
    description: 'Check your internet connection and try again.',
    tone: 'warning',
  },
  unauthorized: {
    icon: Shield,
    title: 'Access restricted',
    description: "You don't have permission to view this content.",
    tone: 'neutral',
  },
};

const toneWrappers = {
  neutral: 'border-dashed border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30',
  danger: 'border-[var(--danger)]/20 bg-[var(--danger-soft)]/30',
  warning: 'border-[var(--warning)]/20 bg-[var(--warning-soft)]/30',
  success: 'border-[var(--success)]/20 bg-[var(--success-soft)]/30',
};

const toneIconBgs = {
  neutral: 'bg-[var(--bg-elevated)] border border-[var(--border-default)]',
  danger: 'bg-[var(--danger-soft)]',
  warning: 'bg-[var(--warning-soft)]',
  success: 'bg-[var(--success-soft)]',
};

const toneIconColors = {
  neutral: 'text-[var(--text-tertiary)]',
  danger: 'text-[var(--danger)]',
  warning: 'text-[var(--warning)]',
  success: 'text-[var(--success)]',
};

export function PageState({
  state = 'ready',
  stateProps = {},
  moduleId,
  children,
  className,
}) {
  // Module-aware messages for empty state -- must be called before any early return (rules of hooks)
  const moduleIdentity = useModuleIdentity(moduleId);

  // --- LOADING ---
  if (state === 'loading') {
    // Custom structure-matched skeleton wins over generic variants
    if (stateProps.skeleton) {
      return <>{stateProps.skeleton}</>;
    }
    return <PageStateSkeleton variant={stateProps.loadingVariant || 'table'} className={className} />;
  }

  // --- READY ---
  if (state === 'ready') {
    return <>{children}</>;
  }

  // --- ALL OTHER STATES: unified shell ---
  const cfg = stateConfigs[state] || stateConfigs.error;
  const Icon = stateProps.icon || cfg.icon;
  const tone = stateProps.tone || cfg.tone;

  const title = state === 'empty'
    ? (stateProps.title || moduleIdentity?.emptyMessage?.split('.')[0] || 'Nothing here yet')
    : (stateProps.title || cfg.title);

  const description = state === 'empty'
    ? (stateProps.description || moduleIdentity?.emptyMessage || 'Get started by creating your first item.')
    : (stateProps.description || cfg.description);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: EASING.out }}
      className={cn(
        'flex flex-col items-center justify-center p-8 text-center min-h-[320px] rounded-2xl border',
        toneWrappers[tone],
        className
      )}
    >
      {Icon && (
        <motion.div
          animate={tone === 'warning' ? { x: [0, -2, 2, -1, 1, 0] } : { y: [0, -4, 0] }}
          transition={tone === 'warning' ? { duration: 0.4, delay: 0.2 } : { duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className={cn(
            'w-14 h-14 rounded-2xl flex items-center justify-center mb-5 shadow-sm',
            toneIconBgs[tone]
          )}
        >
          <Icon className={cn('w-6 h-6', toneIconColors[tone])} strokeWidth={1.5} />
        </motion.div>
      )}

      {title && (
        <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5 tracking-tight">
          {title}
        </h3>
      )}

      {description && (
        <p className="text-[13px] text-[var(--text-secondary)] max-w-sm leading-relaxed mb-6">
          {description}
        </p>
      )}

      {/* Action slot */}
      {state === 'error' && stateProps.onRetry && (
        <Button
          variant="outline"
          size="sm"
          onClick={stateProps.onRetry}
          className="gap-1.5"
        >
          <RefreshCw size={14} strokeWidth={1.5} />
          Try Again
        </Button>
      )}

      {state === 'empty' && stateProps.action && (
        <div>{stateProps.action}</div>
      )}
      {state === 'empty' && stateProps.onAction && !stateProps.action && (
        <Button
          size="sm"
          onClick={stateProps.onAction}
          className="gap-1.5"
        >
          <Plus size={14} strokeWidth={1.5} />
          {stateProps.actionLabel || 'Create New'}
        </Button>
      )}
    </motion.div>
  );
}

/* --- Skeleton Variants --- */
function PageStateSkeleton({ variant = 'table', className }) {
  if (variant === 'cards') {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5', className)}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-48 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-pulse">
            <div className="p-4 space-y-3">
              <div className="h-4 w-2/3 bg-[var(--bg-elevated)] rounded-lg" />
              <div className="h-3 w-full bg-[var(--bg-elevated)] rounded-lg" />
              <div className="h-3 w-3/4 bg-[var(--bg-elevated)] rounded-lg" />
              <div className="h-8 w-full bg-[var(--bg-elevated)] rounded-xl mt-4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'dashboard') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="h-8 w-48 bg-[var(--bg-subtle)] rounded-lg animate-pulse" />
        <div className="grid grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] animate-pulse" />
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn('space-y-3', className)}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-4">
            <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-8 w-20 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'insight') {
    return (
      <div className={cn('space-y-6', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 grid grid-cols-2 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-6 space-y-3">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'calendar') {
    return (
      <div className={cn('flex flex-col gap-2 h-full min-h-[520px]', className)}>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2 flex-1 auto-rows-fr">
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className="min-h-[72px] w-full rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  // table (default)
  return (
    <div className={cn('rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden', className)}>
      <div className="h-10 bg-[var(--bg-subtle)] animate-pulse" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-[var(--border-subtle)]">
          <div className="h-4 w-4 rounded bg-[var(--bg-subtle)] animate-pulse" />
          <div className="h-4 flex-1 bg-[var(--bg-subtle)] rounded animate-pulse" />
          <div className="h-4 w-24 bg-[var(--bg-subtle)] rounded animate-pulse" />
          <div className="h-4 w-16 bg-[var(--bg-subtle)] rounded animate-pulse" />
        </div>
      ))}
    </div>
  );
}

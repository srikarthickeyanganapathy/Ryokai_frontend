import { RefreshCw, Minus, Plus } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

/**
 * Stepper-style capacity threshold control matching V1 demo.
 * − / value / + / unit label + ghost refresh button.
 */
export function CapacityThresholdControl({
  threshold,
  isLoading,
  onDecrement,
  onIncrement,
  onRefresh,
}) {
  return (
    <div className="flex items-center gap-2.5">
      {/* Stepper */}
      <div
        className="flex items-center bg-[var(--bg-card)] border border-[var(--border-default)] rounded-[var(--radius-sm)] shadow-[var(--shadow-xs)] overflow-hidden"
        title="Capacity threshold — tasks per member"
      >
        <button
          onClick={onDecrement}
          disabled={isLoading}
          aria-label="Decrease threshold"
          className="w-[34px] h-[38px] border-0 bg-transparent text-[15px] font-mono text-[var(--text-secondary)] cursor-pointer transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] disabled:opacity-50"
        >
          <Minus className="w-3.5 h-3.5 mx-auto" />
        </button>
        <div className="min-w-[46px] text-center font-mono font-bold text-[14px] border-l border-r border-[var(--border-subtle)] h-[38px] flex items-center justify-center text-[var(--text-primary)]">
          {threshold}
        </div>
        <button
          onClick={onIncrement}
          disabled={isLoading}
          aria-label="Increase threshold"
          className="w-[34px] h-[38px] border-0 bg-transparent text-[15px] font-mono text-[var(--text-secondary)] cursor-pointer transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5 mx-auto" />
        </button>
        <span className="pr-2.5 text-[11px] text-[var(--text-tertiary)] font-mono uppercase tracking-[0.06em]">
          tasks / member
        </span>
      </div>

      {/* Refresh — ghost style */}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 h-[38px] px-3 rounded-[var(--radius-sm)] border border-transparent text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
        Refresh
      </button>
    </div>
  );
}

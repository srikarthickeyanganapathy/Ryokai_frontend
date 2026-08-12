import { Settings2, RefreshCw } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { cn } from '@/shared/lib/cn';

export function CapacityThresholdControl({
  threshold,
  showThresholdInput,
  tempThreshold,
  isLoading,
  onOpenThresholdInput,
  onTempThresholdChange,
  onSaveThreshold,
  onRefresh,
}) {
  return (
    <div className="flex items-center gap-2">
      {showThresholdInput ? (
        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-lg shadow-sm">
          <Input
            type="number"
            value={tempThreshold}
            onChange={(e) => onTempThresholdChange(Number(e.target.value))}
            className="w-16 h-7 text-sm border-none focus-visible:ring-0 font-mono"
            min={1}
            max={20}
          />
          <Button
            size="sm"
            className="h-7 text-xs"
            onClick={onSaveThreshold}
          >
            Set
          </Button>
        </div>
      ) : (
        <button
          onClick={onOpenThresholdInput}
          className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] shadow-sm text-[12px] font-semibold text-[var(--text-primary)] hover:border-[var(--accent-border)] transition-colors"
          title="Capacity threshold — tasks per member"
        >
          <Settings2 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--text-muted)]">
            Capacity
          </span>
          <span className="font-mono font-bold text-[var(--accent)]">{threshold}</span>
          <span className="font-mono text-[10px] text-[var(--text-muted)]">/ member</span>
        </button>
      )}
      <button
        onClick={onRefresh}
        disabled={isLoading}
        className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-transparent text-[12px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors disabled:opacity-60"
      >
        <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
        Refresh
      </button>
    </div>
  );
}

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
        <div className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border-subtle)] p-1 rounded-lg">
          <Input
            type="number"
            value={tempThreshold}
            onChange={(e) => onTempThresholdChange(Number(e.target.value))}
            className="w-16 h-7 text-sm border-none focus-visible:ring-0"
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
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenThresholdInput}
          className="gap-1.5 text-[12px] h-8"
        >
          <Settings2 className="w-3.5 h-3.5" /> Capacity: {threshold}
        </Button>
      )}
      <Button
        variant="outline"
        size="sm"
        onClick={onRefresh}
        className="gap-1.5 text-[12px] h-8"
        disabled={isLoading}
      >
        <RefreshCw
          className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')}
        />{' '}
        Refresh
      </Button>
    </div>
  );
}

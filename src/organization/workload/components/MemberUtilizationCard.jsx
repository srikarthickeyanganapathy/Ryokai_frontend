import { motion } from 'framer-motion';
import { Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { getTrendDirection, getRiskLevel } from '@/organization/workload/features/utils/workloadCalculations';
import { Sparkline } from './Sparkline';
import { TrendIcon } from './TrendIcon';

export function MemberUtilizationCard({
  row,
  threshold,
  history,
  expanded,
  onToggle,
}) {
  const user = row.user || {};
  const name = user.fullName || user.username || 'Team Member';
  const activeCount = row.totalActiveCount ?? 0;
  const isOver = activeCount > threshold;
  const isHigh = activeCount >= threshold * 0.75 && !isOver;
  const pct = Math.min(
    Math.round((activeCount / threshold) * 100),
    100,
  );
  const userId = user.id || user.username;
  const trendData = history[userId] || [];
  const trend = getTrendDirection(trendData);
  const risk = getRiskLevel(activeCount, threshold);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'rounded-xl bg-[var(--bg-card)] border p-4 transition-all',
        isOver
          ? 'border-[var(--danger)]/30'
          : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]',
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-bold text-[11px] flex items-center justify-center shrink-0 border border-[var(--accent-border)]">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Text className="font-semibold text-[13px] truncate">
              {name}
            </Text>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                  risk.tone === 'danger'
                    ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                    : risk.tone === 'warning'
                      ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                      : 'bg-[var(--accent-soft)] text-[var(--accent)]',
                )}
              >
                {risk.label}
              </span>
              <TrendIcon trend={trend} />
            </div>
          </div>
        </div>
        <div className="text-right">
          <div
            className={cn(
              'text-sm font-mono font-bold',
              isOver
                ? 'text-[var(--danger)]'
                : 'text-[var(--text-primary)]',
            )}
          >
            {activeCount} / {threshold}
          </div>
          <Text
            size="10px"
            variant="muted"
            className="font-mono"
          >
            {pct}%
          </Text>
        </div>
      </div>
      <div className="space-y-1.5 mb-3">
        <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-500',
              isOver
                ? 'bg-[var(--danger)]'
                : isHigh
                  ? 'bg-[var(--warning)]'
                  : 'bg-[var(--accent)]',
            )}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {row.todoCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Todo
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--accent)]">
            {row.inProgressCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Prog
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {row.submittedCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Sub
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--success)]">
            {row.approvedCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)]">
            Appr
          </div>
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggle}
        className="w-full text-xs h-7"
      >
        {expanded ? 'Hide Details' : 'View Trend Analysis'}
      </Button>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border-subtle)] flex flex-col items-center gap-2">
          <Sparkline
            data={trendData}
            color={
              isOver ? 'var(--danger)' : 'var(--accent)'
            }
          />
          <Text size="xs" variant="muted">
            Capacity History & Trend Analysis
          </Text>
        </div>
      )}
    </motion.div>
  );
}

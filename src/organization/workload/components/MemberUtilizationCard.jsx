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
  const pct = Math.min(Math.round((activeCount / threshold) * 100), 100);
  const userId = user.id || user.username;
  const trendData = history[userId] || [];
  const trend = getTrendDirection(trendData);
  const risk = getRiskLevel(activeCount, threshold);

  const seg = (count) => Math.min(100, Math.round((count / threshold) * 100));
  const segments = [
    { cls: 'bg-slate-300', w: seg(row.todoCount ?? 0) },
    { cls: 'bg-[var(--accent)]', w: seg(row.inProgressCount ?? 0) },
    { cls: 'bg-[var(--warning)]', w: seg(row.submittedCount ?? 0) },
    { cls: 'bg-[var(--success)]', w: seg(row.approvedCount ?? 0) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={cn(
        'relative overflow-hidden rounded-xl bg-[var(--bg-card)] border p-4 transition-all',
        isOver
          ? 'border-[var(--danger)]/30'
          : 'border-[var(--border-subtle)] hover:border-[var(--accent-border)]',
      )}
    >
      <span
        className={cn(
          'absolute inset-x-0 top-0 h-[2px]',
          isOver ? 'bg-[var(--danger)]' : isHigh ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]',
        )}
      />
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={cn(
              'w-8 h-8 rounded-[10px] font-bold text-[11px] flex items-center justify-center shrink-0',
              isOver
                ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                : 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]',
            )}
          >
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <Text className="font-semibold text-[13px] truncate text-[var(--text-primary)]">
              {name}
            </Text>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 text-[9.5px] font-bold px-1.5 py-0.5 rounded-full',
                  risk.tone === 'danger'
                    ? 'bg-[var(--danger-soft)] text-[var(--danger)]'
                    : risk.tone === 'warning'
                      ? 'bg-[var(--warning-soft)] text-[var(--warning)]'
                      : 'bg-[var(--accent-soft)] text-[var(--accent)]',
                )}
              >
                <span
                  className={cn(
                    'w-1 h-1 rounded-full',
                    risk.tone === 'danger'
                      ? 'bg-[var(--danger)]'
                      : risk.tone === 'warning'
                        ? 'bg-[var(--warning)]'
                        : 'bg-[var(--accent)]',
                  )}
                />
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
              isOver ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]',
            )}
          >
            {activeCount} / {threshold}
          </div>
          <Text size="10px" variant="muted" className="font-mono">
            {pct}%
          </Text>
        </div>
      </div>
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-[var(--bg-subtle)] border border-[var(--border-subtle)] mb-1">
        {segments.map((s, i) => (
          <div
            key={i}
            className={cn('h-full transition-all duration-500', s.cls)}
            style={{ width: `${s.w}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between font-mono text-[8.5px] text-[var(--text-muted)] px-0.5 mb-3">
        <span>0</span>
        <span>{Math.round(threshold * 0.5)}</span>
        <span>{Math.round(threshold * 0.75)}</span>
        <span>{threshold}</span>
        <span>{threshold + 4}</span>
      </div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {row.todoCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide text-[8.5px]">
            Todo
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--accent)]">
            {row.inProgressCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide text-[8.5px]">
            Prog
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--text-secondary)]">
            {row.submittedCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide text-[8.5px]">
            Sub
          </div>
        </div>
        <div className="bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md p-2 text-center">
          <div className="text-xs font-mono font-bold text-[var(--success)]">
            {row.approvedCount ?? 0}
          </div>
          <div className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wide text-[8.5px]">
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
            color={isOver ? 'var(--danger)' : 'var(--accent)'}
          />
          <Text size="xs" variant="muted">
            Capacity History &amp; Trend Analysis
          </Text>
        </div>
      )}
    </motion.div>
  );
}

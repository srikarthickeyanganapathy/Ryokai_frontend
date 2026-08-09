import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatCard — premium metric display card
 * Features animated value, trend indicator, and optional sparkline placeholder.
 *
 * Tones: default, accent, success, warning, danger, purple
 * Sizes: sm, md, lg
 */
const toneMap = {
  default: { text: 'text-[var(--text-primary)]', bg: 'bg-[var(--bg-subtle)]', icon: 'text-[var(--text-tertiary)]', dot: 'bg-[var(--text-tertiary)]' },
  accent:  { text: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]', icon: 'text-[var(--accent)]', dot: 'bg-[var(--accent)]' },
  success: { text: 'text-[var(--success)]', bg: 'bg-[var(--success-soft)]', icon: 'text-[var(--success)]', dot: 'bg-[var(--success)]' },
  warning: { text: 'text-[var(--warning)]', bg: 'bg-[var(--warning-soft)]', icon: 'text-[var(--warning)]', dot: 'bg-[var(--warning)]' },
  danger:  { text: 'text-[var(--danger)]', bg: 'bg-[var(--danger-soft)]', icon: 'text-[var(--danger)]', dot: 'bg-[var(--danger)]' },
  purple:  { text: 'text-purple-500', bg: 'bg-purple-500/10', icon: 'text-purple-500', dot: 'bg-purple-500' },
};

export const StatCard = memo(function StatCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  tone = 'default',
  trend,
  trendLabel,
  size = 'md',
  onClick,
  className,
}) {
  const t = toneMap[tone];
  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus;
  const trendColor = trend > 0 ? 'text-[var(--success)]' : trend < 0 ? 'text-[var(--danger)]' : 'text-[var(--text-tertiary)]';

  const sizeMap = {
    sm: { pad: 'p-3.5', value: 'text-lg', icon: 'w-8 h-8 rounded-lg', iconSize: 14, label: 'text-[10px]' },
    md: { pad: 'p-4', value: 'text-2xl', icon: 'w-9 h-9 rounded-lg', iconSize: 16, label: 'text-[11px]' },
    lg: { pad: 'p-5', value: 'text-3xl', icon: 'w-10 h-10 rounded-xl', iconSize: 18, label: 'text-[11px]' },
  };
  const s = sizeMap[size];

  return (
    <motion.button
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'flex items-center gap-3 rounded-[var(--radius-xl)] w-full text-left',
        'bg-[var(--bg-elevated)] border border-[var(--border-subtle)]',
        'shadow-[var(--shadow-xs)]',
        'transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]',
        'hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-sm)]',
        'hover:-translate-y-[1px]',
        onClick && 'cursor-pointer',
        s.pad,
        className
      )}
    >
      {Icon && (
        <div className={cn(s.icon, 'flex items-center justify-center shrink-0', t.bg)}>
          <Icon className={cn(t.icon)} size={s.iconSize} strokeWidth={1.5} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className={cn('font-semibold uppercase tracking-wider text-[var(--text-tertiary)]', s.label)}>
          {label}
        </div>
        <div className="flex items-baseline gap-1 mt-0.5">
          {prefix && <span className="text-sm text-[var(--text-tertiary)] font-medium">{prefix}</span>}
          <span className={cn('font-bold tracking-tight tabular-nums', t.text, s.value)}>
            {value}
          </span>
          {suffix && <span className="text-sm text-[var(--text-tertiary)] font-medium">{suffix}</span>}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon size={12} strokeWidth={2} className={trendColor} />
            <span className={cn('text-[11px] font-medium', trendColor)}>
              {Math.abs(trend)}%
            </span>
            {trendLabel && (
              <span className="text-[11px] text-[var(--text-tertiary)] ml-0.5">{trendLabel}</span>
            )}
          </div>
        )}
      </div>
      {/* Mini sparkline placeholder */}
      {tone === 'accent' && trend !== undefined && (
        <div className="hidden sm:flex items-end gap-[2px] h-8 shrink-0 opacity-40">
          {[0.4, 0.6, 0.3, 0.8, 0.5, 0.7, 0.9].map((h, i) => (
            <div
              key={i}
              className={cn('w-[3px] rounded-full', t.dot)}
              style={{ height: `${h * 100}%` }}
            />
          ))}
        </div>
      )}
    </motion.button>
  );
});

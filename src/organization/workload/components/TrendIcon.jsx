import { TrendingUp, TrendingDown, Minus } from '@/shared/ui/Icons';

export function TrendIcon({ trend }) {
  if (trend === 'increasing') {
    return (
      <span className="flex items-center text-[var(--danger)]">
        <TrendingUp className="w-3 h-3" />
      </span>
    );
  }
  if (trend === 'decreasing') {
    return (
      <span className="flex items-center text-[var(--accent)]">
        <TrendingDown className="w-3 h-3" />
      </span>
    );
  }
  return (
    <span className="flex items-center text-[var(--text-muted)]">
      <Minus className="w-3 h-3" />
    </span>
  );
}

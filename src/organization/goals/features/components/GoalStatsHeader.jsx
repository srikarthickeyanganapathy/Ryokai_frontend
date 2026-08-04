import { Target, TrendingUp, AlertTriangle, Clock, Activity } from 'lucide-react';
import { Text } from '@/shared/ui/Typography';
import { AnimatedNumber } from './ProgressVisuals';
import { cn } from '@/shared/lib/cn';

const TONE_CLASSES = {
  default: 'text-[var(--text-base)]',
  accent: 'text-[var(--accent)]',
  warning: 'text-[var(--warning)]',
  danger: 'text-[var(--danger)]',
};

function StatCard({ icon: Icon, label, value, suffix, tone = 'default' }) {
  return (
    <div className="glass-panel rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-3 flex items-center gap-3 transition-colors hover:border-[var(--accent-border)]">
      <div
        className={cn(
          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-[var(--bg-subtle)]',
          TONE_CLASSES[tone],
        )}
      >
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <Text
          size="xs"
          variant="muted"
          className="font-mono uppercase tracking-wider text-[10px] block leading-tight"
        >
          {label}
        </Text>
        <AnimatedNumber
          value={value}
          suffix={suffix}
          className="text-lg font-semibold font-mono leading-tight block"
        />
      </div>
    </div>
  );
}

export function GoalStatsHeader({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 mb-4">
      <StatCard icon={Target} label="Total Goals" value={stats.total} />
      <StatCard icon={TrendingUp} label="On Track" value={stats.onTrack} tone="accent" />
      <StatCard
        icon={AlertTriangle}
        label="Need Attention"
        value={stats.needAttention}
        tone="danger"
      />
      <StatCard
        icon={Clock}
        label="Ending This Week"
        value={stats.endingThisWeek}
        tone="warning"
      />
      <StatCard
        icon={Activity}
        label="Avg Progress"
        value={stats.avgProgress}
        suffix="%"
        tone="accent"
      />
    </div>
  );
}

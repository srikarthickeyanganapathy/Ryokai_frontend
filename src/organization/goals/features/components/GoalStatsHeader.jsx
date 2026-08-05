import { Target, TrendingUp, AlertTriangle, Clock, Activity } from '@/shared/ui/Icons';
import { ImmersiveStatCard, MetricGrid } from '@/shared/ui/Immersive';

export function GoalStatsHeader({ stats }) {
  return (
    <MetricGrid columns={5} className="mb-4">
      <ImmersiveStatCard icon={Target} label="Total Goals" value={stats.total} />
      <ImmersiveStatCard icon={TrendingUp} label="On Track" value={stats.onTrack} tone="accent" />
      <ImmersiveStatCard
        icon={AlertTriangle}
        label="Need Attention"
        value={stats.needAttention}
        tone="danger"
      />
      <ImmersiveStatCard
        icon={Clock}
        label="Ending This Week"
        value={stats.endingThisWeek}
        tone="warning"
      />
      <ImmersiveStatCard
        icon={Activity}
        label="Avg Progress"
        value={`${stats.avgProgress}%`}
        tone="accent"
      />
    </MetricGrid>
  );
}

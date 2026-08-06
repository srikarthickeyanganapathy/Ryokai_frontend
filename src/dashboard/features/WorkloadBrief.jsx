import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { Users, AlertCircle, TrendingUp, TrendingDown, Minus } from '@/shared/ui/Icons';
import { motion } from 'framer-motion';

function getLoadLevel(count, max) {
  const ratio = max > 0 ? count / max : 0;
  if (ratio >= 0.9) return { label: 'Overloaded', color: 'bg-red-500', textColor: 'text-red-500', icon: AlertCircle };
  if (ratio >= 0.6) return { label: 'Heavy', color: 'bg-amber-500', textColor: 'text-amber-500', icon: TrendingUp };
  if (ratio >= 0.3) return { label: 'Moderate', color: 'bg-blue-500', textColor: 'text-blue-500', icon: Minus };
  return { label: 'Light', color: 'bg-green-500', textColor: 'text-green-500', icon: TrendingDown };
}

export function WorkloadBrief() {
  const { activeOrganization } = useWorkspace();

  const { data: workloadMatrix, isLoading } = useQuery({
    queryKey: ['workload', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const res = await api.get(`/organizations/${activeOrganization.id}/workload`);
      return res.data;
    },
    enabled: !!activeOrganization
  });

  if (isLoading) {
    return (
      <PremiumCard>
        <PremiumCardHeader>
          <Skeleton className="h-5 w-32" />
        </PremiumCardHeader>
        <PremiumCardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-28 rounded-full" />
              <Skeleton className="h-4 w-16 rounded-full" />
            </div>
          ))}
        </PremiumCardContent>
      </PremiumCard>
    );
  }

  const members = workloadMatrix || [];
  const maxTasks = Math.max(...members.map(m => m.totalActiveCount), 1);

  return (
    <PremiumCard variant="interactive">
      <PremiumCardHeader>
        <PremiumCardTitle icon={Users}>
          Workload
        </PremiumCardTitle>
        <span className="text-[10px] font-medium text-[var(--text-tertiary)] tabular-nums">
          {members.length} member{members.length !== 1 ? 's' : ''}
        </span>
      </PremiumCardHeader>
      <PremiumCardContent>
        {members.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-[var(--text-tertiary)]">
            <Users className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-xs">No workload data available</p>
          </div>
        ) : (
          <div className="space-y-3">
            {members.slice(0, 5).map((member, idx) => {
              const load = getLoadLevel(member.totalActiveCount, maxTasks);
              const widthPct = Math.max((member.totalActiveCount / maxTasks) * 100, 4);
              return (
                <motion.div
                  key={member.user.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="space-y-1.5"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[10px] font-bold">
                        {member.user.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-[var(--text-primary)]">
                        {member.user.username}
                      </span>
                    </div>
                    <span className={`text-[10px] font-semibold ${load.textColor} tabular-nums`}>
                      {member.totalActiveCount} task{member.totalActiveCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${load.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.6, delay: idx * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}

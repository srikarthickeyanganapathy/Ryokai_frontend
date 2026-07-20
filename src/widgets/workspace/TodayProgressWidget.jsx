import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Text } from '@/shared/ui/Typography';
import { startOfToday, isSameDay, parseISO } from 'date-fns';

export function TodayProgressWidget({ tasks = [] }) {
  const stats = useMemo(() => {
    const today = startOfToday();
    
    // Total due today (not done + done)
    const dueToday = tasks.filter(t => t.dueDate && isSameDay(parseISO(t.dueDate), today));
    const totalDueToday = dueToday.length;
    
    // Completed today
    const completedToday = dueToday.filter(t => t.status === 'Done' || t.status === 'COMPLETED').length;
    
    let completionRate = 0;
    if (totalDueToday > 0) {
      completionRate = Math.round((completedToday / totalDueToday) * 100);
    }
    
    return { completionRate, totalDueToday, completedToday };
  }, [tasks]);

  return (
    <div className="glass-panel mesh-bg p-4 rounded-[var(--radius-lg)] w-full">
      <div className="flex justify-between items-end mb-3">
        <Text variant="muted" className="uppercase tracking-wider text-[11px] font-semibold">
          Today's Progress
        </Text>
        {stats.totalDueToday === 0 ? (
          <Text className="text-sm font-medium text-[var(--text-secondary)]">
            No deadlines today
          </Text>
        ) : (
          <Text className="text-lg font-medium text-[var(--text-primary)] tabular-nums">
            {stats.completionRate}%
          </Text>
        )}
      </div>
      
      {stats.totalDueToday > 0 && (
        <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
          />
        </div>
      )}
    </div>
  );
}

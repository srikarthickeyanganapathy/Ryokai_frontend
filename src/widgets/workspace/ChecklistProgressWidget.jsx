import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Text } from '@/shared/ui/Typography';
import { motion } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';

export function ChecklistProgressWidget({ tasks = [] }) {
  const stats = useMemo(() => {
    let totalItems = 0;
    let completedItems = 0;

    tasks.forEach(task => {
      if (task.checklists && Array.isArray(task.checklists)) {
        totalItems += task.checklists.length;
        completedItems += task.checklists.filter(item => item.isCompleted).length;
      }
    });

    const percentage = totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);

    return { totalItems, completedItems, percentage };
  }, [tasks]);

  return (
    <Card className="h-[320px] flex flex-col shadow-sm border-[var(--border-subtle)] relative overflow-hidden group">
      <div className="absolute -right-8 -top-8 text-[var(--accent-subtle)] opacity-20 group-hover:opacity-30 transition-opacity duration-500">
        <CheckCircle2 size={160} strokeWidth={1} />
      </div>
      
      <CardHeader className="pb-3 pt-4 border-b-0 relative z-10">
        <CardTitle className="text-base font-semibold">Checklist Progress</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-center relative z-10 p-6">
        <div className="flex flex-col items-center text-center space-y-4">
          
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--bg-subtle)"
                strokeWidth="2.5"
              />
              <motion.path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--accent)"
                strokeWidth="2.5"
                strokeDasharray={`${stats.percentage}, 100`}
                initial={{ strokeDasharray: "0, 100" }}
                animate={{ strokeDasharray: `${stats.percentage}, 100` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </svg>
            
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">
                {stats.percentage}%
              </span>
            </div>
          </div>

          <div className="space-y-1">
            <Text className="text-[15px] font-medium text-[var(--text-primary)]">
              {stats.completedItems} / {stats.totalItems} items completed
            </Text>
            <Text variant="muted" size="sm">
              Across all your active personal tasks
            </Text>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

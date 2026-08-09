import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { CheckCircle, Clock, Calendar, Zap, Sparkles } from '@/shared/ui/Icons';
import { motion } from 'framer-motion';

export function DailyBriefWidget({ context }) {
  if (!context?.dailyBrief) return null;
  const { dailyBrief } = context;

  const stats = [
    { icon: CheckCircle, color: 'text-[var(--success)]', bg: 'bg-[var(--success-soft)]', label: 'Focus Tasks', value: dailyBrief.focusTasksCount },
    { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Reminders', value: dailyBrief.remindersCount },
    { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Meetings', value: dailyBrief.meetingsCount },
  ];

  return (
    <PremiumCard className="w-full overflow-hidden border-0 bg-gradient-to-br from-[var(--bg-base)] via-[var(--bg-elevated)] to-[var(--accent-soft)]/20 mb-6">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles size={48} />
      </div>
      <PremiumCardHeader className="pb-2 relative z-10">
        <PremiumCardTitle className="text-xl font-bold flex items-center gap-2">
          {dailyBrief.greeting}
        </PremiumCardTitle>
      </PremiumCardHeader>
      <PremiumCardContent className="relative z-10">
        <div className="flex gap-6 mt-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-center gap-2"
            >
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div>
                <p className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{stat.value}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">{stat.label}</p>
              </div>
            </motion.div>
          ))}
          {dailyBrief.streakMessage && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex items-center gap-2 ml-auto"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10">
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-bold text-purple-500">{dailyBrief.streakMessage}</p>
                <p className="text-[10px] text-[var(--text-tertiary)]">Streak</p>
              </div>
            </motion.div>
          )}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

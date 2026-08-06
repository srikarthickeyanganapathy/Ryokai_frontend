import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { CheckCircle2, Clock, ArrowRight, Target, Rocket, Building2 } from '@/shared/ui/Icons';
import { useDrawerManager } from '@/shared/workspace-framework';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { motion } from 'framer-motion';

const FOCUS_CONFIG = {
  PERSONAL: {
    badge: 'Current Focus',
    badgeClass: 'text-[var(--accent)] border-[var(--accent)]/20 bg-[var(--accent)]/5',
    icon: Target,
    emptyTitle: "You're caught up.",
    emptyDesc: 'No high-priority tasks need your attention right now. Take a breather or plan ahead.',
    emptyIcon: CheckCircle2,
    action: 'Continue Working',
  },
  CREWS: {
    badge: 'Crew Focus',
    badgeClass: 'text-blue-500 border-blue-500/20 bg-blue-500/5',
    icon: Rocket,
    emptyTitle: 'Crew is on track.',
    emptyDesc: 'No crew tasks require immediate action. Check your inbox for updates.',
    emptyIcon: Rocket,
    action: 'Jump In',
  },
  ORG: {
    badge: 'Strategic Focus',
    badgeClass: 'text-purple-500 border-purple-500/20 bg-purple-500/5',
    icon: Building2,
    emptyTitle: 'No blockers detected.',
    emptyDesc: 'Organization workflow is running smoothly. No escalations pending.',
    emptyIcon: Building2,
    action: 'Review Details',
  },
};

export function FocusPanel({ focusTask, resumeContext }) {
  const { open } = useDrawerManager();
  const { workspaceMode, operatingMode, activeCrew, activeOrganization } = useWorkspace();

  const config = FOCUS_CONFIG[workspaceMode] || FOCUS_CONFIG.PERSONAL;
  const EmptyIcon = config.emptyIcon;
  const Icon = config.icon;

  if (!focusTask) {
    return (
      <PremiumCard className="relative overflow-hidden group h-full">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <PremiumCardContent className="pt-6 pb-8 flex flex-col items-center justify-center text-center space-y-4 h-full">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-16 w-16 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-tertiary)] mb-2"
          >
            <EmptyIcon size={32} />
          </motion.div>
          <motion.h2
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-semibold text-[var(--text-primary)]"
          >
            {config.emptyTitle}
          </motion.h2>
          <motion.p
            initial={{ y: 8, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-[var(--text-secondary)] max-w-sm"
          >
            {config.emptyDesc}
          </motion.p>
        </PremiumCardContent>
      </PremiumCard>
    );
  }

  return (
    <PremiumCard 
      variant="interactive"
      className="relative overflow-hidden group h-full cursor-pointer"
      onClick={() => open('task', { taskId: focusTask.id })}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <PremiumCardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.05 }}>
                <Badge variant="outline" className={config.badgeClass}>
                  {config.badge}
                </Badge>
              </motion.div>
              {resumeContext && (
                <span className="text-xs text-[var(--text-secondary)] font-medium flex items-center gap-1">
                  <Clock size={12} /> Resuming
                </span>
              )}
              {workspaceMode === 'CREWS' && activeCrew && (
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                  in {activeCrew.name}
                </span>
              )}
              {workspaceMode === 'ORG' && activeOrganization && (
                <span className="text-xs text-[var(--text-tertiary)] font-medium">
                  in {activeOrganization.name}
                </span>
              )}
            </div>
            
            <h2 className="text-2xl font-semibold text-[var(--text-primary)] line-clamp-2 group-hover:text-[var(--accent)] transition-colors">
              {focusTask.title}
            </h2>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--warning)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--warning)]" />
                </span>
                <span>{focusTask.status || 'In Progress'}</span>
              </div>
              {focusTask.project && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-tertiary)]">•</span>
                  <span>{focusTask.project.name}</span>
                </div>
              )}
              {focusTask.assigneeName && workspaceMode !== 'PERSONAL' && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-tertiary)]">•</span>
                  <span>{focusTask.assigneeName}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="lg" className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-full px-6 shadow-sm group-hover:shadow-[0_0_24px_var(--accent)] transition-all duration-300">
                {config.action}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </motion.div>
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

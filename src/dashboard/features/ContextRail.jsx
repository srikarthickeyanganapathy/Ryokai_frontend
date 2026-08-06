import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { Button } from '@/shared/ui/Button';
import { FileText, Activity, Users, Sparkles, ArrowRight } from '@/shared/ui/Icons';
import { useDrawerManager } from '@/shared/workspace-framework';
import { motion } from 'framer-motion';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 8, scale: 0.96 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] } }
};

export function ContextRail({ suggestedActions, workspaceMode }) {
  const { open } = useDrawerManager();

  const actionCount = suggestedActions?.length || 0;
  const briefingLabel = workspaceMode === 'PERSONAL' ? 'Daily Briefing' : 'Context Briefing';
  const briefingText = actionCount > 0
    ? `You have ${actionCount} key item${actionCount !== 1 ? 's' : ''} aligned for execution today. The team is unblocked — design reviews are pending for tomorrow.`
    : 'Everything is clear. Take a moment to plan or review your backlog.';

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="w-full lg:w-80 flex-shrink-0 space-y-6">
      
      {/* AI Summary / Briefing */}
      <motion.div variants={item}>
        <PremiumCard variant="glass" className="overflow-hidden relative border-0 shadow-lg group/card">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={64} />
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/90 via-[var(--accent)]/80 to-purple-600/90 z-0" />
          <PremiumCardHeader className="relative z-10 pb-1">
            <PremiumCardTitle className="text-sm font-medium flex items-center gap-2 text-white/90">
              <Sparkles size={16} className="text-white" />
              {briefingLabel}
            </PremiumCardTitle>
          </PremiumCardHeader>
          <PremiumCardContent className="relative z-10">
            <p className="text-sm text-white/90 leading-relaxed mb-4">
              {briefingText}
            </p>
            <Button 
              size="sm" 
              variant="secondary" 
              className="w-full bg-white/10 hover:bg-white/20 text-white border-0 transition-all duration-200 group-hover/btn:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles className="mr-2 h-3.5 w-3.5" />
              Summarize Activity
            </Button>
          </PremiumCardContent>
        </PremiumCard>
      </motion.div>

      {/* Context Tools */}
      <motion.div variants={item} className="space-y-3">
        <h3 className="text-sm font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Context Tools</h3>
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: FileText, label: 'Notes', action: () => open('notes') },
            { icon: Activity, label: 'Activity', action: () => open('activity') },
            ...(workspaceMode !== 'PERSONAL'
              ? [{ icon: Users, label: 'Team', action: () => open('team'), span: 'col-span-2' }]
              : []),
          ].map((tool, idx) => (
            <motion.button
              key={tool.label}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
              onClick={tool.action}
              className={`h-20 flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-hover)] hover:shadow-md rounded-xl transition-all duration-200 ${tool.span || ''}`}
            >
              <tool.icon size={20} />
              <span className="text-xs font-medium">{tool.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

    </motion.div>
  );
}

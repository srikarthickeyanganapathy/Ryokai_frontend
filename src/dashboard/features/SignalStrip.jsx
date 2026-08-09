import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { Badge } from '@/shared/ui/Badge';
import { AlertCircle, FileText, CheckSquare, MessageSquare, Bell, ArrowRight } from '@/shared/ui/Icons';
import { useDrawerManager } from '@/shared/workspace-framework';
import { motion } from 'framer-motion';

const SIGNAL_ICON_MAP = {
  APPROVAL_REQUIRED: { icon: CheckSquare, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-soft)]' },
  MENTION: { icon: MessageSquare, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]' },
  BLOCKED: { icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-soft)]' },
  TASK_DUE_SOON: { icon: Bell, color: 'text-[var(--warning)]', bg: 'bg-[var(--warning-soft)]' },
  TASK_OVERDUE: { icon: AlertCircle, color: 'text-[var(--danger)]', bg: 'bg-[var(--danger-soft)]' },
  TASK_COMMENTED: { icon: MessageSquare, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]' },
  ANNOUNCEMENT: { icon: FileText, color: 'text-[var(--accent)]', bg: 'bg-[var(--accent-soft)]' },
};

export function SignalStrip({ interrupts }) {
  const { open } = useDrawerManager();

  if (!interrupts || interrupts.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Signals</h3>
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <Badge variant="danger" className="text-xs animate-pulse">
            {interrupts.length} Action{interrupts.length !== 1 ? 's' : ''} Required
          </Badge>
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {interrupts.map((signal, idx) => {
          const sigConfig = SIGNAL_ICON_MAP[signal.type] || { icon: AlertCircle, color: 'text-slate-500', bg: 'bg-slate-500/10' };
          const SignalIcon = sigConfig.icon;
          return (
            <motion.div
              key={signal.id}
              initial={{ opacity: 0, y: 12, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: idx * 0.06, duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
            >
              <PremiumCard 
                variant="interactive"
                className="!border-l-4 !border-l-[var(--warning)] cursor-pointer"
                onClick={() => {
                  if (signal.taskId) {
                    open('task', { taskId: signal.taskId });
                  } else {
                    open('signal', { signalId: signal.id, signal: signal });
                  }
                }}
              >
                <PremiumCardContent className="p-4 flex gap-3 items-start">
                  <div className={`mt-0.5 ${sigConfig.bg} p-2 rounded-lg`}>
                    <SignalIcon className={`h-4 w-4 ${sigConfig.color}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                      {signal.title}
                    </h4>
                    <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {signal.message}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-[10px] font-medium text-[var(--accent)] opacity-0 group-hover:opacity-100 transition-opacity">
                      View details <ArrowRight size={10} />
                    </div>
                  </div>
                </PremiumCardContent>
              </PremiumCard>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

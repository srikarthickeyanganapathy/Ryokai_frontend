import React from 'react';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from '@/shared/ui/PremiumCard';
import { Button } from '@/shared/ui/Button';
import { useDrawerManager } from '@/shared/workspace-framework';
import { CheckCircle2, Clock, MoreHorizontal, Calendar, GripVertical } from '@/shared/ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

export function ExecutionQueue({ queueOrdering }) {
  const { open } = useDrawerManager();

  if (!queueOrdering || queueOrdering.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-[var(--border-default)] text-[var(--text-tertiary)]"
      >
        <CheckCircle2 size={48} className="mb-4 text-[var(--text-tertiary)]/50" />
        <h3 className="text-lg font-medium text-[var(--text-primary)]">Queue Empty</h3>
        <p className="text-sm text-[var(--text-secondary)]">No remaining tasks in this context.</p>
      </motion.div>
    );
  }

  // Remove the focus task from the queue display since it's in the Focus Panel
  const displayQueue = queueOrdering.slice(1);

  if (displayQueue.length === 0) {
    return null;
  }

  return (
    <PremiumCard variant="glass">
      <PremiumCardHeader>
        <PremiumCardTitle icon={GripVertical}>
          Up Next
        </PremiumCardTitle>
        <span className="text-[10px] font-semibold text-[var(--text-tertiary)] tabular-nums bg-[var(--bg-subtle)] px-2 py-0.5 rounded-full">
          {displayQueue.length} task{displayQueue.length !== 1 ? 's' : ''}
        </span>
      </PremiumCardHeader>
      <PremiumCardContent>
        <AnimatePresence>
          <div className="space-y-2">
            {displayQueue.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 12, height: 0 }}
                transition={{ delay: index * 0.04, duration: 0.2 }}
              >
                <PremiumCard 
                  variant="interactive"
                  className="group flex items-center justify-between p-4"
                  onClick={() => open('task', { taskId: task.id })}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--text-tertiary)] font-mono text-xs w-6 text-center font-bold tabular-nums">
                      {index + 1}
                    </span>
                    
                    <motion.button 
                      whileHover={{ scale: 1.15 }}
                      whileTap={{ scale: 0.9 }}
                      className="w-5 h-5 rounded border border-[var(--border-subtle)] group-hover:border-[var(--accent)] flex items-center justify-center text-transparent group-hover:text-[var(--accent)] transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Trigger completion
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </motion.button>
                    
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                        {task.title}
                      </span>
                      <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] mt-1">
                        {task.project && (
                          <span>{task.project.name}</span>
                        )}
                        {task.dueDate && (
                          <span className="flex items-center gap-1">
                            <Calendar size={12} />
                            {task.dueDate}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {task.priority || 'Normal'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <motion.div
                    initial={{ opacity: 0 }}
                    whileHover={{ opacity: 1 }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1"
                  >
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                      <MoreHorizontal size={16} />
                    </Button>
                  </motion.div>
                </PremiumCard>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </PremiumCardContent>
    </PremiumCard>
  );
}

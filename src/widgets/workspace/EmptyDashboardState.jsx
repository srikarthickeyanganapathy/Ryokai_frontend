import React from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { PlusCircle, Lightbulb } from 'lucide-react';

export function EmptyDashboardState({ onAddTask }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center p-12 h-[300px] border border-dashed border-[var(--border)] rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] text-center space-y-4"
    >
      <div className="w-16 h-16 rounded-full bg-[var(--accent-subtle)] flex items-center justify-center text-[var(--accent)] mb-2 shadow-sm">
        <Lightbulb size={28} />
      </div>
      <Heading level={3} className="text-[18px] font-semibold text-[var(--text-primary)]">
        Your canvas is empty
      </Heading>
      <Text variant="muted" className="max-w-md text-[14px]">
        Personal mode is your frictionless idea dump. Capture your first study task, creative project, or simple reminder.
      </Text>
      <Button 
        onClick={onAddTask} 
        className="mt-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white shadow-md transition-all flex items-center gap-2"
      >
        <PlusCircle size={18} />
        <span>Dump your first idea</span>
      </Button>
    </motion.div>
  );
}

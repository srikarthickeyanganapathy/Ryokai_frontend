/**
 * Ryokai — Micro-Feedback System
 * ─────────────────────────────────────────────────────────
 * One action should update multiple visual cues.
 * Task completion → ripple + counter + progress bar + activity feed.
 *
 * This is what makes software feel alive. Linear excels at this —
 * when you complete a task, the kanban card fades out, the column
 * count decrements with a subtle bounce, the progress bar advances,
 * and the activity feed appends a new entry — all simultaneously.
 *
 * Components:
 *   - CountBubble: animated number counter
 *   - ProgressPulse: progress bar with completion flash
 *   - ActivityToast: inline activity feed insert
 *   - useMicroFeedback: hook coordinating multi-cue updates
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { SPRINGS, EASING } from '@/shared/lib/uxTokens';
import { getMotionForStatus } from '@/shared/lib/statusLanguage.jsx';

/* ─── Animated Count Bubble ─── */
export function CountBubble({ count, prevCount, className }) {
  const changed = count !== prevCount;
  const increased = count > prevCount;

  return (
    <span className={cn('relative inline-flex items-center justify-center tabular-nums', className)}>
      <AnimatePresence mode="popLayout">
        <motion.span
          key={count}
          initial={changed ? { y: increased ? 8 : -8, opacity: 0, scale: 0.6 } : false}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: increased ? -8 : 8, opacity: 0, scale: 0.6 }}
          transition={SPRINGS.snappy}
          className="inline-block"
        >
          {count}
        </motion.span>
      </AnimatePresence>
      {changed && (
        <motion.span
          initial={{ scale: 1.4, opacity: 0.6 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className={cn(
            'absolute inset-0 rounded-full',
            increased ? 'bg-[var(--success)]/20' : 'bg-[var(--warning)]/20'
          )}
        />
      )}
    </span>
  );
}

/* ─── Progress Pulse (for progress bars on completion) ─── */
export function ProgressPulse({ progress, isComplete, className }) {
  return (
    <div className={cn('h-1.5 rounded-full bg-[var(--bg-subtle)] overflow-hidden relative', className)}>
      <motion.div
        className={cn(
          'h-full rounded-full',
          isComplete ? 'bg-[var(--success)]' : 'bg-[var(--accent)]'
        )}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, progress)}%` }}
        transition={{ duration: 0.6, ease: EASING.out }}
      />
      {isComplete && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="absolute inset-0 bg-[var(--success)] rounded-full blur-sm"
        />
      )}
    </div>
  );
}

/* ─── Activity Pulse (flash indicator on new activity) ─── */
export function ActivityPulse({ show, className }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ scale: 0, opacity: 1 }}
      animate={{ scale: 1.5, opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn('w-2 h-2 rounded-full bg-[var(--accent)]', className)}
    />
  );
}

/* ─── Multi-cue Feedback Hook ─── */
export function useMicroFeedback() {
  const [feedback, setFeedback] = useState(null); // { type, message, status }

  const trigger = useCallback((type, meta = {}) => {
    const motion = getMotionForStatus(meta.status || 'COMPLETED');
    setFeedback({ type, message: meta.message, status: meta.status, motion, id: Date.now() });
    setTimeout(() => setFeedback(null), motion.duration + 200);
  }, []);

  return { feedback, trigger };
}

/* ─── Inline Feedback Toast Component ─── */
export function InlineFeedback({ feedback, className }) {
  if (!feedback) return null;

  const { status, message } = feedback;
  const def = status ? require('@/shared/lib/statusLanguage').resolveStatus(status) : null;
  const Icon = def?.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8, height: 0 }}
      animate={{ opacity: 1, y: 0, height: 'auto' }}
      exit={{ opacity: 0, y: -8, height: 0 }}
      transition={SPRINGS.normal}
      className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2',
        def?.variant === 'success' ? 'bg-[var(--success-soft)] text-[var(--success)]' :
        def?.variant === 'danger' ? 'bg-[var(--danger-soft)] text-[var(--danger)]' :
        'bg-[var(--accent-soft)] text-[var(--accent)]'
      )}
    >
      {Icon && <Icon className="w-3 h-3" strokeWidth={2} />}
      {message || 'Updated'}
    </motion.div>
  );
}

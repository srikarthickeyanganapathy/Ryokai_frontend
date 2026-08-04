import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';

/**
 * ImmersivePanel: A premium container with glassmorphism, soft shadows, and smooth hover states.
 * Use this as the base for all major content blocks.
 */
export function ImmersivePanel({ children, className, interactive = false, glowColor }) {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-[var(--bg-card)]/80 backdrop-blur-xl border border-[var(--border-subtle)]/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.08)] transition-all duration-300',
        interactive && 'hover:border-[var(--accent-border)]/80 hover:shadow-[0_8px_32px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 cursor-pointer',
        className
      )}
    >
      {/* Subtle top highlight for depth */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-white/5 rounded-t-2xl pointer-events-none" />
      
      {/* Optional Glow on Hover */}
      {interactive && glowColor && (
        <div 
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none blur-xl"
          style={{ background: `radial-gradient(circle at 50% 0%, ${glowColor}, transparent 70%)` }}
        />
      )}
      
      <div className="relative p-6">{children}</div>
    </div>
  );
}

/**
 * ImmersiveAvatar: A soft, elegant avatar with a subtle ring and gradient background.
 */
export function ImmersiveAvatar({ name, size = 'md', className }) {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl'
  };

  // Generate a deterministic soft gradient based on name
  const hash = name?.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) || 0;
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 40) % 360;

  return (
    <div
      className={cn(
        'relative rounded-full flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10 shrink-0',
        sizes[size],
        className
      )}
      style={{
        background: `linear-gradient(135deg, hsl(${hue1} 70% 60%), hsl(${hue2} 70% 45%))`
      }}
    >
      {name?.charAt(0).toUpperCase() || '?'}
    </div>
  );
}

/**
 * ImmersiveBadge: A pill badge with very soft backgrounds and muted text.
 */
export function ImmersiveBadge({ children, tone = 'neutral', className }) {
  const tones = {
    neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    accent: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]/50',
    success: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    danger: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider border backdrop-blur-sm',
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

/**
 * ImmersiveMetric: A clean, typography-focused metric display without heavy boxes.
 */
export function ImmersiveMetric({ label, value, icon: Icon, tone = 'default' }) {
  const tones = {
    default: 'text-[var(--text-primary)]',
    accent: 'text-[var(--accent)]',
    success: 'text-emerald-500',
    warning: 'text-amber-500',
    danger: 'text-red-500',
  };

  return (
    <div className="flex flex-col gap-1 py-2">
      <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
        {Icon && <Icon className="w-3 h-3" />}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <span className={cn('text-2xl font-bold tracking-tight tabular-nums', tones[tone])}>
        {value}
      </span>
    </div>
  );
}

/**
 * ImmersiveEmptyState: A beautiful, welcoming empty state with subtle animation.
 */
export function ImmersiveEmptyState({ icon: Icon, title, description, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-6 shadow-sm"
        >
          <Icon className="w-7 h-7 text-[var(--text-muted)]" />
        </motion.div>
      )}
      <h3 className="text-lg font-semibold text-[var(--text-primary)] tracking-tight mb-2">{title}</h3>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed mb-6">{description}</p>
      {action}
    </motion.div>
  );
}
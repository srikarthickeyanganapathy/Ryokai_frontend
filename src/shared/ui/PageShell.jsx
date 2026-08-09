/**
 * Ryokai — Page Composition System
 * ─────────────────────────────────────────────────────────
 * Every major module composes the same primitives differently,
 * giving consistency without making every page look identical.
 *
 * Architecture:
 *   PageShell
 *   ├── PageHero        (mission + context)
 *   ├── PageStats       (key metrics strip)
 *   ├── PageToolbar     (filters, search, actions)
 *   ├── PageContent     (main viewport)
 *   ├── PageAside       (context panel, AI, activity)
 *   └── FloatingActions (FAB, bulk actions)
 *
 * Each page composes only the slots it needs, in the order
 * that matches its information hierarchy.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { SPRINGS, TIMING, EASING, STAGGER_FAST } from '@/shared/lib/uxTokens';

/* ══════════════════════════════════════════════════════
 * PageShell — cross-page visual rhythm container
 * ══════════════════════════════════════════════════════ */
export function PageShell({
  children,
  maxWidth = 'default',
  layout = 'default',
  workspaceMode = 'PERSONAL',
  className,
}) {
  const widthMap = {
    narrow: 'max-w-[960px]',
    default: 'max-w-[1280px]',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  const densityMap = {
    PERSONAL: 'gap-6',
    CREWS: 'gap-5',
    ORG: 'gap-4',
  };

  return (
    <motion.main
      variants={STAGGER_FAST.container}
      initial="hidden"
      animate="show"
      className={cn(
        'flex flex-col w-full mx-auto px-4 sm:px-6 lg:px-8 py-6',
        widthMap[maxWidth],
        densityMap[workspaceMode] || densityMap.PERSONAL,
        className
      )}
      data-workspace={workspaceMode}
    >
      {children}
    </motion.main>
  );
}

/* ══════════════════════════════════════════════════════
 * PageHero — Mission + Context (always first)
 * ══════════════════════════════════════════════════════ */
export function PageHero({
  title,
  subtitle,
  eyebrow,
  icon: Icon,
  children,
  actions,
  meta,
  className,
  size = 'default',
}) {
  const sizeMap = {
    compact: 'text-lg font-bold',
    default: 'text-xl sm:text-2xl font-bold',
    prominent: 'text-2xl sm:text-3xl font-bold',
  };

  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn('flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 pb-5 border-b border-[var(--border-subtle)]', className)}
    >
      <div className="min-w-0">
        {(eyebrow || Icon) && (
          <div className="flex items-center gap-2 mb-1.5">
            {Icon && <Icon className="w-4 h-4 text-[var(--accent)] shrink-0" strokeWidth={1.5} />}
            {eyebrow && (
              <span className="text-[11px] font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{eyebrow}</span>
            )}
          </div>
        )}
        <h1 className={cn(sizeMap[size], 'tracking-tight text-[var(--text-primary)]')}>{title}</h1>
        {subtitle && <p className="text-[13px] text-[var(--text-secondary)] mt-1.5 leading-relaxed">{subtitle}</p>}
        {meta && <p className="text-[11px] text-[var(--text-tertiary)] mt-1">{meta}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        {children}
      </div>
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageStats — Key metrics strip (optional, after hero)
 * ══════════════════════════════════════════════════════ */
export function PageStats({ children, className }) {
  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn('grid grid-cols-2 sm:grid-cols-4 gap-3', className)}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageToolbar — Filters, search, view toggles
 * ══════════════════════════════════════════════════════ */
export function PageToolbar({ children, className, sticky = false }) {
  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn(
        'flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 flex-wrap',
        sticky && 'sticky top-0 z-10 bg-[var(--bg-base)]/80 backdrop-blur-xl py-2 -mx-2 px-2',
        className
      )}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageContent — Main content area with adaptive scroll
 * ══════════════════════════════════════════════════════ */
export function PageContent({ children, className, variant = 'default' }) {
  const variants = {
    default: '',
    card: 'rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] shadow-sm overflow-hidden',
    fullBleed: '-mx-4 sm:-mx-6 lg:-mx-8',
  };

  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn('min-h-0 flex-1', variants[variant], className)}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageAside — Context panel (AI, activity, upcoming)
 * ══════════════════════════════════════════════════════ */
export function PageAside({ children, className, width = 'default' }) {
  const widthMap = {
    narrow: 'w-full lg:w-64',
    default: 'w-full lg:w-80',
    wide: 'w-full lg:w-96',
  };

  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn('shrink-0 space-y-4', widthMap[width], className)}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageGrid — two-column layout: content + aside
 * ══════════════════════════════════════════════════════ */
export function PageGrid({ children, className, sidebarWidth = 'default' }) {
  const widthMap = {
    narrow: 'lg:grid-cols-[1fr,260px]',
    default: 'lg:grid-cols-[1fr,320px]',
    wide: 'lg:grid-cols-[1fr,384px]',
  };

  return (
    <motion.div
      variants={STAGGER_FAST.item}
      className={cn('grid grid-cols-1 gap-6', widthMap[sidebarWidth], className)}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * FloatingActions — Corner FAB or bulk action bar
 * ══════════════════════════════════════════════════════ */
export function FloatingActions({ children, position = 'bottom-right', show = true }) {
  if (!show) return null;

  const positions = {
    'bottom-right': 'fixed bottom-6 right-6',
    'bottom-center': 'fixed bottom-6 left-1/2 -translate-x-1/2',
    'top-right': 'fixed top-20 right-6',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      transition={SPRINGS.normal}
      className={cn('z-40', positions[position])}
    >
      {children}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════
 * PageEmptyState — Module-specific empty state template
 * ══════════════════════════════════════════════════════ */
export function PageEmptyState({
  icon: Icon,
  title,
  description,
  action,
  moduleId,
  className,
}) {
  const moduleMessages = {
    projects: { title: 'Start your first project', description: 'Projects organize tasks, track progress, and align your team around shared goals.' },
    goals: { title: 'No active goals', description: 'Set a milestone to track progress towards your objectives.' },
    announcements: { title: 'No announcements today', description: 'Enjoy the silence. Important updates will appear here.' },
    teams: { title: 'No teams yet', description: 'Create a team to organize work and collaborate efficiently.' },
    members: { title: 'No members found', description: 'Invite your team to start collaborating.' },
    calendar: { title: 'Nothing scheduled', description: 'Your day is clear. Add an event or sync your calendar.' },
    tasks: { title: 'All caught up', description: 'No tasks match your current filter. Take a breather.' },
    saved: { title: 'Nothing saved yet', description: 'Bookmark items to access them quickly later.' },
  };

  const msg = moduleId ? moduleMessages[moduleId] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: EASING.out }}
      className={cn('flex flex-col items-center justify-center py-20 text-center', className)}
    >
      {Icon && (
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center mb-5"
        >
          <Icon className="w-6 h-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
        </motion.div>
      )}
      <h3 className="text-base font-semibold text-[var(--text-primary)] mb-1.5">{msg?.title || title || 'Nothing here yet'}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] max-w-sm leading-relaxed mb-6">{msg?.description || description}</p>
      {action}
    </motion.div>
  );
}

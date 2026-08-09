/**
 * Ryokai — Status Language System
 * @deprecated Use `@/shared/lib/statusregistry` instead.
 * The STATUS_MAP and MOTION_PRIORITY here are kept only for backward compat.
 * New code should import { resolveStatus, getSemanticColor, getMotion } from '@/shared/lib/statusregistry'.
 */

import React from 'react';
import { cn } from '@/shared/lib/cn';
import {
  CheckCircle2, Circle, CircleDot, Clock, AlertTriangle,
  XCircle, Archive, Play, Pause, Flag, Star
} from 'lucide-react';

/* ─── Status definitions ─── */
export const STATUS_MAP = {
  // Task/Workflow statuses
  TODO:           { icon: Circle, label: 'To Do',       variant: 'neutral', priority: 'STANDARD' },
  IN_PROGRESS:     { icon: CircleDot, label: 'In Progress', variant: 'active', priority: 'STANDARD' },
  SUBMITTED:      { icon: Clock, label: 'In Review',    variant: 'warning', priority: 'IMPORTANT' },
  APPROVED:       { icon: CheckCircle2, label: 'Approved', variant: 'success', priority: 'STANDARD' },
  COMPLETED:      { icon: CheckCircle2, label: 'Done',     variant: 'success', priority: 'CRITICAL' },
  REJECTED:       { icon: XCircle, label: 'Rejected',    variant: 'danger', priority: 'IMPORTANT' },
  BLOCKED:        { icon: AlertTriangle, label: 'Blocked', variant: 'danger', priority: 'IMPORTANT' },
  ARCHIVED:       { icon: Archive, label: 'Archived',    variant: 'muted', priority: 'SUBTLE' },
  CANCELLED:      { icon: XCircle, label: 'Cancelled',   variant: 'muted', priority: 'SUBTLE' },
  DRAFT:          { icon: Circle, label: 'Draft',         variant: 'neutral', priority: 'SUBTLE' },
  ACTIVE:         { icon: CircleDot, label: 'Active',     variant: 'active', priority: 'STANDARD' },
  ON_HOLD:        { icon: Pause, label: 'On Hold',       variant: 'warning', priority: 'STANDARD' },

  // Priority levels
  URGENT:         { icon: Flag, label: 'Urgent',          variant: 'danger', priority: 'IMPORTANT' },
  HIGH:           { icon: Flag, label: 'High',            variant: 'warning', priority: 'STANDARD' },
  MEDIUM:         { icon: Flag, label: 'Medium',          variant: 'neutral', priority: 'SUBTLE' },
  LOW:            { icon: Flag, label: 'Low',             variant: 'muted', priority: 'SUBTLE' },

  // Health status
  HEALTHY:        { icon: CheckCircle2, label: 'Healthy', variant: 'success', priority: 'SUBTLE' },
  AT_RISK:        { icon: AlertTriangle, label: 'At Risk', variant: 'warning', priority: 'IMPORTANT' },
  CRITICAL:       { icon: XCircle, label: 'Critical',     variant: 'danger', priority: 'CRITICAL' },
};

/* ─── Motion priority presets ─── */
export const MOTION_PRIORITY = {
  CRITICAL: {
    spring: { type: 'spring', stiffness: 400, damping: 20, mass: 0.4 },
    duration: 300,
    ripple: true,        // triggers completion ripple
    scale: true,         // scales element briefly
    glow: true,          // accent glow flash
  },
  IMPORTANT: {
    spring: { type: 'spring', stiffness: 350, damping: 24, mass: 0.5 },
    duration: 250,
    ripple: false,
    scale: true,
    glow: false,
  },
  STANDARD: {
    spring: { type: 'spring', stiffness: 300, damping: 26, mass: 0.6 },
    duration: 200,
    ripple: false,
    scale: false,
    glow: false,
  },
  SUBTLE: {
    spring: { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 },
    duration: 120,
    ripple: false,
    scale: false,
    glow: false,
  },
};

/* ─── Status Badge Component ─── */
export function StatusBadge({ status, size = 'sm', className }) {
  const def = STATUS_MAP[status?.toUpperCase()?.replace(/\s+/g, '_')] || STATUS_MAP.TODO;
  const Icon = def.icon;

  const variantStyles = {
    neutral: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    active: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
    success: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
    warning: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
    danger: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
    muted: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-[var(--border-subtle)]/50',
  };

  const sizeStyles = {
    xs: 'text-[10px] px-1.5 py-0.5 gap-1',
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  return (
    <span className={cn(
      'inline-flex items-center rounded-full border font-medium transition-colors duration-150',
      variantStyles[def.variant],
      sizeStyles[size],
      className
    )}>
      <Icon className={size === 'xs' ? 'w-2.5 h-2.5' : 'w-3 h-3'} strokeWidth={2} />
      {def.label}
    </span>
  );
}

/* ─── Motion-aware wrapper for completion events ─── */
export function CompletionRipple({ children, onComplete }) {
  const [ripple, setRipple] = React.useState(false);

  const handleClick = (e) => {
    if (onComplete) onComplete(e);
    setRipple(true);
    setTimeout(() => setRipple(false), 600);
  };

  return (
    <div className="relative">
      {ripple && (
        <span className="absolute inset-0 rounded-lg bg-[var(--accent)]/20 animate-ping pointer-events-none" />
      )}
      {React.cloneElement(children, { onClick: handleClick })}
    </div>
  );
}

/**
 * Resolve a status string to a status definition.
 * Falls back to TODO if unknown.
 */
export function resolveStatus(status) {
  const key = status?.toUpperCase()?.replace(/\s+/g, '_');
  return STATUS_MAP[key] || STATUS_MAP.TODO;
}

/**
 * Get the motion preset for a given status priority.
 */
export function getMotionForStatus(status) {
  const def = resolveStatus(status);
  return MOTION_PRIORITY[def.priority] || MOTION_PRIORITY.STANDARD;
}

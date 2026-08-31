/**
 * Ryokai -- Semantic Status Registry
 * ---
 * Single source of truth for every product status.
 * Each entry defines: icon, color, motion priority, tone, ARIA label.
 *
 * Extends the earlier statusLanguage.js into a complete registry
 * where ANY component can look up status->presentation in one call.
 *
 * Layers:
 *   Layer 1  -- Visual  (icon, color, variant)
 *   Layer 2  -- Motion  (priority, spring, ripple)
 *   Layer 3  -- Semantic (tone, ARIA label, description)
 *   Layer 4  -- Display (badge, pill, indicator variants)
 */

import {
    Circle, CircleDot, CheckCircle2, Clock, AlertTriangle,
    XCircle, Archive, Play, Pause, Flag, Star, Plus, Minus,
    ArrowRight, TrendingUp, TrendingDown, Shield, Zap,
    Calendar, Users, Megaphone, Target, FolderKanban
} from 'lucide-react';

/* --- Motion priority presets --- */
export const MOTION = {
    CRITICAL: { spring: { type: 'spring', stiffness: 400, damping: 20, mass: 0.4 }, duration: 300, ripple: true, scale: true, glow: true },
    IMPORTANT: { spring: { type: 'spring', stiffness: 350, damping: 24, mass: 0.5 }, duration: 250, ripple: false, scale: true, glow: false },
    STANDARD: { spring: { type: 'spring', stiffness: 300, damping: 26, mass: 0.6 }, duration: 200, ripple: false, scale: false, glow: false },
    SUBTLE: { spring: { type: 'spring', stiffness: 200, damping: 28, mass: 0.8 }, duration: 120, ripple: false, scale: false, glow: false },
};

/* --- Product-semantic color palettes --- */
export const SEMANTIC_COLORS = {
    taskCompleted: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
    goalAchieved: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
    announcementPinned: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
    projectAtRisk: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
    reviewPending: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
    taskBlocked: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
    taskActive: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
    taskDraft: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
    memberOnline: 'bg-emerald-500/20 text-emerald-400 border-transparent',
    memberAway: 'bg-amber-500/20 text-amber-400 border-transparent',
    memberOffline: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-transparent',
    crewActive: 'bg-violet-500/20 text-violet-400 border-violet-500/20',
    crewQuiet: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
};

/* ===
 * Complete Status Registry
 * === */
export const STATUS_REGISTRY = {
    // --- Task Workflow ---
    TODO: {
        icon: Circle, iconStroke: 1.5,
        color: 'neutral', colorClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        motion: MOTION.STANDARD,
        tone: 'neutral',
        ariaLabel: 'To Do task',
        description: 'Work not yet started',
        productSemantic: 'taskDraft',
    },
    IN_PROGRESS: {
        icon: CircleDot, iconStroke: 2,
        color: 'active', colorClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
        motion: MOTION.STANDARD,
        tone: 'active',
        ariaLabel: 'Task in progress',
        description: 'Actively being worked on',
        productSemantic: 'taskActive',
    },
    IN_REVIEW: {
        icon: Clock, iconStroke: 1.5,
        color: 'warning', colorClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'warning',
        ariaLabel: 'Task in review',
        description: 'Awaiting reviewer approval',
        productSemantic: 'reviewPending',
    },
    OPEN: {
        icon: Circle, iconStroke: 1.5,
        color: 'neutral', colorClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        motion: MOTION.STANDARD,
        tone: 'neutral',
        ariaLabel: 'Open task',
        description: 'Work not yet started',
        productSemantic: 'taskDraft',
    },
    SUBMITTED: {
        icon: Clock, iconStroke: 1.5,
        color: 'warning', colorClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'warning',
        ariaLabel: 'Task submitted for review',
        description: 'Awaiting reviewer approval',
        productSemantic: 'reviewPending',
    },
    APPROVED: {
        icon: CheckCircle2, iconStroke: 2,
        color: 'success', colorClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
        motion: MOTION.STANDARD,
        tone: 'success',
        ariaLabel: 'Task approved',
        description: 'Work has been accepted',
        productSemantic: 'taskCompleted',
    },
    COMPLETED: {
        icon: CheckCircle2, iconStroke: 2,
        color: 'success', colorClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
        motion: MOTION.CRITICAL,
        tone: 'success',
        ariaLabel: 'Task completed',
        description: 'Work is done',
        productSemantic: 'taskCompleted',
    },
    DONE: {
        icon: CheckCircle2, iconStroke: 2,
        color: 'success', colorClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
        motion: MOTION.CRITICAL,
        tone: 'success',
        ariaLabel: 'Task done',
        description: 'Work is complete',
        productSemantic: 'taskCompleted',
    },
    REJECTED: {
        icon: XCircle, iconStroke: 2,
        color: 'danger', colorClass: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'danger',
        ariaLabel: 'Task rejected, needs rework',
        description: 'Sent back for changes',
        productSemantic: 'taskBlocked',
    },
    BLOCKED: {
        icon: AlertTriangle, iconStroke: 2,
        color: 'danger', colorClass: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'danger',
        ariaLabel: 'Task is blocked',
        description: 'Cannot proceed due to dependency',
        productSemantic: 'taskBlocked',
    },
    CANCELLED: {
        icon: XCircle, iconStroke: 1.5,
        color: 'muted', colorClass: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-[var(--border-subtle)]/50',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Task cancelled',
        description: 'No longer needed',
        productSemantic: 'taskDraft',
    },
    ARCHIVED: {
        icon: Archive, iconStroke: 1.5,
        color: 'muted', colorClass: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-[var(--border-subtle)]/50',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Task archived',
        description: 'Stored for reference',
        productSemantic: 'taskDraft',
    },
    
    // --- Leave/Exit Request States ---
    OFFBOARDING: {
        icon: Shield, iconStroke: 2,
        color: 'warning', colorClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'warning',
        ariaLabel: 'Offboarding in progress',
        description: 'Offboarding in progress',
        productSemantic: null,
    },
    PENDING: {
        icon: Circle, iconStroke: 1.5,
        color: 'neutral', colorClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        motion: MOTION.STANDARD,
        tone: 'neutral',
        ariaLabel: 'Pending request',
        description: 'Pending',
        productSemantic: null,
    },

    // --- Priority Levels ---
    URGENT: {
        icon: Flag, iconStroke: 2,
        color: 'danger', colorClass: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'danger',
        ariaLabel: 'Urgent priority',
        description: 'Requires immediate attention',
        productSemantic: null,
    },
    HIGH: {
        icon: Flag, iconStroke: 2,
        color: 'warning', colorClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
        motion: MOTION.STANDARD,
        tone: 'warning',
        ariaLabel: 'High priority',
        description: 'Important, complete soon',
        productSemantic: null,
    },
    MEDIUM: {
        icon: Flag, iconStroke: 1.5,
        color: 'neutral', colorClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Medium priority',
        description: 'Normal importance',
        productSemantic: null,
    },
    LOW: {
        icon: Flag, iconStroke: 1.5,
        color: 'muted', colorClass: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-[var(--border-subtle)]/50',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Low priority',
        description: 'Nice to have',
        productSemantic: null,
    },

    // --- Project Health ---
    HEALTHY: {
        icon: CheckCircle2, iconStroke: 2,
        color: 'success', colorClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
        motion: MOTION.STANDARD,
        tone: 'success',
        ariaLabel: 'Project is healthy',
        description: 'On track with no blockers',
        productSemantic: 'goalAchieved',
    },
    AT_RISK: {
        icon: AlertTriangle, iconStroke: 2,
        color: 'warning', colorClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
        motion: MOTION.IMPORTANT,
        tone: 'warning',
        ariaLabel: 'Project is at risk',
        description: 'Deadlines may be missed',
        productSemantic: 'projectAtRisk',
    },
    CRITICAL: {
        icon: XCircle, iconStroke: 2,
        color: 'danger', colorClass: 'bg-[var(--danger-soft)] text-[var(--danger)] border-transparent',
        motion: MOTION.CRITICAL,
        tone: 'danger',
        ariaLabel: 'Project is critical',
        description: 'Immediate action needed',
        productSemantic: 'projectAtRisk',
    },

    // --- Goal States ---
    GOAL_ACTIVE: {
        icon: Target, iconStroke: 1.5,
        color: 'active', colorClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
        motion: MOTION.STANDARD,
        tone: 'active',
        ariaLabel: 'Goal in progress',
        description: 'Working towards this goal',
        productSemantic: null,
    },
    GOAL_ACHIEVED: {
        icon: Star, iconStroke: 2,
        color: 'success', colorClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
        motion: MOTION.CRITICAL,
        tone: 'success',
        ariaLabel: 'Goal achieved',
        description: 'Milestone reached',
        productSemantic: 'goalAchieved',
    },

    // --- Crew States ---
    CREW_ACTIVE: {
        icon: Zap, iconStroke: 2,
        color: 'active', colorClass: 'bg-violet-500/20 text-violet-400 border-violet-500/20',
        motion: MOTION.STANDARD,
        tone: 'active',
        ariaLabel: 'Crew is active',
        description: 'Members are collaborating',
        productSemantic: 'crewActive',
    },
    CREW_QUIET: {
        icon: Circle, iconStroke: 1.5,
        color: 'muted', colorClass: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Crew is quiet',
        description: 'No recent activity',
        productSemantic: 'crewQuiet',
    },

    // --- Announcement States ---
    ANNOUNCEMENT_PINNED: {
        icon: Megaphone, iconStroke: 2,
        color: 'active', colorClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]',
        motion: MOTION.STANDARD,
        tone: 'active',
        ariaLabel: 'Pinned announcement',
        description: 'Important update',
        productSemantic: 'announcementPinned',
    },
    ANNOUNCEMENT_READ: {
        icon: Megaphone, iconStroke: 1.5,
        color: 'muted', colorClass: 'bg-[var(--bg-subtle)]/50 text-[var(--text-tertiary)] border-[var(--border-subtle)]/50',
        motion: MOTION.SUBTLE,
        tone: 'neutral',
        ariaLabel: 'Read announcement',
        description: 'Previously viewed',
        productSemantic: null,
    },
};

/* --- Lookup helpers --- */
export function resolveStatus(status) {
    if (!status) return STATUS_REGISTRY.TODO;
    const key = String(status).toUpperCase().replace(/[\s-]+/g, '_').replace(/^_|_$/g, '');
    return STATUS_REGISTRY[key] || STATUS_REGISTRY.TODO;
}

export function getMotion(status) {
    return resolveStatus(status).motion || MOTION.STANDARD;
}

export function getAriaLabel(status) {
    return resolveStatus(status).ariaLabel || `Status: ${status}`;
}

export function getSemanticColor(status) {
    const def = resolveStatus(status);
    return SEMANTIC_COLORS[def.productSemantic] || def.colorClass || '';
}

/* --- Feedback Orchestration Matrix ---
 * Defines WHICH micro-feedback effects fire for WHICH actions.
 * Prevents the interface from becoming noisy.
 *
 * Legend:
 *   [x]  = fire this effect
 *   [ ]  = skip (would be noise)
 *   ~  = fire with reduced intensity
 */

export const FEEDBACK_MATRIX = {
    'task.complete':   { count: true, toast: true, progress: true, activity: true, ripple: true },
    'task.create':     { count: true, toast: true, progress: true, activity: true, ripple: false },
    'task.delete':     { count: true, toast: true, progress: true, activity: false, ripple: false },
    'task.reassign':   { count: false, toast: true, progress: false, activity: true, ripple: false },
    'task.rename':     { count: false, toast: false, progress: false, activity: true, ripple: false },
    'task.priority':   { count: false, toast: true, progress: false, activity: true, ripple: false },
    'task.dueDate':    { count: false, toast: false, progress: false, activity: true, ripple: false },
    'task.comment':    { count: false, toast: false, progress: false, activity: true, ripple: false },
    'task.block':      { count: false, toast: true, progress: false, activity: true, ripple: false },
    'task.unblock':    { count: false, toast: true, progress: false, activity: true, ripple: false },

    'project.create':  { count: true, toast: true, progress: false, activity: true, ripple: false },
    'project.complete': { count: true, toast: true, progress: true, activity: true, ripple: true },
    'project.archive': { count: true, toast: true, progress: false, activity: true, ripple: false },

    'goal.achieve':    { count: true, toast: true, progress: true, activity: true, ripple: true },
    'goal.create':     { count: true, toast: true, progress: false, activity: true, ripple: false },

    'member.invite':   { count: true, toast: true, progress: false, activity: true, ripple: false },
    'member.join':     { count: true, toast: true, progress: false, activity: true, ripple: false },

    'announcement.post': { count: true, toast: true, progress: false, activity: true, ripple: false },
    'announcement.pin':  { count: false, toast: true, progress: false, activity: true, ripple: false },

    'settings.save':   { count: false, toast: true, progress: false, activity: false, ripple: false },
    'theme.toggle':    { count: false, toast: false, progress: false, activity: false, ripple: false },
};

/**
 * Resolve which effects to fire for a given action type.
 * Returns { count, toast, progress, activity, ripple }.
 */
export function getFeedbackForAction(actionType) {
    return FEEDBACK_MATRIX[actionType] || FEEDBACK_MATRIX['task.rename'];
}

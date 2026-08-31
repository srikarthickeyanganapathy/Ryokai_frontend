/**
 * Ryokai -- Workspace Awareness System
 * ---
 * Different workspaces feel different:
 *
 *   PERSONAL -> relaxed, minimal, focus-driven
 *   ORG      -> professional, dense, structured
 *   CREWS    -> collaborative, social, mission-driven
 *
 * This module provides density presets, visual tone mappings,
 * and workspace-adaptive component wrappers.
 */

import React, { createContext, useContext } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

/* --- Workspace Tone Presets --- */
export const WORKSPACE_TONES = {
  PERSONAL: {
    density: 'relaxed',     // generous spacing, fewer columns
    vibe: 'focus',          // cyan accent, zen undertone
    headerSize: 'prominent', // larger, more personal header
    showSidebar: true,       // sidebar for navigation
    showStats: true,         // personal stats visible
    showAI: true,            // AI copilot visible
    emptyStateTone: 'friendly', // "You're all caught up. Nice!"
    avatarSize: 'md',
    cardVariant: 'default',
    gridColumns: 2,           // 2-col default for personal
    accentHue: 195,           // cyan
    labelPrefix: 'My',        // "My Tasks", "My Projects"
  },
  ORG: {
    density: 'compact',      // tight spacing, max information density
    vibe: 'professional',    // royal blue accent, structured
    headerSize: 'default',   // standard org header
    showSidebar: true,
    showStats: true,
    showAI: false,           // less AI in org context
    emptyStateTone: 'directive', // "Create a team to get started."
    avatarSize: 'sm',
    cardVariant: 'flat',     // flatter cards for density
    gridColumns: 4,           // 4-col default for org dashboards
    accentHue: 230,           // royal blue
    labelPrefix: '',          // "Tasks", "Projects" (no "My")
  },
  CREWS: {
    density: 'balanced',     // medium density
    vibe: 'social',          // purple accent, mission-driven
    headerSize: 'default',
    showSidebar: true,
    showStats: true,
    showAI: true,
    emptyStateTone: 'inviting', // "Join a crew to start collaborating!"
    avatarSize: 'md',
    cardVariant: 'glass',    // glass morphism for crew cards
    gridColumns: 3,           // 3-col default
    accentHue: 270,           // violet/purple
    labelPrefix: 'Crew',      // "Crew Tasks", "Crew Projects"
  },
};

/* --- Workspace-aware context hook --- */
export function useWorkspaceTone() {
  const { workspaceMode, activeCrew, activeOrganization } = useWorkspace();
  const tone = WORKSPACE_TONES[workspaceMode] || WORKSPACE_TONES.PERSONAL;
  return {
    ...tone,
    mode: workspaceMode,
    crew: activeCrew,
    org: activeOrganization,
    accentClass: workspaceMode === 'CREWS' ? 'text-violet-400' : workspaceMode === 'ORG' ? 'text-blue-400' : 'text-cyan-400',
    accentBgClass: workspaceMode === 'CREWS' ? 'bg-violet-500/20' : workspaceMode === 'ORG' ? 'bg-blue-500/20' : 'bg-cyan-500/20',
  };
}

/* --- Workspace-adaptive spacing component --- */
export function WorkspaceSpacing({ children, className }) {
  const { density } = useWorkspaceTone();
  const gapMap = { relaxed: 'gap-6', balanced: 'gap-5', compact: 'gap-4' };
  return <div className={gapMap[density]}>{children}</div>;
}

/* --- Workspace-adaptive grid component --- */
export function WorkspaceGrid({ children, columns }) {
  const { gridColumns } = useWorkspaceTone();
  const cols = columns || gridColumns;
  const gridMap = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };
  return <div className={gridMap[cols] || gridMap[3]}>{children}</div>;
}

/* --- Module identity wrapper --- 
 * Every module gets a visual identity:
 *   Projects  -> progress-centric (radial rings, completion stats)
 *   Goals     -> achievement-centric (milestones, trophies)
 *   Calendar  -> schedule-centric (timeline, time blocks)
 *   Teams     -> directory-centric (avatar grids, role badges)
 *   Announcements -> timeline-centric (chronological feed)
 */
export const MODULE_IDENTITIES = {
  projects: {
    icon: 'FolderKanban',
    identity: 'progress',
    statPriority: ['completion', 'deadlines', 'health', 'tasks'],
    emptyMessage: 'Start your first project to organize tasks and track progress.',
    accentHue: 230,
  },
  goals: {
    icon: 'Target',
    identity: 'achievement',
    statPriority: ['progress', 'milestones', 'alignment', 'impact'],
    emptyMessage: 'Set a goal to track progress towards measurable outcomes.',
    accentHue: 160,
  },
  calendar: {
    icon: 'Calendar',
    identity: 'schedule',
    statPriority: ['today', 'thisWeek', 'overdue', 'upcoming'],
    emptyMessage: 'Nothing scheduled. Your day is clear.',
    accentHue: 35,
  },
  teams: {
    icon: 'Users',
    identity: 'directory',
    statPriority: ['members', 'projects', 'activity', 'capacity'],
    emptyMessage: 'Create a team to organize work and collaborate.',
    accentHue: 290,
  },
  announcements: {
    icon: 'Megaphone',
    identity: 'timeline',
    statPriority: ['recent', 'unread', 'pinned', 'archived'],
    emptyMessage: 'No announcements today. Enjoy the silence.',
    accentHue: 340,
  },
  members: {
    icon: 'Users',
    identity: 'directory',
    statPriority: ['total', 'active', 'new', 'invited'],
    emptyMessage: 'Invite your team to start collaborating.',
    accentHue: 210,
  },
  tasks: {
    icon: 'CheckSquare',
    identity: 'execution',
    statPriority: ['active', 'due', 'completed', 'blocked'],
    emptyMessage: 'All caught up. Take a breather or plan ahead.',
    accentHue: 195,
  },
};

export function useModuleIdentity(moduleId) {
  return MODULE_IDENTITIES[moduleId] || MODULE_IDENTITIES.tasks;
}

import {
  CheckSquare, Briefcase, Settings, Users, Layers,
  ShieldAlert, BarChart2, RefreshCw, Award, Info, Folder
} from 'lucide-react';

export const MODULE_META = {
  TASK: { icon: CheckSquare },
  PROJECT: { icon: Briefcase },
  ORGANIZATION: { icon: Settings },
  MEMBER: { icon: Users },
  TEAM: { icon: Layers },
  ROLE: { icon: ShieldAlert },
  DASHBOARD: { icon: BarChart2 },
  ACTIVITY: { icon: RefreshCw },
  GOAL: { icon: Award },
  ANNOUNCEMENT: { icon: Info },
  DEFAULT: { icon: Folder },
};

export const SCOPE_LABELS = {
  OWN: 'Own',
  PROJECT: 'Project',
  TEAM: 'Team',
  ORGANIZATION: 'Organization',
};

export const SCOPE_DESCRIPTIONS = {
  OWN: 'Only resources created by or assigned to the user.',
  PROJECT: 'Resources within the project scope.',
  TEAM: 'Resources owned by the assigned team.',
  ORGANIZATION: 'All organization resources.',
};

export const GROUP_ORDER = ['READ', 'WRITE', 'WORKFLOW', 'ADMINISTRATION', 'GENERAL'];

export const GROUP_LABELS = {
  READ: 'Read',
  WRITE: 'Write',
  WORKFLOW: 'Workflow',
  ADMINISTRATION: 'Administration',
  GENERAL: 'General',
};

export const getModuleIcon = (code) => (MODULE_META[code] || MODULE_META.DEFAULT).icon;

/**
 * Semantic color tokens — pulled from theme CSS variables so risk/group
 * colors stay consistent with light/dark mode instead of hardcoded hex.
 * Each consumer should reference these vars directly in className/style
 * rather than importing raw hex values.
 */
export const RISK_CONFIG = {
  LOW: {
    dot: 'var(--success)',
    bg: 'var(--success-soft)',
    text: 'var(--success)',
    label: 'Low',
  },
  MEDIUM: {
    dot: 'var(--warning)',
    bg: 'var(--warning-soft)',
    text: 'var(--warning)',
    label: 'Medium',
  },
  HIGH: {
    dot: 'var(--danger)',
    bg: 'var(--danger-soft)',
    text: 'var(--danger)',
    label: 'High',
  },
  CRITICAL: {
    dot: 'var(--danger)',
    bg: 'var(--danger-soft)',
    text: 'var(--danger)',
    label: 'Critical',
  },
};

export const getRiskConfig = (level) => RISK_CONFIG[level] || RISK_CONFIG.LOW;

/** Group badge tokens — same idea, theme-driven instead of raw hex. */
export const GROUP_CONFIG = {
  READ: { text: 'var(--success)', bg: 'var(--success-soft)', label: 'Read' },
  WORKFLOW: { text: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Workflow' },
  WRITE: { text: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Write' },
  ADMINISTRATION: { text: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Admin' },
  GENERAL: { text: 'var(--text-muted)', bg: 'var(--bg-subtle)', label: 'General' },
};

export const getGroupConfig = (group) => GROUP_CONFIG[group] || GROUP_CONFIG.GENERAL;
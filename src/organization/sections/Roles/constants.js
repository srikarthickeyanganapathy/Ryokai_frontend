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

export const RISK_CONFIG = {
  LOW: { dot: '#30A46C', bg: '#ECFDF3', text: '#30A46C', label: 'Low' },
  MEDIUM: { dot: '#F5A623', bg: '#FEF6E7', text: '#B5850B', label: 'Medium' },
  HIGH: { dot: '#E5484D', bg: '#FFF0F0', text: '#E5484D', label: 'High' },
  CRITICAL: { dot: '#CD2B31', bg: '#FEEBEC', text: '#CD2B31', label: 'Critical' },
};

export const getRiskConfig = (level) => RISK_CONFIG[level] || RISK_CONFIG.LOW;

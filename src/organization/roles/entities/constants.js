import { CheckSquare, Briefcase, Settings, Users, Layers, ShieldAlert, BarChart2, RefreshCw, Award, Info, Folder } from '@/shared/ui/Icons';

export const MODULE_META = {
  TASK: { icon: CheckSquare }, PROJECT: { icon: Briefcase }, ORGANIZATION: { icon: Settings }, MEMBER: { icon: Users }, TEAM: { icon: Layers }, ROLE: { icon: ShieldAlert }, DASHBOARD: { icon: BarChart2 }, ACTIVITY: { icon: RefreshCw }, GOAL: { icon: Award }, ANNOUNCEMENT: { icon: Info }, DEFAULT: { icon: Folder },
};

export const MODULE_HUES = {
  TASK: '#A78BFA', PROJECT: '#67E8F9', ORGANIZATION: '#FBBF24', MEMBER: '#34D399', TEAM: '#FB7185',
  ROLE: '#F472B6', DASHBOARD: '#60A5FA', ACTIVITY: '#2DD4BF', GOAL: '#A3E635', ANNOUNCEMENT: '#94A3B8',
};

export const SCOPE_LABELS = { OWN: 'Own', PROJECT: 'Project', TEAM: 'Team', ORGANIZATION: 'Organization' };
export const SCOPE_DESCRIPTIONS = { OWN: 'Only resources created by or assigned to the user.', PROJECT: 'Resources within the project scope.', TEAM: 'Resources owned by the assigned team.', ORGANIZATION: 'All organization resources.' };
export const GROUP_ORDER = ['READ', 'WRITE', 'WORKFLOW', 'ADMINISTRATION', 'GENERAL'];
export const GROUP_LABELS = { READ: 'Read', WRITE: 'Write', WORKFLOW: 'Workflow', ADMINISTRATION: 'Administration', GENERAL: 'General' };

export const getModuleIcon = (code) => (MODULE_META[code] || MODULE_META.DEFAULT).icon;

export const RISK_CONFIG = {
  LOW: { dot: 'var(--success)', bg: 'var(--success-soft)', text: 'var(--success)', label: 'Low', order: 0 },
  MEDIUM: { dot: 'var(--warning)', bg: 'var(--warning-soft)', text: 'var(--warning)', label: 'Medium', order: 1 },
  HIGH: { dot: 'var(--danger)', bg: 'var(--danger-soft)', text: 'var(--danger)', label: 'High', order: 2 },
  CRITICAL: { dot: 'var(--danger)', bg: 'var(--danger-soft)', text: 'var(--danger)', label: 'Critical', order: 3 },
};

export const getRiskConfig = (level) => RISK_CONFIG[level] || RISK_CONFIG.LOW;

export const GROUP_CONFIG = {
  READ: { text: 'var(--success)', bg: 'var(--success-soft)', label: 'Read' },
  WORKFLOW: { text: 'var(--accent)', bg: 'var(--accent-soft)', label: 'Workflow' },
  WRITE: { text: 'var(--warning)', bg: 'var(--warning-soft)', label: 'Write' },
  ADMINISTRATION: { text: 'var(--danger)', bg: 'var(--danger-soft)', label: 'Admin' },
  GENERAL: { text: 'var(--text-muted)', bg: 'var(--bg-subtle)', label: 'General' },
};

export const getGroupConfig = (group) => GROUP_CONFIG[group] || GROUP_CONFIG.GENERAL;

/* --- V10 access levels: one-tap module levels mapped onto permission groups --- */
export const LEVEL_TIERS = [
  { lvl: 1, name: 'View', icon: 'Eye', groups: ['READ'] },
  { lvl: 2, name: 'Work', icon: 'Pencil', groups: ['READ', 'WRITE'] },
  { lvl: 3, name: 'Manage', icon: 'Sliders', groups: ['READ', 'WRITE', 'WORKFLOW'] },
  { lvl: 4, name: 'Full', icon: 'KeyRound', groups: ['READ', 'WRITE', 'WORKFLOW', 'ADMINISTRATION', 'GENERAL'] },
];

export const tierOfGroup = (group) =>
  group === 'READ' ? 1 : group === 'WRITE' ? 2 : group === 'WORKFLOW' ? 3 : 4;

export function computeModuleLevel({ module, enabledCodes, permissionMap }) {
  const set = new Set(enabledCodes || []);
  const tierOfCode = (c) => {
    const p = permissionMap && permissionMap.get ? permissionMap.get(c) : null;
    return p ? tierOfGroup(p.group || 'GENERAL') : 0;
  };
  const perms = module && module.permissions ? module.permissions : [];
  const max = perms.reduce((m, p) => (set.has(p.code) ? Math.max(m, tierOfCode(p.code)) : m), 0);
  if (max === 0) return { cov: 0, max: 0, exact: false };
  let cov = 0;
  for (let L = 1; L <= 4; L++) {
    const covered = perms.filter((p) => tierOfCode(p.code) <= L).every((p) => set.has(p.code));
    if (covered) cov = L;
    else break;
  }
  const allUpToMax = perms.filter((p) => tierOfCode(p.code) <= max).every((p) => set.has(p.code));
  const noneAbove = perms.filter((p) => tierOfCode(p.code) > max).every((p) => !set.has(p.code));
  return { cov, max, exact: allUpToMax && noneAbove };
}

/* --- Role identity hues (monograms / chips) --- */
export const ROLE_HUES = ['#A78BFA', '#67E8F9', '#34D399', '#FBBF24', '#FB7185', '#F472B6', '#60A5FA', '#2DD4BF', '#A3E635', '#F59E0B'];
export const roleHue = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return ROLE_HUES[h % ROLE_HUES.length];
};

/* --- Role purposes -- human-readable intent for each backend role --- */
export const ROLE_PURPOSES = {
  ADMIN: 'Full control over the organization and its members.',
  ENGINEER: 'Builds and ships tasks across projects.',
  PRODUCT: 'Owns product direction and approvals.',
  DESIGN: 'Creates and refines design work.',
  ANALYST: 'Reads data and exports reports.',
  MARKETING: 'Publishes announcements and campaigns.',
  OPERATIONS: 'Keeps the organization running smoothly.',
  GUEST: 'Limited read-only access.',
};
export const rolePurpose = (name) => ROLE_PURPOSES[name] || 'Custom role -- configure its access below.';

/* --- Permission labels -- human action names instead of backend codes (demo rows) --- */
export function permissionLabel(perm) {
  const raw = (perm?.name || perm?.code || '').trim();
  if (!raw) return '';
  // Already human-readable (mixed case or spaced words) -> keep as-is
  if (/[a-z]/.test(raw) && raw !== raw.toUpperCase()) return raw;
  // Backend code (ORG_SETTINGS_UPDATE) -> sentence case (Org Settings Update)
  return raw.replace(/_+/g, ' ').toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase());
}

/* --- Resource chip hue -- deterministic color per resource id --- */
export const resourceHue = (id) => {
  let h = 0;
  const s = String(id || '');
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return ROLE_HUES[h % ROLE_HUES.length];
};

export const CONSOLE = {
  cardShadow: '0 1px 2px rgba(15, 23, 42, 0.04), 0 0 0 1px var(--border-subtle)',
  raisedShadow: '0 4px 12px -4px rgba(15, 23, 42, 0.08), 0 0 0 1px var(--border-subtle)',
  ring: '0 0 0 1px var(--border-subtle)',
};

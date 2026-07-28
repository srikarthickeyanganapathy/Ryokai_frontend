import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { useCreateOrgRole, useUpdateOrgRolePermissions, useUpdateOrgRole } from '@/organization';
import { usePermissionCatalog } from '@/organization';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import {
  Lock, Search, ChevronRight, AlertTriangle, X, Plus, Check,
  Folder, Users, BarChart2, Settings, CheckSquare, Briefcase,
  ShieldAlert, Layers, Award, Info, RefreshCw,
  ShieldCheck, ArrowRight
} from 'lucide-react';

const MODULE_META = {
  TASK: { icon: CheckSquare, accent: 'info' },
  PROJECT: { icon: Briefcase, accent: 'warning' },
  ORGANIZATION: { icon: Settings, accent: 'success' },
  MEMBER: { icon: Users, accent: 'accent' },
  TEAM: { icon: Layers, accent: 'accent' },
  ROLE: { icon: ShieldAlert, accent: 'danger' },
  DASHBOARD: { icon: BarChart2, accent: 'info' },
  ACTIVITY: { icon: RefreshCw, accent: 'muted' },
  GOAL: { icon: Award, accent: 'accent' },
  ANNOUNCEMENT: { icon: Info, accent: 'warning' },
  DEFAULT: { icon: Folder, accent: 'muted' },
};

const ACCENT_CLASSES = {
  accent: 'text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent-border)]',
  info: 'text-[var(--info)] bg-[var(--info-soft)] border-[var(--info-border)]',
  warning: 'text-[var(--warning)] bg-[var(--warning-soft)] border-[var(--warning-border)]',
  success: 'text-[var(--success)] bg-[var(--success-soft)] border-[var(--success-border)]',
  danger: 'text-[var(--danger)] bg-[var(--danger-soft)] border-[var(--danger-border)]',
  muted: 'text-[var(--text-muted)] bg-[var(--bg-subtle)] border-[var(--border-subtle)]',
};

const SCOPE_LABELS = {
  OWN: 'Own',
  PROJECT: 'Project',
  TEAM: 'Team',
  ORGANIZATION: 'Organization'
};

const SCOPE_DESCRIPTIONS = {
  OWN: 'Only resources created by or assigned to the user.',
  PROJECT: 'Can access resources inside the selected project.',
  TEAM: 'Can access resources owned by the assigned team.',
  ORGANIZATION: 'Can access every organization resource.'
};

const getModuleStyle = (moduleCode) => MODULE_META[moduleCode] || MODULE_META.DEFAULT;

const getRiskBadgeVariant = (riskLevel) => {
  switch (riskLevel) {
    case 'CRITICAL': return 'danger';
    case 'HIGH': return 'warning';
    case 'MEDIUM': return 'info';
    default: return 'outline';
  }
};

const GROUP_ORDER = ['READ', 'WRITE', 'WORKFLOW', 'ADMINISTRATION', 'GENERAL'];
const GROUP_LABELS = {
  READ: 'Read',
  WRITE: 'Write',
  WORKFLOW: 'Workflow',
  ADMINISTRATION: 'Administration',
  GENERAL: 'General'
};

export function OrgRolesTab({ orgId, roles = [], rolesLoading }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePriority, setNewRolePriority] = useState(100);
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  const [activeModuleCode, setActiveModuleCode] = useState(null);

  // Map of permissionCode -> scopeCode
  const [localScopedPerms, setLocalScopedPerms] = useState({});
  const [localPriority, setLocalPriority] = useState(100);

  const [confirmPerm, setConfirmPerm] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { data: catalogResponse, isLoading: catalogLoading } = usePermissionCatalog();
  const permissionModules = catalogResponse?.modules || [];

  const ALL_PERMISSIONS = useMemo(() => permissionModules.flatMap(m => m.permissions.map(p => p.code)), [permissionModules]);
  const PERMISSION_MAP = useMemo(() => {
    const map = new Map();
    permissionModules.forEach(m => m.permissions.forEach(p => map.set(p.code, p)));
    return map;
  }, [permissionModules]);

  const createRoleMutation = useCreateOrgRole(orgId);
  const updatePermissionsMutation = useUpdateOrgRolePermissions(orgId);
  const updateRoleMutation = useUpdateOrgRole(orgId);

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      queueMicrotask(() => setSelectedRole(roles[0]));
    } else if (selectedRole) {
      const updated = roles.find(r => r.id === selectedRole.id);
      if (updated && (updated.priority !== selectedRole.priority || JSON.stringify(updated.permissions) !== JSON.stringify(selectedRole.permissions))) {
        queueMicrotask(() => setSelectedRole(updated));
      }
    }
  }, [roles, selectedRole]);

  useEffect(() => {
    if (selectedRole) {
      queueMicrotask(() => {
        const initialMap = {};
        if (selectedRole.permissions) {
          selectedRole.permissions.forEach(p => {
            initialMap[p.code] = p.scope || 'ORGANIZATION';
          });
        }
        setLocalScopedPerms(initialMap);
        setLocalPriority(selectedRole.priority ?? 100);
      });
    } else {
      queueMicrotask(() => {
        setLocalScopedPerms({});
        setLocalPriority(100);
      });
    }
  }, [selectedRole]);

  const originalMap = useMemo(() => {
    const map = {};
    if (selectedRole && selectedRole.permissions) {
      selectedRole.permissions.forEach(p => {
        map[p.code] = p.scope || 'ORGANIZATION';
      });
    }
    return map;
  }, [selectedRole]);

  const handleCreateRole = (e) => {
    e.preventDefault();
    if (!newRoleName.trim()) return;
    createRoleMutation.mutate({
      name: newRoleName.trim().toUpperCase(),
      priority: Number(newRolePriority) || 0
    }, {
      onSuccess: (data) => {
        setNewRoleName('');
        setNewRolePriority(100);
        setIsCreating(false);
        if (data) setSelectedRole(data);
      }
    });
  };

  const filteredRoles = useMemo(() => {
    if (!roleSearchQuery.trim()) return roles;
    return roles.filter(r => r.name.toLowerCase().includes(roleSearchQuery.toLowerCase()));
  }, [roles, roleSearchQuery]);

  const filteredModules = useMemo(() => {
    if (!permSearchQuery.trim()) return permissionModules;
    const query = permSearchQuery.toLowerCase();
    return permissionModules.map(m => ({
      ...m,
      permissions: m.permissions.filter(p =>
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.description && p.description.toLowerCase().includes(query)) ||
        (p.code && p.code.toLowerCase().includes(query))
      )
    })).filter(m => m.permissions.length > 0);
  }, [permissionModules, permSearchQuery]);

  useEffect(() => {
    if (filteredModules.length > 0) {
      if (!activeModuleCode || !filteredModules.find(m => m.moduleCode === activeModuleCode)) {
        setActiveModuleCode(filteredModules[0].moduleCode);
      }
    } else {
      setActiveModuleCode(null);
    }
  }, [filteredModules, activeModuleCode]);

  const togglePermissionLocal = (perm) => {
    if (selectedRole?.name === 'ADMIN') return;
    const isCurrentlyEnabled = Boolean(localScopedPerms[perm.code]);

    if (!isCurrentlyEnabled && (perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH')) {
      setConfirmPerm(perm);
      return;
    }
    commitToggle(perm);
  };

  const commitToggle = (perm) => {
    const code = perm.code;
    setLocalScopedPerms(prev => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
      } else {
        // Default scope: OWN if supported, else recommended/first supported scope
        const supported = perm.supportedScopes && perm.supportedScopes.length > 0 ? perm.supportedScopes : ['ORGANIZATION'];
        const defaultScope = supported.includes('OWN') ? 'OWN' : (perm.recommendedScope || supported[0]);
        next[code] = defaultScope;

        // Proactive dependency auto-enablement
        if (perm.requires && perm.requires.length > 0) {
          perm.requires.forEach(reqCode => {
            if (!next[reqCode]) {
              const reqPerm = PERMISSION_MAP.get(reqCode);
              const reqSupported = reqPerm?.supportedScopes || ['ORGANIZATION'];
              const reqDefault = reqSupported.includes('OWN') ? 'OWN' : (reqPerm?.recommendedScope || reqSupported[0]);
              next[reqCode] = reqDefault;
              toast.info(`${reqPerm?.name || reqCode} auto-enabled`, {
                description: `Required by ${perm.name || code}.`
              });
            }
          });
        }
      }
      return next;
    });
  };

  const handleScopeChange = (code, newScope) => {
    if (selectedRole?.name === 'ADMIN') return;
    setLocalScopedPerms(prev => ({
      ...prev,
      [code]: newScope
    }));
  };

  const activeModuleData = filteredModules.find(m => m.moduleCode === activeModuleCode);

  const groupedPermissions = useMemo(() => {
    if (!activeModuleData) return {};
    const groups = { READ: [], WRITE: [], WORKFLOW: [], ADMINISTRATION: [], GENERAL: [] };
    activeModuleData.permissions.forEach(p => {
      const g = p.group || 'GENERAL';
      if (groups[g]) groups[g].push(p);
      else groups.GENERAL.push(p);
    });
    return groups;
  }, [activeModuleData]);

  const handleEnableAll = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    setLocalScopedPerms(prev => {
      const next = { ...prev };
      activeModuleData.permissions.forEach(p => {
        if (!next[p.code]) {
          const supported = p.supportedScopes && p.supportedScopes.length > 0 ? p.supportedScopes : ['ORGANIZATION'];
          const defaultScope = supported.includes('OWN') ? 'OWN' : (p.recommendedScope || supported[0]);
          next[p.code] = defaultScope;
        }
      });
      return next;
    });
  };

  const handleDisableAll = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const currentModuleCodes = new Set(activeModuleData.permissions.map(p => p.code));
    setLocalScopedPerms(prev => {
      const next = { ...prev };
      currentModuleCodes.forEach(code => delete next[code]);
      return next;
    });
  };

  const handleInvert = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const currentModulePerms = activeModuleData.permissions;
    setLocalScopedPerms(prev => {
      const next = { ...prev };
      currentModulePerms.forEach(p => {
        if (next[p.code]) {
          delete next[p.code];
        } else {
          const supported = p.supportedScopes && p.supportedScopes.length > 0 ? p.supportedScopes : ['ORGANIZATION'];
          const defaultScope = supported.includes('OWN') ? 'OWN' : (p.recommendedScope || supported[0]);
          next[p.code] = defaultScope;
        }
      });
      return next;
    });
  };

  const handleResetModule = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const currentModuleCodes = activeModuleData.permissions.map(p => p.code);
    setLocalScopedPerms(prev => {
      const next = { ...prev };
      currentModuleCodes.forEach(code => {
        if (originalMap[code]) {
          next[code] = originalMap[code];
        } else {
          delete next[code];
        }
      });
      return next;
    });
  };

  const handleDiscardChanges = () => {
    if (selectedRole) {
      setLocalScopedPerms({ ...originalMap });
      setLocalPriority(selectedRole.priority ?? 100);
    }
  };

  const originalPriority = selectedRole?.priority ?? 100;
  const priorityChanged = originalPriority !== Number(localPriority);

  const addedPerms = useMemo(() => {
    return Object.keys(localScopedPerms).filter(code => !originalMap[code]);
  }, [localScopedPerms, originalMap]);

  const removedPerms = useMemo(() => {
    return Object.keys(originalMap).filter(code => !localScopedPerms[code]);
  }, [localScopedPerms, originalMap]);

  const scopeChangedPerms = useMemo(() => {
    return Object.keys(localScopedPerms).filter(code => {
      return originalMap[code] && originalMap[code] !== localScopedPerms[code];
    });
  }, [localScopedPerms, originalMap]);

  const isDirty = addedPerms.length > 0 || removedPerms.length > 0 || scopeChangedPerms.length > 0 || priorityChanged;

  const handleSaveChanges = () => {
    if (!selectedRole || !isDirty) return;

    if (addedPerms.length > 0 || removedPerms.length > 0 || scopeChangedPerms.length > 0) {
      const payloadPermissions = Object.entries(localScopedPerms).map(([code, scopeCode]) => ({
        permissionCode: code,
        scopeCode: scopeCode
      }));
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissions: payloadPermissions
      });
    }

    if (priorityChanged) {
      updateRoleMutation.mutate({
        roleId: selectedRole.id,
        payload: { name: selectedRole.name, priority: Number(localPriority) }
      });
    }

    setShowDetailsModal(false);
  };

  // Authority supervision calculation
  const currentRank = Number(localPriority);
  const supervisionRank = useMemo(() => {
    if (!roles || !selectedRole) return { can: [], cannot: [] };
    const can = [];
    const cannot = [];
    roles.forEach(r => {
      if (r.id === selectedRole.id) return;
      const rPriority = r.priority ?? 100;
      // Lower number = higher authority
      if (currentRank < rPriority) {
        can.push(r.name);
      } else {
        cannot.push(r.name);
      }
    });
    return { can, cannot };
  }, [roles, selectedRole, currentRank]);

  if (rolesLoading || catalogLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Skeleton className="lg:col-span-3 h-64 lg:h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-64 lg:h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-6 h-64 lg:h-[600px] rounded-2xl" />
      </div>
    );
  }

  const enabledList = Object.keys(localScopedPerms);
  const enabledCount = enabledList.length;
  const ownCount = enabledList.filter(c => localScopedPerms[c] === 'OWN').length;
  const projectCount = enabledList.filter(c => localScopedPerms[c] === 'PROJECT').length;
  const teamCount = enabledList.filter(c => localScopedPerms[c] === 'TEAM').length;
  const orgCount = enabledList.filter(c => localScopedPerms[c] === 'ORGANIZATION').length;
  const criticalCount = enabledList.filter(c => PERMISSION_MAP.get(c)?.riskLevel === 'CRITICAL').length;

  return (
    <div className={cn("space-y-6", isDirty && "pb-28")}>
      {/* Role Summary Banner */}
      <div className="flex flex-col gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <Heading level={4} className="text-lg font-bold truncate">{selectedRole ? selectedRole.name : 'Select a Role'}</Heading>
                {selectedRole?.name === 'ADMIN' && <Badge variant="warning" className="text-[10px]">Built-in System Role</Badge>}
              </div>
              <Text variant="muted" size="sm" className="text-xs">
                Configure scope-based authorization rules across organization modules.
              </Text>
            </div>
          </div>

          {selectedRole && (
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-sm w-full md:w-auto">
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--success)]">{enabledCount}</span>
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Enabled</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--text-secondary)]">{ownCount}</span>
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Own</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--info)]">{projectCount}</span>
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Project</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--warning)]">{teamCount}</span>
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Team</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)]">
                <span className="font-bold text-[var(--accent)]">{orgCount}</span>
                <span className="text-[9px] uppercase text-[var(--text-muted)] font-bold">Org</span>
              </div>
              <div className="flex flex-col items-center px-2 py-1 bg-[var(--danger-soft)] rounded-xl border border-[var(--danger-border)]">
                <span className="font-bold text-[var(--danger)]">{criticalCount}</span>
                <span className="text-[9px] uppercase text-[var(--danger)] font-bold">Critical</span>
              </div>
            </div>
          )}
        </div>

        {/* Authority Supervision Hierarchy Bar */}
        {selectedRole && (
          <div className="p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span className="font-semibold text-[var(--text-primary)]">Authority Level {localPriority}</span>
              <span className="text-[var(--text-muted)]">(Lower rank number = higher governance power)</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="text-[var(--text-muted)] font-medium">May supervise:</span>
                {supervisionRank.can.length > 0 ? (
                  supervisionRank.can.map(name => (
                    <Badge key={name} variant="success" className="text-[9px] px-1.5 py-0 font-bold">{name}</Badge>
                  ))
                ) : (
                  <span className="text-[var(--text-muted)] italic">None (Lowest Authority Rank)</span>
                )}
              </div>
              {supervisionRank.cannot.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[var(--text-muted)] font-medium">Cannot supervise:</span>
                  {supervisionRank.cannot.map(name => (
                    <Badge key={name} variant="outline" className="text-[9px] px-1.5 py-0 text-[var(--text-muted)] font-bold">{name}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,3fr)_minmax(0,6fr)] gap-4 sm:gap-6 items-start">
        {/* Roles column */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Roles ({roles.length})</span>
            {!isCreating && (
              <Button variant="ghost" size="sm" onClick={() => setIsCreating(true)} className="h-7 text-xs px-2 text-[var(--accent)]">
                <Plus className="w-3.5 h-3.5 mr-1" /> New
              </Button>
            )}
          </div>

          <Input
            value={roleSearchQuery}
            onChange={(e) => setRoleSearchQuery(e.target.value)}
            placeholder="Search roles..."
            className="h-8 text-xs rounded-lg"
          />

          <AnimatePresence>
            {isCreating && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleCreateRole}
                className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3"
              >
                <Input value={newRoleName} onChange={e => setNewRoleName(e.target.value)} placeholder="ROLE NAME" autoFocus className="h-8 text-xs uppercase font-bold" />
                <Input type="number" min="0" value={newRolePriority} onChange={e => setNewRolePriority(e.target.value)} placeholder="Priority (0=high)" className="h-8 text-xs" />
                <div className="flex gap-2 justify-end">
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsCreating(false)} className="h-7 text-xs px-2">Cancel</Button>
                  <Button type="submit" size="sm" variant="primary" className="h-7 text-xs px-3">Create</Button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          <div className="space-y-2 max-h-[280px] lg:max-h-[600px] overflow-y-auto pr-1">
            {filteredRoles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              const permCount = role.permissions?.length || 0;
              const ratio = ALL_PERMISSIONS.length > 0 ? Math.round((permCount / ALL_PERMISSIONS.length) * 100) : 0;

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-colors flex flex-col gap-2",
                    isSelected
                      ? "bg-[var(--accent-soft)] border-[var(--accent)] shadow-sm"
                      : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight truncate">{role.name}</span>
                    {role.name === 'ADMIN' && <Lock className="w-3.5 h-3.5 text-[var(--warning)] shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                    <span>Authority Level {role.priority ?? 100}</span>
                    <span>{ratio}% ({permCount}/{ALL_PERMISSIONS.length})</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[var(--border-subtle)] overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", role.name === 'ADMIN' ? 'bg-[var(--warning)]' : 'bg-[var(--accent)]')}
                      style={{ width: `${ratio}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {filteredRoles.length === 0 && (
              <div className="p-4 text-center text-xs text-[var(--text-muted)]">No roles match search.</div>
            )}
          </div>
        </div>

        {/* Modules column */}
        {selectedRole && (
          <div className="flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">Modules</span>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <Input
                value={permSearchQuery}
                onChange={(e) => setPermSearchQuery(e.target.value)}
                placeholder="Search permissions..."
                className="pl-9 h-8 text-xs rounded-lg bg-[var(--bg-card)]"
              />
              {permSearchQuery && (
                <button onClick={() => setPermSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" aria-label="Clear search">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-[280px] lg:max-h-[600px] overflow-y-auto pr-1">
              {filteredModules.map(module => {
                const isActive = activeModuleCode === module.moduleCode;
                const { icon: IconComponent, accent } = getModuleStyle(module.moduleCode);
                const accentClass = ACCENT_CLASSES[accent];

                const modPermIds = module.permissions.map(p => p.code);
                const selectedInMod = modPermIds.filter(id => Boolean(localScopedPerms[id])).length;
                const totalInMod = modPermIds.length;
                const ratio = totalInMod > 0 ? (selectedInMod / totalInMod) * 100 : 0;

                return (
                  <div
                    key={module.moduleCode}
                    onClick={() => setActiveModuleCode(module.moduleCode)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-colors flex flex-col gap-2",
                      isActive ? "bg-[var(--bg-subtle)] border border-[var(--border-default)] shadow-sm" : "border border-transparent hover:bg-[var(--bg-subtle)]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-lg border shrink-0", accentClass)}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between gap-1">
                        <span className="font-semibold text-sm truncate">{module.displayName}</span>
                        <ChevronRight className={cn("w-4 h-4 shrink-0 transition-transform", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-medium">
                      <div className="flex h-1.5 w-16 bg-[var(--border-subtle)] rounded-full overflow-hidden shrink-0">
                        <div className="h-full bg-[var(--success)] rounded-full transition-all" style={{ width: `${ratio}%` }} />
                      </div>
                      <span>{selectedInMod} / {totalInMod}</span>
                    </div>
                  </div>
                );
              })}
              {filteredModules.length === 0 && (
                <div className="p-4 text-center text-xs text-[var(--text-muted)]">No modules match search.</div>
              )}
            </div>
          </div>
        )}

        {/* Permission editor column */}
        {selectedRole && (
          <div className="flex flex-col gap-4">
            {activeModuleData ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2 min-w-0">
                    {(() => {
                      const { icon: IconComponent, accent } = getModuleStyle(activeModuleData.moduleCode);
                      return <div className={cn("p-1.5 rounded-lg border shrink-0", ACCENT_CLASSES[accent])}><IconComponent className="w-4 h-4" /></div>;
                    })()}
                    <Heading level={5} className="text-base font-bold truncate">{activeModuleData.displayName} Permissions</Heading>
                  </div>

                  {selectedRole.name !== 'ADMIN' && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={handleEnableAll} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--success)] hover:bg-[var(--success-soft)]">Enable All</Button>
                      <Button variant="ghost" size="sm" onClick={handleDisableAll} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--danger)] hover:bg-[var(--danger-soft)]">Disable All</Button>
                      <Button variant="ghost" size="sm" onClick={handleInvert} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)]">Invert</Button>
                      <div className="w-px h-4 bg-[var(--border-subtle)] mx-1" />
                      <Button variant="ghost" size="sm" onClick={handleResetModule} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)]">Reset</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6 max-h-[420px] lg:max-h-[700px] overflow-y-auto pr-2">
                  {GROUP_ORDER.map(groupKey => {
                    const permsInGroup = groupedPermissions[groupKey];
                    if (!permsInGroup || permsInGroup.length === 0) return null;

                    return (
                      <div key={groupKey} className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">{GROUP_LABELS[groupKey]}</h6>
                          <div className="h-px bg-[var(--border-subtle)] w-full" />
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {permsInGroup.map(perm => {
                            const currentScope = localScopedPerms[perm.code];
                            const isEnabled = Boolean(currentScope);
                            const isAdmin = selectedRole.name === 'ADMIN';
                            const isCritical = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';
                            const supportedScopes = perm.supportedScopes && perm.supportedScopes.length > 0 ? perm.supportedScopes : ['ORGANIZATION'];
                            const isScopePickerNeeded = perm.scopeRequired !== false && supportedScopes.length > 1;

                            return (
                              <div
                                key={perm.code}
                                className={cn(
                                  "group relative p-4 rounded-xl border transition-all duration-150 flex flex-col gap-3 select-none",
                                  isEnabled
                                    ? "bg-[var(--bg-card)] border-[var(--accent)] ring-1 ring-[var(--accent)]/10 shadow-sm"
                                    : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-subtle)]"
                                )}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-3 flex-1 min-w-0 cursor-pointer" onClick={() => !isAdmin && togglePermissionLocal(perm)}>
                                    <div className={cn(
                                      "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                      isEnabled
                                        ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                                        : "border-[var(--border-default)] bg-[var(--bg-subtle)] group-hover:border-[var(--accent)]"
                                    )}>
                                      {isEnabled && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                    </div>
                                    <div className="space-y-0.5 flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className={cn("text-sm font-bold block truncate", isEnabled ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                                          {perm.name}
                                        </span>
                                        <Badge variant={getRiskBadgeVariant(perm.riskLevel)} className="text-[9px] px-1.5 py-0 uppercase font-bold shrink-0">
                                          {isCritical && <AlertTriangle className="w-2.5 h-2.5 mr-1 inline-block" />}
                                          {perm.riskLevel}
                                        </Badge>
                                        <code className="text-[9px] font-mono px-1.5 py-0 rounded text-[var(--text-muted)] border border-[var(--border-subtle)] shrink-0">
                                          {perm.code}
                                        </code>
                                      </div>
                                      <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                                        {perm.description}
                                      </p>
                                    </div>
                                  </div>
                                </div>

                                {/* Informational Business Rule Note */}
                                {perm.actionRules && (
                                  <div className="p-2.5 rounded-lg bg-[var(--warning-soft)] border border-[var(--warning-border)] flex items-start gap-2 text-[11px] text-[var(--warning)]">
                                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                    <span><strong>Workflow Note:</strong> {perm.actionRules}</span>
                                  </div>
                                )}

                                {/* Scope Picker Controls */}
                                {isEnabled && (
                                  <div className="pt-2 border-t border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                                    <span className="text-[10px] uppercase font-bold tracking-wider text-[var(--text-muted)]">Scope Level:</span>

                                    {isScopePickerNeeded ? (
                                      <div className="flex flex-wrap items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] w-full sm:w-auto">
                                        {supportedScopes.map(scopeKey => {
                                          const isSelected = currentScope === scopeKey;
                                          return (
                                            <button
                                              key={scopeKey}
                                              type="button"
                                              disabled={isAdmin}
                                              title={SCOPE_DESCRIPTIONS[scopeKey]}
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleScopeChange(perm.code, scopeKey);
                                              }}
                                              className={cn(
                                                "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all select-none flex-1 sm:flex-initial text-center",
                                                isSelected
                                                  ? "bg-[var(--accent)] text-white shadow-xs"
                                                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]"
                                              )}
                                            >
                                              {SCOPE_LABELS[scopeKey]}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    ) : (
                                      <Badge variant="outline" className="text-[10px] uppercase font-bold text-[var(--accent)] bg-[var(--accent-soft)] border-[var(--accent-border)]">
                                        {SCOPE_LABELS[currentScope] || 'Organization'} Scope
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="h-[200px] flex items-center justify-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-subtle)] text-[var(--text-muted)] text-sm">
                No module selected
              </div>
            )}
          </div>
        )}
      </div>

      {/* Unsaved Changes Footer Bar */}
      <AnimatePresence>
        {isDirty && selectedRole?.name !== 'ADMIN' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[calc(100%-2rem)] max-w-4xl"
          >
            <div className="p-4 rounded-2xl bg-[var(--bg-card)]/95 backdrop-blur-md border-2 border-[var(--accent)] shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                <div className="shrink-0 space-y-1.5">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">Pending Changes</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {addedPerms.length > 0 && <Badge variant="success">+{addedPerms.length} Added</Badge>}
                    {scopeChangedPerms.length > 0 && <Badge variant="warning">{scopeChangedPerms.length} Scope Mod</Badge>}
                    {removedPerms.length > 0 && <Badge variant="danger">-{removedPerms.length} Removed</Badge>}
                    {priorityChanged && <Badge variant="info">Priority {originalPriority} → {localPriority}</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(true)} className="h-9 text-xs">Review Details</Button>
                <Button variant="ghost" size="sm" onClick={handleDiscardChanges} className="h-9 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)]">Discard</Button>
                <Button variant="primary" size="sm" onClick={handleSaveChanges} className="h-9 text-xs px-6">Save Role Permissions</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical Permission Confirmation Modal */}
      {confirmPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl border border-[var(--danger-border)] shadow-2xl overflow-hidden">
            <div className="bg-[var(--danger-soft)] p-5 flex flex-col items-center text-center gap-3 border-b border-[var(--danger-border)]">
              <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] text-[var(--danger)] flex items-center justify-center ring-1 ring-[var(--danger-border)]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <Heading level={4} className="text-[var(--danger)]">Critical Permission</Heading>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-subtle)] text-sm font-semibold">
                {confirmPerm.name}
                <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-1">{confirmPerm.code}</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {confirmPerm.description}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Are you sure you want to grant this privileged access to <strong>{selectedRole?.name}</strong>?
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPerm(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={() => { commitToggle(confirmPerm); setConfirmPerm(null); }}>Enable Access</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Categorized Diff Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <Heading level={5}>Review Pending Changes: {selectedRole?.name}</Heading>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowDetailsModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-6 flex-1">
              {priorityChanged && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Authority Level Change</h6>
                  <div className="p-3 bg-[var(--info-soft)] text-[var(--info)] border border-[var(--info-border)] rounded-xl text-sm font-medium">
                    Priority updated from {originalPriority} to {localPriority}
                  </div>
                </div>
              )}
              {addedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)]" /> Permission Added ({addedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {addedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      const scope = localScopedPerms[code];
                      return (
                        <div key={code} className="p-2.5 bg-[var(--success-soft)] border border-[var(--success-border)] rounded-lg text-xs text-[var(--success)] font-medium flex items-center justify-between">
                          <span className="flex items-center gap-2"><Plus className="w-3.5 h-3.5" /> {p ? p.name : code}</span>
                          <Badge variant="outline" className="text-[9px] uppercase font-bold">{SCOPE_LABELS[scope] || scope} Scope</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {scopeChangedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--warning)]" /> Scope Changed ({scopeChangedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {scopeChangedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      const oldScope = originalMap[code];
                      const newScope = localScopedPerms[code];
                      return (
                        <div key={code} className="p-2.5 bg-[var(--warning-soft)] border border-[var(--warning-border)] rounded-lg text-xs text-[var(--warning)] font-medium flex items-center justify-between">
                          <span className="font-bold">{p ? p.name : code}</span>
                          <div className="flex items-center gap-2">
                            <span>{SCOPE_LABELS[oldScope] || oldScope}</span>
                            <ArrowRight className="w-3 h-3" />
                            <span className="font-bold">{SCOPE_LABELS[newScope] || newScope}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {removedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--danger)]" /> Permission Removed ({removedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {removedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      return (
                        <div key={code} className="p-2.5 bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-lg text-xs text-[var(--danger)] font-medium flex items-center gap-2">
                          <X className="w-3.5 h-3.5" /> {p ? p.name : code}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)] rounded-b-2xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
              <Button variant="primary" onClick={handleSaveChanges}>Save Role Permissions</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

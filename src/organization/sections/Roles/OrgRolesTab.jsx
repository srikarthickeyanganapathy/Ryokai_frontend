import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { useCreateOrgRole, useUpdateOrgRolePermissions, useUpdateOrgRole } from '@/organization';
import { usePermissionCatalog } from '@/organization';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';
import {
  Lock, Search, ChevronRight, AlertTriangle, X, Plus, Check,
  Folder, Users, BarChart2, Settings, CheckSquare, Briefcase,
  ShieldAlert, Layers, Award, Info, RefreshCw
} from 'lucide-react';

// Module icon + color mapped to theme tokens instead of raw Tailwind hues,
// so this stays consistent with light/dark theme switching.
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

  const [localPermissions, setLocalPermissions] = useState([]);
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
        setLocalPermissions(selectedRole.permissions ? selectedRole.permissions.map(p => p.code) : []);
        setLocalPriority(selectedRole.priority ?? 100);
      });
    } else {
      queueMicrotask(() => {
        setLocalPermissions([]);
        setLocalPriority(100);
      });
    }
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
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setActiveModuleCode(filteredModules[0].moduleCode);
      }
    } else {
       
      setActiveModuleCode(null);
    }
  }, [filteredModules, activeModuleCode]);

  const togglePermissionLocal = (perm) => {
    if (selectedRole?.name === 'ADMIN') return;
    const hasPerm = localPermissions.includes(perm.code);

    if (!hasPerm && (perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH')) {
      setConfirmPerm(perm);
      return;
    }
    commitToggle(perm.code);
  };

  const commitToggle = (code) => {
    if (localPermissions.includes(code)) {
      setLocalPermissions(prev => prev.filter(p => p !== code));
    } else {
      setLocalPermissions(prev => [...prev, code]);
    }
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
    const ids = activeModuleData.permissions.map(p => p.code);
    const set = new Set([...localPermissions, ...ids]);
    setLocalPermissions(Array.from(set));
  };
  const handleDisableAll = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const ids = new Set(activeModuleData.permissions.map(p => p.code));
    setLocalPermissions(prev => prev.filter(p => !ids.has(p)));
  };
  const handleInvert = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const currentModuleIds = activeModuleData.permissions.map(p => p.code);
    setLocalPermissions(prev => {
      const others = prev.filter(p => !currentModuleIds.includes(p));
      const inverted = currentModuleIds.filter(p => !prev.includes(p));
      return [...others, ...inverted];
    });
  };
  const handleResetModule = () => {
    if (selectedRole?.name === 'ADMIN' || !activeModuleData) return;
    const originalIds = selectedRole?.permissions ? selectedRole.permissions.map(p => p.code) : [];
    const currentModuleIds = activeModuleData.permissions.map(p => p.code);
    setLocalPermissions(prev => {
      const others = prev.filter(p => !currentModuleIds.includes(p));
      const originalInModule = originalIds.filter(p => currentModuleIds.includes(p));
      return [...others, ...originalInModule];
    });
  };
  const handleDiscardChanges = () => {
    if (selectedRole) {
      setLocalPermissions(selectedRole.permissions ? selectedRole.permissions.map(p => p.code) : []);
      setLocalPriority(selectedRole.priority ?? 100);
    }
  };

  const originalPermissions = selectedRole?.permissions ? selectedRole.permissions.map(p => p.code) : [];
  const originalPriority = selectedRole?.priority ?? 100;

  const addedPerms = localPermissions.filter(p => !originalPermissions.includes(p));
  const removedPerms = originalPermissions.filter(p => !localPermissions.includes(p));
  const priorityChanged = originalPriority !== Number(localPriority);

  const isDirty = addedPerms.length > 0 || removedPerms.length > 0 || priorityChanged;

  const handleSaveChanges = () => {
    if (!selectedRole || !isDirty) return;

    if (addedPerms.length > 0 || removedPerms.length > 0) {
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissionNames: localPermissions
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

  if (rolesLoading || catalogLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        <Skeleton className="lg:col-span-3 h-64 lg:h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-64 lg:h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-6 h-64 lg:h-[600px] rounded-2xl" />
      </div>
    );
  }

  const enabledCount = localPermissions.length;
  const criticalCount = localPermissions.filter(p => PERMISSION_MAP.get(p)?.riskLevel === 'CRITICAL').length;

  return (
    // Bottom padding reserves room for the fixed unsaved-changes bar so it
    // never overlaps the last row of permission cards.
    <div className={cn("space-y-6", isDirty && "pb-28")}>
      {/* Role Summary Banner */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)] shrink-0">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <Heading level={4} className="text-lg font-bold truncate">{selectedRole ? selectedRole.name : 'Select a Role'}</Heading>
            <Text variant="muted" size="sm" className="text-xs">
              Configure fine-grained access control across all platform modules.
            </Text>
          </div>
        </div>

        {selectedRole && (
          <div className="grid grid-cols-4 gap-2 sm:flex sm:items-center sm:gap-4 text-sm w-full md:w-auto">
            <div className="flex flex-col items-center px-2 sm:px-4 sm:border-r border-[var(--border-subtle)]">
              <span className="font-bold text-[var(--success)]">{enabledCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Enabled</span>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4 sm:border-r border-[var(--border-subtle)]">
              <span className="font-bold text-[var(--text-muted)]">{ALL_PERMISSIONS.length - enabledCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Disabled</span>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4 sm:border-r border-[var(--border-subtle)]">
              <span className="font-bold text-[var(--danger)]">{criticalCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Critical</span>
            </div>
            <div className="flex flex-col items-center px-2 sm:px-4">
              <span className="font-bold text-[var(--text-primary)]">{localPriority}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Priority</span>
            </div>
          </div>
        )}
      </div>

      {/* Roles / Modules / Editor â€” 3 balanced columns at lg, stacked below */}
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
                    <span>Priority {role.priority ?? 100}</span>
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
                const selectedInMod = modPermIds.filter(id => localPermissions.includes(id)).length;
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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {permsInGroup.map(perm => {
                            const hasPerm = localPermissions.includes(perm.code);
                            const isAdmin = selectedRole.name === 'ADMIN';
                            const isCritical = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';

                            return (
                              <div
                                key={perm.code}
                                onClick={() => !isAdmin && togglePermissionLocal(perm)}
                                className={cn(
                                  "group relative p-3.5 rounded-xl border transition-colors duration-150 flex flex-col gap-2 select-none",
                                  isAdmin ? "cursor-default opacity-80" : "cursor-pointer",
                                  hasPerm
                                    ? "bg-[var(--bg-card)] border-[var(--accent)] ring-1 ring-[var(--accent)]/10 shadow-sm"
                                    : "bg-[var(--bg-card)] border-[var(--border-subtle)] hover:border-[var(--border-default)] hover:bg-[var(--bg-subtle)]"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors shrink-0",
                                    hasPerm
                                      ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                                      : "border-[var(--border-default)] bg-[var(--bg-subtle)] group-hover:border-[var(--accent)]"
                                  )}>
                                    {hasPerm && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                                  </div>
                                  <div className="space-y-0.5 flex-1 min-w-0">
                                    <span className={cn("text-sm font-bold block truncate", hasPerm ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                                      {perm.name}
                                    </span>
                                    <p className="text-[11px] text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                                      {perm.description}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 pl-8 pt-1">
                                  <Badge variant={getRiskBadgeVariant(perm.riskLevel)} className="text-[9px] px-1.5 py-0 uppercase font-bold">
                                    {isCritical && <AlertTriangle className="w-2.5 h-2.5 mr-1 inline-block" />}
                                    {perm.riskLevel}
                                  </Badge>
                                  <code className="text-[9px] font-mono px-1.5 py-0 rounded text-[var(--text-muted)] border border-[var(--border-subtle)]">
                                    {perm.code}
                                  </code>
                                </div>
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

      {/* Unsaved Changes Footer */}
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
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">Changes</span>
                  <div className="flex flex-wrap items-center gap-2">
                    {addedPerms.length > 0 && <Badge variant="success">+{addedPerms.length} Added</Badge>}
                    {removedPerms.length > 0 && <Badge variant="danger">-{removedPerms.length} Removed</Badge>}
                    {priorityChanged && <Badge variant="info">Priority {originalPriority} â†’ {localPriority}</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(true)} className="h-9 text-xs">Details</Button>
                <Button variant="ghost" size="sm" onClick={handleDiscardChanges} className="h-9 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)]">Discard</Button>
                <Button variant="primary" size="sm" onClick={handleSaveChanges} className="h-9 text-xs px-6">Save Role</Button>
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
                Are you sure you want to grant this highly privileged access to <strong>{selectedRole?.name}</strong>?
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPerm(null)}>Cancel</Button>
                <Button variant="danger" className="flex-1" onClick={() => { commitToggle(confirmPerm.code); setConfirmPerm(null); }}>Enable Access</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Diff Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-[var(--border-subtle)] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between">
              <Heading level={5}>Unsaved Changes: {selectedRole?.name}</Heading>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowDetailsModal(false)}><X className="w-4 h-4" /></Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-6 flex-1">
              {priorityChanged && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Priority Change</h6>
                  <div className="p-3 bg-[var(--info-soft)] text-[var(--info)] border border-[var(--info-border)] rounded-xl text-sm font-medium">
                    Priority updated from {originalPriority} to {localPriority}
                  </div>
                </div>
              )}
              {addedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--success)]" /> Added Permissions ({addedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {addedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      return (
                        <div key={code} className="p-2 bg-[var(--success-soft)] border border-[var(--success-border)] rounded-lg text-sm text-[var(--success)] font-medium flex items-center gap-2">
                          <Plus className="w-3.5 h-3.5" /> {p ? p.name : code}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {removedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[var(--danger)]" /> Removed Permissions ({removedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {removedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      return (
                        <div key={code} className="p-2 bg-[var(--danger-soft)] border border-[var(--danger-border)] rounded-lg text-sm text-[var(--danger)] font-medium flex items-center gap-2">
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
              <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

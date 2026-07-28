import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Input } from '@/shared/ui/Input';
import { useCreateOrgRole, useUpdateOrgRolePermissions, useUpdateOrgRole } from '@/features/organization/organizations/hooks/useOrganizations';
import { usePermissionCatalog } from '@/features/organization/organizations/hooks/usePermissions';
import { Skeleton } from '@/shared/ui/Skeleton';
import { cn } from '@/shared/lib/cn';
import { 
  Lock, Shield, Award, CheckCircle2, Search, SlidersHorizontal, 
  Layers, AlertTriangle, Info, Sparkles, X, Plus, RefreshCw, 
  Folder, Users, BarChart2, Settings, CheckSquare, Briefcase, 
  Check, AlertCircle, ShieldAlert, FileText, ChevronRight
} from 'lucide-react';

const getModuleStyle = (moduleCode) => {
  switch (moduleCode) {
    case 'TASK': return { icon: CheckSquare, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' };
    case 'PROJECT': return { icon: Briefcase, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' };
    case 'ORGANIZATION': return { icon: Settings, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' };
    case 'MEMBER': return { icon: Users, color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' };
    case 'TEAM': return { icon: Layers, color: 'text-pink-500 bg-pink-500/10 border-pink-500/20' };
    case 'ROLE': return { icon: ShieldAlert, color: 'text-red-500 bg-red-500/10 border-red-500/20' };
    case 'DASHBOARD': return { icon: BarChart2, color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20' };
    case 'ACTIVITY': return { icon: RefreshCw, color: 'text-slate-500 bg-slate-500/10 border-slate-500/20' };
    case 'GOAL': return { icon: Award, color: 'text-violet-500 bg-violet-500/10 border-violet-500/20' };
    case 'ANNOUNCEMENT': return { icon: Info, color: 'text-orange-500 bg-orange-500/10 border-orange-500/20' };
    default: return { icon: Folder, color: 'text-gray-500 bg-gray-500/10 border-gray-500/20' };
  }
};

const getRiskStyle = (riskLevel) => {
  switch (riskLevel) {
    case 'CRITICAL': return 'border-red-500/50 bg-red-500/5 text-red-500';
    case 'HIGH': return 'border-amber-500/50 bg-amber-500/5 text-amber-500';
    case 'MEDIUM': return 'border-blue-500/30 bg-blue-500/5 text-blue-500';
    case 'LOW': default: return 'border-[var(--color-border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)]';
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
  
  const [confirmPerm, setConfirmPerm] = useState(null); // stores permission object if pending confirm
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

  // Bulk Actions
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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-2">
        <Skeleton className="lg:col-span-3 h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-3 h-[600px] rounded-2xl" />
        <Skeleton className="lg:col-span-6 h-[600px] rounded-2xl" />
      </div>
    );
  }

  const enabledCount = localPermissions.length;
  const criticalCount = localPermissions.filter(p => PERMISSION_MAP.get(p)?.riskLevel === 'CRITICAL').length;

  return (
    <div className="space-y-6 pb-24">
      {/* Top Banner (Role Summary) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--color-border-subtle)] shadow-sm">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <Heading level={4} className="text-lg font-bold">{selectedRole ? selectedRole.name : 'Select a Role'}</Heading>
            <Text variant="muted" size="sm" className="text-xs">
              Configure fine-grained access control across all platform modules.
            </Text>
          </div>
        </div>

        {selectedRole && (
          <div className="flex flex-wrap items-center gap-4 text-sm w-full md:w-auto justify-start md:justify-end">
            <div className="flex flex-col items-center px-4 border-r border-[var(--color-border-subtle)]">
              <span className="font-bold text-emerald-500">{enabledCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Enabled</span>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-[var(--color-border-subtle)]">
              <span className="font-bold text-[var(--text-muted)]">{ALL_PERMISSIONS.length - enabledCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Disabled</span>
            </div>
            <div className="flex flex-col items-center px-4 border-r border-[var(--color-border-subtle)]">
              <span className="font-bold text-red-500">{criticalCount}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Critical</span>
            </div>
            <div className="flex flex-col items-center px-4">
              <span className="font-bold text-[var(--text-primary)]">{localPriority}</span>
              <span className="text-[10px] uppercase text-[var(--text-muted)] font-bold">Priority</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Roles (lg: 3 cols) */}
        <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
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
                className="p-4 rounded-xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] space-y-3"
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

          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {filteredRoles.map(role => {
              const isSelected = selectedRole?.id === role.id;
              const permCount = role.permissions?.length || 0;
              const ratio = Math.round((permCount / ALL_PERMISSIONS.length) * 100);

              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "p-3 rounded-xl border cursor-pointer transition-all flex flex-col gap-2",
                    isSelected ? "bg-gradient-to-br from-[var(--bg-card)] to-[var(--bg-subtle)] border-[var(--accent)] shadow-sm ring-1 ring-[var(--accent)]/20" : "bg-[var(--bg-card)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)]"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm tracking-tight truncate">{role.name}</span>
                    {role.name === 'ADMIN' && <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                    <span>Priority {role.priority ?? 100}</span>
                    <span>{ratio}% ({permCount}/{ALL_PERMISSIONS.length})</span>
                  </div>
                  <div className="w-full h-1 rounded-full bg-[var(--color-border-subtle)] overflow-hidden">
                    <div className={cn("h-full rounded-full transition-all duration-500", role.name === 'ADMIN' ? 'bg-amber-500' : 'bg-[var(--accent)]')} style={{ width: `${ratio}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Middle Column: Modules (lg: 3 cols) */}
        {selectedRole && (
          <div className="md:col-span-4 lg:col-span-3 flex flex-col gap-4">
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
                <button onClick={() => setPermSearchQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
              {filteredModules.map(module => {
                const isActive = activeModuleCode === module.moduleCode;
                const { icon: IconComponent, color } = getModuleStyle(module.moduleCode);
                
                const modPermIds = module.permissions.map(p => p.code);
                const selectedInMod = modPermIds.filter(id => localPermissions.includes(id)).length;
                const totalInMod = modPermIds.length;
                const ratio = totalInMod > 0 ? (selectedInMod / totalInMod) * 100 : 0;

                return (
                  <div
                    key={module.moduleCode}
                    onClick={() => setActiveModuleCode(module.moduleCode)}
                    className={cn(
                      "p-3 rounded-xl cursor-pointer transition-all flex flex-col gap-2",
                      isActive ? "bg-[var(--bg-subtle)] border border-[var(--color-border-default)] shadow-sm" : "border border-transparent hover:bg-[var(--bg-subtle)]/50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn("p-1.5 rounded-lg border", color)}>
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 min-w-0 flex items-center justify-between">
                        <span className="font-semibold text-sm truncate">{module.displayName}</span>
                        <ChevronRight className={cn("w-4 h-4 transition-transform", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]")} />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] font-medium">
                      <span className="flex gap-0.5">
                        <div className="flex h-1.5 w-16 bg-[var(--color-border-subtle)] rounded-full overflow-hidden mt-1 mr-1">
                          <div className="h-full bg-emerald-500 rounded-full transition-all" style={{width: `${ratio}%`}} />
                        </div>
                        {selectedInMod} / {totalInMod}
                      </span>
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

        {/* Right Column: Permission Editor (lg: 6 cols) */}
        {selectedRole && (
          <div className="md:col-span-4 lg:col-span-6 flex flex-col gap-4">
            {activeModuleData ? (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-[var(--bg-subtle)] p-3 rounded-xl border border-[var(--color-border-subtle)]">
                  <div className="flex items-center gap-2">
                    {(() => { const { icon: IconComponent, color } = getModuleStyle(activeModuleData.moduleCode); return <div className={cn("p-1.5 rounded-lg border", color)}><IconComponent className="w-4 h-4"/></div> })()}
                    <Heading level={5} className="text-base font-bold">{activeModuleData.displayName} Permissions</Heading>
                  </div>
                  
                  {selectedRole.name !== 'ADMIN' && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Button variant="ghost" size="sm" onClick={handleEnableAll} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 hover:bg-emerald-500/10 hover:text-emerald-500">Enable All</Button>
                      <Button variant="ghost" size="sm" onClick={handleDisableAll} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 hover:bg-red-500/10 hover:text-red-500">Disable All</Button>
                      <Button variant="ghost" size="sm" onClick={handleInvert} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)]">Invert</Button>
                      <div className="w-px h-4 bg-[var(--color-border-subtle)] mx-1" />
                      <Button variant="ghost" size="sm" onClick={handleResetModule} className="h-7 text-[10px] font-bold uppercase tracking-wider px-2 text-[var(--text-muted)] hover:bg-[var(--bg-card)]">Reset</Button>
                    </div>
                  )}
                </div>

                <div className="space-y-6 max-h-[700px] overflow-y-auto pb-6 pr-2">
                  {GROUP_ORDER.map(groupKey => {
                    const permsInGroup = groupedPermissions[groupKey];
                    if (!permsInGroup || permsInGroup.length === 0) return null;
                    
                    return (
                      <div key={groupKey} className="space-y-3">
                        <div className="flex items-center gap-4">
                          <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] whitespace-nowrap">{GROUP_LABELS[groupKey]}</h6>
                          <div className="h-px bg-[var(--color-border-subtle)] w-full" />
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {permsInGroup.map(perm => {
                            const hasPerm = localPermissions.includes(perm.code);
                            const isAdmin = selectedRole.name === 'ADMIN';
                            const riskStyle = getRiskStyle(perm.riskLevel);
                            const isCritical = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';

                            return (
                              <div
                                key={perm.code}
                                onClick={() => !isAdmin && togglePermissionLocal(perm)}
                                className={cn(
                                  "group relative p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 select-none",
                                  isAdmin ? "cursor-default opacity-80" : "cursor-pointer",
                                  hasPerm
                                    ? "bg-[var(--bg-card)] border-[var(--accent)] shadow-sm ring-1 ring-[var(--accent)]/10"
                                    : "bg-[var(--bg-card)] border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] hover:bg-[var(--bg-subtle)]"
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    "mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-all shrink-0",
                                    hasPerm
                                      ? "bg-[var(--accent)] border-[var(--accent)] text-white shadow-sm"
                                      : "border-[var(--color-border-default)] bg-[var(--bg-subtle)] group-hover:border-[var(--accent)]"
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
                                <div className="flex items-center gap-1.5 pl-8 pt-1">
                                  <Badge variant="outline" className={cn("text-[9px] px-1.5 py-0 uppercase font-bold", riskStyle)}>
                                    {isCritical && <AlertTriangle className="w-2.5 h-2.5 mr-1 inline-block" />}
                                    {perm.riskLevel}
                                  </Badge>
                                  <code className="text-[9px] font-mono px-1.5 py-0 rounded text-[var(--text-muted)] border border-[var(--color-border-subtle)]">
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
              <div className="h-[200px] flex items-center justify-center border border-dashed border-[var(--color-border-subtle)] rounded-xl bg-[var(--bg-subtle)]/30 text-[var(--text-muted)] text-sm">
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
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-4xl px-4"
          >
            <div className="p-4 rounded-2xl bg-[var(--bg-card)] border-2 border-[var(--accent)] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md bg-opacity-95 ring-4 ring-black/5 dark:ring-white/5">
              <div className="flex items-center gap-4 w-full sm:w-auto overflow-hidden">
                <div className="shrink-0 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">Changes</span>
                  <div className="flex items-center gap-2">
                    {addedPerms.length > 0 && <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30">+{addedPerms.length} Added</Badge>}
                    {removedPerms.length > 0 && <Badge className="bg-red-500/10 text-red-500 border-red-500/30">-{removedPerms.length} Removed</Badge>}
                    {priorityChanged && <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30">Priority {originalPriority} → {localPriority}</Badge>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(true)} className="h-9 text-xs">View Details</Button>
                <Button variant="ghost" size="sm" onClick={handleDiscardChanges} className="h-9 text-xs text-red-500 hover:bg-red-500/10">Discard</Button>
                <Button variant="primary" size="sm" onClick={handleSaveChanges} className="h-9 text-xs px-6 shadow-lg shadow-[var(--accent)]/30">Save Role</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Critical Permission Confirmation Modal */}
      {confirmPerm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[var(--bg-card)] w-full max-w-sm rounded-2xl border border-red-500/30 shadow-2xl overflow-hidden">
            <div className="bg-red-500/10 p-5 flex flex-col items-center text-center gap-3 border-b border-red-500/20">
              <div className="w-12 h-12 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <Heading level={4} className="text-red-500">Critical Permission</Heading>
            </div>
            <div className="p-6 space-y-4">
              <div className="p-3 bg-[var(--bg-subtle)] rounded-xl border border-[var(--color-border-subtle)] text-sm font-semibold">
                {confirmPerm.name} <span className="text-[10px] text-[var(--text-muted)] font-mono block mt-1">{confirmPerm.code}</span>
              </div>
              <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                {confirmPerm.description}
              </p>
              <p className="text-xs text-[var(--text-muted)]">
                Are you sure you want to grant this highly privileged access to <strong>{selectedRole?.name}</strong>?
              </p>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setConfirmPerm(null)}>Cancel</Button>
                <Button className="flex-1 bg-red-500 hover:bg-red-600 text-white border-transparent" onClick={() => { commitToggle(confirmPerm.code); setConfirmPerm(null); }}>Enable Access</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Diff Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} className="bg-[var(--bg-card)] w-full max-w-lg rounded-2xl border border-[var(--color-border-subtle)] shadow-2xl flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
              <Heading level={5}>Unsaved Changes: {selectedRole?.name}</Heading>
              <Button variant="ghost" size="sm" className="w-8 h-8 p-0" onClick={() => setShowDetailsModal(false)}><X className="w-4 h-4"/></Button>
            </div>
            <div className="p-4 overflow-y-auto space-y-6 flex-1">
              {priorityChanged && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">Priority Change</h6>
                  <div className="p-3 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-xl text-sm font-medium">
                    Priority updated from {originalPriority} to {localPriority}
                  </div>
                </div>
              )}
              {addedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" /> Added Permissions ({addedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {addedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      return <div key={code} className="p-2 bg-emerald-500/5 border border-emerald-500/10 rounded-lg text-sm text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-2"><Plus className="w-3.5 h-3.5"/> {p ? p.name : code}</div>
                    })}
                  </div>
                </div>
              )}
              {removedPerms.length > 0 && (
                <div>
                  <h6 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Removed Permissions ({removedPerms.length})
                  </h6>
                  <div className="space-y-1.5">
                    {removedPerms.map(code => {
                      const p = PERMISSION_MAP.get(code);
                      return <div key={code} className="p-2 bg-red-500/5 border border-red-500/10 rounded-lg text-sm text-red-600 dark:text-red-400 font-medium flex items-center gap-2"><X className="w-3.5 h-3.5"/> {p ? p.name : code}</div>
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-subtle)] rounded-b-2xl flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDetailsModal(false)}>Close</Button>
              <Button variant="primary" onClick={handleSaveChanges}>Save Changes</Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { toast } from 'sonner';
import {
  useCreateOrgRole,
  useUpdateOrgRolePermissions,
  useUpdateOrgRole,
  useDeleteOrgRole,
  usePermissionCatalog,
} from '@/organization';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';
import { LEVEL_TIERS } from '../entities/constants';

const PIN_STORAGE_KEY = 'ryokai.roles.pinned';
const RECENT_STORAGE_KEY = 'ryokai.roles.recent';
const INSPECTOR_STORAGE_KEY = 'ryokai.roles.inspectorOpen';
const RECENT_LIMIT = 4;

function readLocalSet(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch (e) {
    return new Set();
  }
}

function readLocalList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function readLocalBool(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === 'true';
  } catch (e) {
    return fallback;
  }
}

export function useRoleStudio({ orgId, roles = [], rolesLoading }) {
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  const [localScopedPerms, setLocalScopedPerms] = useState({});
  const [localPriority, setLocalPriority] = useState(100);

  const [activeTab, setActiveTab] = useState('permissions');
  const [activeModuleCode, setActiveModuleCode] = useState(null);
  const [permSearchQuery, setPermSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'ELEVATED'
  const [collapsedGroups, setCollapsedGroups] = useState({});

  const [activePermission, setActivePermission] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);

  // --- Inspector visibility -- reclaim horizontal space for the permission list ---
  const [inspectorOpen, setInspectorOpen] = useState(() => readLocalBool(INSPECTOR_STORAGE_KEY, true));
  const toggleInspector = useCallback(() => {
    setInspectorOpen((prev) => {
      const next = !prev;
      try { localStorage.setItem(INSPECTOR_STORAGE_KEY, String(next)); } catch (e) { /* localStorage unavailable */ }
      return next;
    });
  }, []);

  // --- Pinned / Recent roles (client-side convenience state) ---
  const [pinnedRoleIds, setPinnedRoleIds] = useState(() => readLocalSet(PIN_STORAGE_KEY));
  const [recentRoleIds, setRecentRoleIds] = useState(() => readLocalList(RECENT_STORAGE_KEY));

  const togglePinRole = useCallback((roleId) => {
    setPinnedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify([...next])); } catch (e) { /* localStorage unavailable */ }
      return next;
    });
  }, []);

  const pushRecentRole = useCallback((roleId) => {
    setRecentRoleIds((prev) => {
      const next = [roleId, ...prev.filter((id) => id !== roleId)].slice(0, RECENT_LIMIT);
      try { localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(next)); } catch (e) { /* localStorage unavailable */ }
      return next;
    });
  }, []);

  const { data: catalogResponse, isLoading: catalogLoading } = usePermissionCatalog();
  const permissionModules = catalogResponse?.modules || [];

  const PERMISSION_MAP = useMemo(() => {
    const map = new Map();
    permissionModules.forEach((m) =>
      m.permissions.forEach((p) => map.set(p.code, p))
    );
    return map;
  }, [permissionModules]);

  const createRoleMutation = useCreateOrgRole(orgId);
  const updatePermissionsMutation = useUpdateOrgRolePermissions(orgId);
  const updateRoleMutation = useUpdateOrgRole(orgId);
  const deleteRoleMutation = useDeleteOrgRole(orgId);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  useEffect(() => {
    if (roles.length > 0 && !selectedRole) {
      setSelectedRole(roles[0]);
    } else if (selectedRole) {
      const updated = roles.find((r) => r.id === selectedRole.id);
      if (updated && JSON.stringify(updated) !== JSON.stringify(selectedRole)) {
        setSelectedRole(updated);
      }
    }
  }, [roles]);

  useEffect(() => {
    if (selectedRole) {
      const initialMap = {};
      selectedRole.permissions?.forEach((p) => {
        initialMap[p.permissionCode || p.code] = {
          scopeCode: p.scopeCode || p.scope || 'ORGANIZATION',
          resourceAssignments: p.resourceAssignments || []
        };
      });
      setLocalScopedPerms(initialMap);
      setLocalPriority(selectedRole.priority ?? 100);
      setActivePermission(null);
      setPermSearchQuery('');
      setRiskFilter('ALL');
    } else {
      setLocalScopedPerms({});
      setLocalPriority(100);
    }
  }, [selectedRole?.id]);

  useEffect(() => {
    if (permissionModules.length > 0 && !activeModuleCode) {
      setActiveModuleCode(permissionModules[0].moduleCode);
    }
  }, [permissionModules]);

  const originalMap = useMemo(() => {
    const map = {};
    selectedRole?.permissions?.forEach((p) => {
      map[p.permissionCode || p.code] = {
        scopeCode: p.scopeCode || p.scope || 'ORGANIZATION',
        resourceAssignments: p.resourceAssignments || []
      };
    });
    return map;
  }, [selectedRole]);

  const addedPerms = useMemo(
    () => Object.keys(localScopedPerms).filter((c) => !originalMap[c]),
    [localScopedPerms, originalMap]
  );
  const removedPerms = useMemo(
    () => Object.keys(originalMap).filter((c) => !localScopedPerms[c]),
    [localScopedPerms, originalMap]
  );
  const scopeChangedPerms = useMemo(
    () =>
      Object.keys(localScopedPerms).filter((c) => {
        const orig = originalMap[c];
        const local = localScopedPerms[c];
        if (!orig || !local) return false;

        if (orig.scopeCode !== local.scopeCode) return true;

        const origArr = [...(orig.resourceAssignments || [])].sort((a, b) => (a.resourceId - b.resourceId));
        const localArr = [...(local.resourceAssignments || [])].sort((a, b) => (a.resourceId - b.resourceId));
        return JSON.stringify(origArr) !== JSON.stringify(localArr);
      }),
    [localScopedPerms, originalMap]
  );
  const priorityChanged = (selectedRole?.priority ?? 100) !== Number(localPriority);

  const isDirty =
    addedPerms.length > 0 ||
    removedPerms.length > 0 ||
    scopeChangedPerms.length > 0 ||
    priorityChanged;

  const changeCount =
    addedPerms.length +
    removedPerms.length +
    scopeChangedPerms.length +
    (priorityChanged ? 1 : 0);

  const changeRisk = useMemo(() => {
    const touched = [...addedPerms, ...removedPerms, ...scopeChangedPerms];
    let critical = 0, high = 0;
    touched.forEach((code) => {
      const p = PERMISSION_MAP.get(code);
      if (!p) return;
      if (p.riskLevel === 'CRITICAL') critical++;
      else if (p.riskLevel === 'HIGH') high++;
    });
    return { critical, high, total: critical + high };
  }, [addedPerms, removedPerms, scopeChangedPerms, PERMISSION_MAP]);

  const isAdminRole = selectedRole?.name === 'ADMIN';

  const supervisionRank = useMemo(() => {
    if (!roles || !selectedRole) return { can: [], cannot: [] };
    const currentRank = Number(localPriority);
    const can = [];
    const cannot = [];
    roles.forEach((r) => {
      if (r.id === selectedRole.id) return;
      if (currentRank < (r.priority ?? 100)) can.push(r.name);
      else cannot.push(r.name);
    });
    return { can, cannot };
  }, [roles, selectedRole, localPriority]);

  const filteredModules = useMemo(() => {
    let mods = permissionModules;
    if (permSearchQuery.trim()) {
      const q = permSearchQuery.toLowerCase();
      mods = mods
        .map((m) => ({
          ...m,
          permissions: m.permissions.filter(
            (p) =>
              p.name?.toLowerCase().includes(q) ||
              p.code?.toLowerCase().includes(q) ||
              p.description?.toLowerCase().includes(q)
          ),
        }))
        .filter((m) => m.permissions.length > 0);
    }
    if (riskFilter === 'ELEVATED') {
      mods = mods
        .map((m) => ({
          ...m,
          permissions: m.permissions.filter(
            (p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH'
          ),
        }))
        .filter((m) => m.permissions.length > 0);
    }
    return mods;
  }, [permissionModules, permSearchQuery, riskFilter]);

  const activeModuleData = filteredModules.find(
    (m) => m.moduleCode === activeModuleCode
  );

  const groupedPermissions = useMemo(() => {
    if (!activeModuleData) return {};
    const groups = { READ: [], WRITE: [], WORKFLOW: [], ADMINISTRATION: [], GENERAL: [] };
    activeModuleData.permissions.forEach((p) => {
      const g = p.group || 'GENERAL';
      if (groups[g]) groups[g].push(p);
      else groups.GENERAL.push(p);
    });
    return groups;
  }, [activeModuleData]);

  useEffect(() => {
    if (
      (permSearchQuery.trim() || riskFilter !== 'ALL') &&
      filteredModules.length > 0 &&
      !filteredModules.find((m) => m.moduleCode === activeModuleCode)
    ) {
      setActiveModuleCode(filteredModules[0].moduleCode);
    }
  }, [filteredModules, activeModuleCode, permSearchQuery, riskFilter]);

  const toggleGroupCollapsed = useCallback((groupKey) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  }, []);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setActiveTab('permissions');
    pushRecentRole(role.id);
  };

  const togglePermission = async (perm) => {
    if (isAdminRole) return;
    const isCurrentlyEnabled = Boolean(localScopedPerms[perm.code]);
    if (
      !isCurrentlyEnabled &&
      (perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH')
    ) {
      const ok = await confirm({
        title: 'Critical Permission',
        description: `"${perm.name}" (${perm.code})\n\n${perm.description || ''}\n\nGrant this privileged access?`,
        danger: true,
        confirmLabel: 'Enable access',
        cancelLabel: 'Cancel',
      });
      if (ok) commitToggle(perm);
      return;
    }
    commitToggle(perm);
  };

  const commitToggle = (perm) => {
    const code = perm.code;
    setLocalScopedPerms((prev) => {
      const next = { ...prev };
      if (next[code]) {
        delete next[code];
      } else {
        const supported =
          perm.supportedScopes?.length > 0
            ? perm.supportedScopes
            : ['ORGANIZATION'];
        const defaultScope = supported.includes('OWN')
          ? 'OWN'
          : perm.recommendedScope || supported[0];
        next[code] = { scopeCode: defaultScope, resourceAssignments: [] };

        perm.requires?.forEach((reqCode) => {
          if (!next[reqCode]) {
            const reqPerm = PERMISSION_MAP.get(reqCode);
            const reqSupported =
              reqPerm?.supportedScopes || ['ORGANIZATION'];
            const reqDefault = reqSupported.includes('OWN')
              ? 'OWN'
              : reqPerm?.recommendedScope || reqSupported[0];
            next[reqCode] = { scopeCode: reqDefault, resourceAssignments: [] };
            toast.info(`${reqPerm?.name || reqCode} auto-enabled`, {
              description: `Required by ${perm.name || code}.`,
            });
          }
        });
      }
      return next;
    });
  };

  const handleScopeChange = (code, newScope) => {
    if (isAdminRole) return;
    setLocalScopedPerms((prev) => ({
      ...prev,
      [code]: { ...prev[code], scopeCode: newScope, resourceAssignments: [] }
    }));
  };

  const handleResourceAssignmentChange = (code, assignments) => {
    if (isAdminRole) return;
    setLocalScopedPerms((prev) => ({
      ...prev,
      [code]: { ...prev[code], resourceAssignments: assignments }
    }));
  };

  const handleEnableAll = () => {
    if (isAdminRole || !activeModuleData) return;
    setLocalScopedPerms((prev) => {
      const next = { ...prev };
      activeModuleData.permissions.forEach((p) => {
        if (!next[p.code]) {
          const supported =
            p.supportedScopes?.length > 0
              ? p.supportedScopes
              : ['ORGANIZATION'];
          const sc = supported.includes('OWN')
            ? 'OWN'
            : p.recommendedScope || supported[0];
          next[p.code] = { scopeCode: sc, resourceAssignments: [] };
        }
      });
      return next;
    });
  };

  const handleDisableAll = () => {
    if (isAdminRole || !activeModuleData) return;
    const codes = new Set(activeModuleData.permissions.map((p) => p.code));
    setLocalScopedPerms((prev) => {
      const next = { ...prev };
      codes.forEach((code) => delete next[code]);
      return next;
    });
  };

  const handleSetModuleLevel = (lvl) => {
    if (isAdminRole || !activeModuleData) return;
    const wanted = new Set(lvl > 0 && LEVEL_TIERS[lvl - 1] ? LEVEL_TIERS[lvl - 1].groups : []);
    setLocalScopedPerms((prev) => {
      const next = { ...prev };
      activeModuleData.permissions.forEach((p) => {
        const g = p.group || 'GENERAL';
        if (wanted.has(g)) {
          if (!next[p.code]) {
            const supported = p.supportedScopes?.length > 0 ? p.supportedScopes : ['ORGANIZATION'];
            const sc = supported.includes('OWN') ? 'OWN' : p.recommendedScope || supported[0];
            next[p.code] = { scopeCode: sc, resourceAssignments: [] };
          }
        } else {
          delete next[p.code];
        }
      });
      return next;
    });
  };

  const handleResetModule = () => {
    if (isAdminRole || !activeModuleData) return;
    const codes = activeModuleData.permissions.map((p) => p.code);
    setLocalScopedPerms((prev) => {
      const next = { ...prev };
      codes.forEach((code) => {
        if (originalMap[code]) next[code] = originalMap[code];
        else delete next[code];
      });
      return next;
    });
  };

  const handleDiscardChanges = () => {
    if (selectedRole) {
      setLocalScopedPerms({ ...originalMap });
      setLocalPriority(selectedRole.priority ?? 100);
    }
    setShowReview(false);
  };

  const handleSaveChanges = () => {
    if (!selectedRole || !isDirty) return;
    if (
      addedPerms.length > 0 ||
      removedPerms.length > 0 ||
      scopeChangedPerms.length > 0
    ) {
      const payloadPermissions = Object.entries(localScopedPerms).map(
        ([code, config]) => ({
          permissionName: code,
          scopeCode: config.scopeCode,
          resourceAssignments: config.resourceAssignments || []
        })
      );
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissions: payloadPermissions,
      });
    }
    if (priorityChanged) {
      updateRoleMutation.mutate({
        roleId: selectedRole.id,
        payload: { name: selectedRole.name, priority: Number(localPriority) },
      });
    }
    setShowReview(false);
  };

  const handleCreateRole = ({ name, priority, templateRoleId }) => {
    createRoleMutation.mutate(
      { name, priority },
      {
        onSuccess: (newRole) => {
          setShowCreateRole(false);
          if (newRole) {
            if (templateRoleId) {
              const sourceRole = roles.find((r) => r.id === templateRoleId);
              if (sourceRole?.permissions?.length > 0) {
                const payloadPermissions = sourceRole.permissions.map((p) => ({
                  permissionName: p.permissionCode || p.code,
                  scopeCode: p.scopeCode || p.scope || 'ORGANIZATION',
                  resourceAssignments: p.resourceAssignments || []
                }));
                updatePermissionsMutation.mutate({
                  roleId: newRole.id,
                  permissions: payloadPermissions
                });
              }
            }
            setSelectedRole(newRole);
          }
        },
      }
    );
  };

  const handleDeleteRole = async () => {
    if (!selectedRole || isAdminRole) return;
    const isConfirmed = await confirm({
      title: 'Delete role?',
      description: `Delete role "${selectedRole.name}"? This cannot be undone.`,
      danger: true,
      confirmLabel: 'Delete'
    });

    if (isConfirmed) {
      deleteRoleMutation.mutate(selectedRole.id, {
        onSuccess: () => {
          setSelectedRole(roles.find((r) => r.id !== selectedRole.id) || null);
        },
      });
    }
  };

  const handleCloneRole = () => {
    if (!selectedRole) return;
    const cloneName = `${selectedRole.name}_COPY`;
    createRoleMutation.mutate(
      { name: cloneName, priority: (selectedRole.priority ?? 100) + 10 },
      {
        onSuccess: (newRole) => {
          if (newRole && Object.keys(localScopedPerms).length > 0) {
            const payloadPermissions = Object.entries(localScopedPerms).map(
              ([code, config]) => ({
                permissionName: code,
                scopeCode: config.scopeCode,
                resourceAssignments: config.resourceAssignments || []
              })
            );
            updatePermissionsMutation.mutate({
              roleId: newRole.id,
              permissions: payloadPermissions
            });
            setSelectedRole(newRole);
          }
        },
      }
    );
  };

  return {
    selectedRole,
    roles,
    rolesLoading,
    roleSearchQuery,
    setRoleSearchQuery,
    handleSelectRole,
    pinnedRoleIds,
    togglePinRole,
    recentRoleIds,
    inspectorOpen,
    toggleInspector,
    filteredModules,
    activeModuleCode,
    setActiveModuleCode,
    activeModuleData,
    groupedPermissions,
    localScopedPerms,
    PERMISSION_MAP,
    permSearchQuery,
    setPermSearchQuery,
    riskFilter,
    setRiskFilter,
    collapsedGroups,
    toggleGroupCollapsed,
    activePermission,
    setActivePermission,
    togglePermission,
    commitToggle,
    handleScopeChange,
    handleResourceAssignmentChange,
    handleEnableAll,
    handleDisableAll,
    handleResetModule,
    handleSetModuleLevel,
    addedPerms,
    removedPerms,
    scopeChangedPerms,
    priorityChanged,
    changeRisk,
    localPriority,
    setLocalPriority,
    isDirty,
    changeCount,
    isAdminRole,
    supervisionRank,
    originalMap,
    handleDiscardChanges,
    handleSaveChanges,
    showReview,
    setShowReview,
    showCreateRole,
    setShowCreateRole,
    handleCreateRole,
    handleDeleteRole,
    handleCloneRole,
    activeTab,
    setActiveTab,
    confirmDialog,
  };
}

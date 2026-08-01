import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import {
  useCreateOrgRole,
  useUpdateOrgRolePermissions,
  useUpdateOrgRole,
  useDeleteOrgRole,
  usePermissionCatalog,
} from '@/organization';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog';

export function useRoleStudio({ orgId, roles = [], rolesLoading }) {
  // ── Role Selection & Filtering ──
  const [selectedRole, setSelectedRole] = useState(null);
  const [roleSearchQuery, setRoleSearchQuery] = useState('');

  // ── Permission Editing State ──
  const [localScopedPerms, setLocalScopedPerms] = useState({});
  const [localPriority, setLocalPriority] = useState(100);

  // ── Navigation State ──
  const [activeTab, setActiveTab] = useState('permissions'); // 'general' | 'permissions'
  const [activeModuleCode, setActiveModuleCode] = useState(null);
  const [permSearchQuery, setPermSearchQuery] = useState('');

  // ── Inspector & Dialog States ──
  const [activePermission, setActivePermission] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [showCreateRole, setShowCreateRole] = useState(false);
  const [confirmPerm, setConfirmPerm] = useState(null);

  // ── Catalog & Mapping ──
  const { data: catalogResponse, isLoading: catalogLoading } = usePermissionCatalog();
  const permissionModules = catalogResponse?.modules || [];

  const PERMISSION_MAP = useMemo(() => {
    const map = new Map();
    permissionModules.forEach((m) =>
      m.permissions.forEach((p) => map.set(p.code, p))
    );
    return map;
  }, [permissionModules]);

  // ── Mutations ──
  const createRoleMutation = useCreateOrgRole(orgId);
  const updatePermissionsMutation = useUpdateOrgRolePermissions(orgId);
  const updateRoleMutation = useUpdateOrgRole(orgId);
  const deleteRoleMutation = useDeleteOrgRole(orgId);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // ── Auto-select first role ──
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

  // ── Sync local state on role change ──
  useEffect(() => {
    if (selectedRole) {
      const initialMap = {};
      selectedRole.permissions?.forEach((p) => {
        initialMap[p.code] = p.scope || 'ORGANIZATION';
      });
      setLocalScopedPerms(initialMap);
      setLocalPriority(selectedRole.priority ?? 100);
      setActivePermission(null);
      setPermSearchQuery('');
    } else {
      setLocalScopedPerms({});
      setLocalPriority(100);
    }
  }, [selectedRole?.id]);

  // ── Auto-select first module ──
  useEffect(() => {
    if (permissionModules.length > 0 && !activeModuleCode) {
      setActiveModuleCode(permissionModules[0].moduleCode);
    }
  }, [permissionModules]);

  // ── Original map for diff ──
  const originalMap = useMemo(() => {
    const map = {};
    selectedRole?.permissions?.forEach((p) => {
      map[p.code] = p.scope || 'ORGANIZATION';
    });
    return map;
  }, [selectedRole]);

  // ── Diff calculations ──
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
      Object.keys(localScopedPerms).filter(
        (c) => originalMap[c] && originalMap[c] !== localScopedPerms[c]
      ),
    [localScopedPerms, originalMap]
  );
  const priorityChanged =
    (selectedRole?.priority ?? 100) !== Number(localPriority);

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

  const isAdminRole = selectedRole?.name === 'ADMIN';

  // ── Supervision Rank ──
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

  // ── Filtered modules & grouped permissions ──
  const filteredModules = useMemo(() => {
    if (!permSearchQuery.trim()) return permissionModules;
    const q = permSearchQuery.toLowerCase();
    return permissionModules
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
  }, [permissionModules, permSearchQuery]);

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

  // Switch module if query filters out active module
  useEffect(() => {
    if (
      permSearchQuery.trim() &&
      filteredModules.length > 0 &&
      !filteredModules.find((m) => m.moduleCode === activeModuleCode)
    ) {
      setActiveModuleCode(filteredModules[0].moduleCode);
    }
  }, [filteredModules, activeModuleCode, permSearchQuery]);

  // ── Actions ──
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    setActiveTab('permissions');
  };

  const togglePermission = (perm) => {
    if (isAdminRole) return;
    const isCurrentlyEnabled = Boolean(localScopedPerms[perm.code]);
    if (
      !isCurrentlyEnabled &&
      (perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH')
    ) {
      setConfirmPerm(perm);
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
        next[code] = defaultScope;

        // Auto-enable dependent permissions
        perm.requires?.forEach((reqCode) => {
          if (!next[reqCode]) {
            const reqPerm = PERMISSION_MAP.get(reqCode);
            const reqSupported =
              reqPerm?.supportedScopes || ['ORGANIZATION'];
            const reqDefault = reqSupported.includes('OWN')
              ? 'OWN'
              : reqPerm?.recommendedScope || reqSupported[0];
            next[reqCode] = reqDefault;
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
    setLocalScopedPerms((prev) => ({ ...prev, [code]: newScope }));
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
          next[p.code] = supported.includes('OWN')
            ? 'OWN'
            : p.recommendedScope || supported[0];
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
        ([code, scopeCode]) => ({
          permissionCode: code,
          scopeCode,
        })
      );
      updatePermissionsMutation.mutate({
        roleId: selectedRole.id,
        permissions: payloadPermissions,
        resourceAssignments: [],
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
                  permissionCode: p.code,
                  scopeCode: p.scope || 'ORGANIZATION',
                }));
                updatePermissionsMutation.mutate({
                  roleId: newRole.id,
                  permissions: payloadPermissions,
                  resourceAssignments: [],
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
              ([code, scopeCode]) => ({
                permissionCode: code,
                scopeCode,
              })
            );
            updatePermissionsMutation.mutate({
              roleId: newRole.id,
              permissions: payloadPermissions,
              resourceAssignments: [],
            });
            setSelectedRole(newRole);
          }
        },
      }
    );
  };

  return {
    // Selection & Data
    selectedRole,
    roles,
    rolesLoading,
    roleSearchQuery,
    setRoleSearchQuery,
    handleSelectRole,
    // Permissions & Modules
    filteredModules,
    activeModuleCode,
    setActiveModuleCode,
    activeModuleData,
    groupedPermissions,
    localScopedPerms,
    PERMISSION_MAP,
    permSearchQuery,
    setPermSearchQuery,
    // Inspector & Actions
    activePermission,
    setActivePermission,
    togglePermission,
    commitToggle,
    handleScopeChange,
    handleEnableAll,
    handleDisableAll,
    handleResetModule,
    // Diff & Save/Discard
    addedPerms,
    removedPerms,
    scopeChangedPerms,
    priorityChanged,
    localPriority,
    setLocalPriority,
    isDirty,
    changeCount,
    isAdminRole,
    supervisionRank,
    handleDiscardChanges,
    handleSaveChanges,
    // Drawers / Dialogs
    showReview,
    setShowReview,
    showCreateRole,
    setShowCreateRole,
    confirmPerm,
    setConfirmPerm,
    handleCreateRole,
    handleDeleteRole,
    handleCloneRole,
    // Top Tabs
    activeTab,
    setActiveTab,
    // Dialog component to render
    confirmDialog,
  };
}

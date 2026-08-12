// PermissionBrowser.jsx
import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import api from '@/shared/api/api';
import { PermissionToolbar } from './PermissionToolbar';
import { PermissionGroups } from './PermissionGroups';
import { computeModuleLevel } from '../entities/constants';

const RESOURCE_TYPES = ['PROJECT', 'TEAM', 'CREW'];

export function PermissionBrowser({ module, groupedPermissions, localScopedPerms, permissionMap, isAdmin, searchQuery, onSearchChange, riskFilter, onRiskFilterChange, onToggle, onSelect, activePermission, onEnableAll, onDisableAll, onReset, collapsedGroups, onToggleGroupCollapsed, onScopeChange, onResourceAssignmentChange, onSetModuleLevel }) {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;
  const [resourcesByType, setResourcesByType] = useState({});

  // Load lookup lists once so inline resource chips render without opening the inspector
  useEffect(() => {
    if (!orgId) return;
    let mounted = true;
    (async () => {
      const out = {};
      for (const type of RESOURCE_TYPES) {
        try {
          const { data } = await api.get(`/organizations/${orgId}/lookup/${type}`);
          if (mounted) out[type] = data || [];
        } catch (err) {
          if (mounted) out[type] = [];
        }
      }
      if (mounted) setResourcesByType(out);
    })();
    return () => { mounted = false; };
  }, [orgId]);

  const level = module
    ? computeModuleLevel({ module, enabledCodes: Object.keys(localScopedPerms || {}), permissionMap })
    : { cov: 0, max: 0, exact: false };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-card)]">
      <PermissionToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        riskFilter={riskFilter}
        onRiskFilterChange={onRiskFilterChange}
        isAdmin={isAdmin}
        onEnableAll={onEnableAll}
        onDisableAll={onDisableAll}
        onReset={onReset}
        level={level}
        onSetLevel={onSetModuleLevel}
      />
      <PermissionGroups
        groupedPermissions={groupedPermissions}
        localScopedPerms={localScopedPerms}
        isAdmin={isAdmin}
        onToggle={onToggle}
        onSelect={onSelect}
        activePermission={activePermission}
        collapsedGroups={collapsedGroups}
        onToggleGroupCollapsed={onToggleGroupCollapsed}
        onScopeChange={onScopeChange}
        onResourceAssignmentChange={onResourceAssignmentChange}
        resourcesByType={resourcesByType}
      />
    </div>
  );
}

import React from 'react';
import { PermissionToolbar } from './PermissionToolbar';
import { PermissionGroups } from './PermissionGroups';

export function PermissionBrowser({
  groupedPermissions,
  localScopedPerms,
  permissionMap,
  isAdmin,
  searchQuery,
  onSearchChange,
  onToggle,
  onSelect,
  activePermission,
  onEnableAll,
  onDisableAll,
  onReset,
}) {
  return (
    <div className="flex flex-col min-h-0 flex-1 bg-[var(--bg-card)]">
      <PermissionToolbar
        searchQuery={searchQuery}
        onSearchChange={onSearchChange}
        isAdmin={isAdmin}
        onEnableAll={onEnableAll}
        onDisableAll={onDisableAll}
        onReset={onReset}
        localScopedPerms={localScopedPerms}
        permissionMap={permissionMap}
      />

      <PermissionGroups
        groupedPermissions={groupedPermissions}
        localScopedPerms={localScopedPerms}
        isAdmin={isAdmin}
        onToggle={onToggle}
        onSelect={onSelect}
        activePermission={activePermission}
      />
    </div>
  );
}

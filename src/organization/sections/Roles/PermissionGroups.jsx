import React from 'react';
import { PermissionGroup } from './PermissionGroup';
import { GROUP_ORDER } from './constants';

export function PermissionGroups({
  groupedPermissions,
  localScopedPerms,
  isAdmin,
  onToggle,
  onSelect,
  activePermission,
}) {
  const hasPermissions = Object.values(groupedPermissions).some(
    (g) => g && g.length > 0
  );

  if (!hasPermissions) {
    return (
      <div className="flex items-center justify-center h-48 text-xs text-[var(--text-muted)]">
        No permissions found in this module.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-2 py-2">
      {GROUP_ORDER.map((groupKey) => (
        <PermissionGroup
          key={groupKey}
          groupKey={groupKey}
          permissions={groupedPermissions[groupKey]}
          localScopedPerms={localScopedPerms}
          isAdmin={isAdmin}
          onToggle={onToggle}
          onSelect={onSelect}
          activePermission={activePermission}
        />
      ))}
    </div>
  );
}

import React from 'react';
import { PermissionGroup } from './PermissionGroup';
import { GROUP_ORDER } from '../entities/constants';
import { Inbox } from '@/shared/ui/Icons';

export function PermissionGroups({ groupedPermissions, localScopedPerms, isAdmin, onToggle, onSelect, activePermission, collapsedGroups = {}, onToggleGroupCollapsed, onScopeChange, onResourceAssignmentChange, resourcesByType = {} }) {
  const hasPermissions = Object.values(groupedPermissions).some((g) => g && g.length > 0);

  if (!hasPermissions) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 h-48 text-center">
        <Inbox className="w-5 h-5 text-[var(--text-muted)]" />
        <span className="text-[12px] text-[var(--text-muted)]">No permissions found in this module.</span>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto px-2.5 py-2.5">
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
          collapsed={Boolean(collapsedGroups[groupKey])}
          onToggleCollapsed={() => onToggleGroupCollapsed(groupKey)}
          onScopeChange={onScopeChange}
          onResourceAssignmentChange={onResourceAssignmentChange}
          resourcesByType={resourcesByType}
        />
      ))}
    </div>
  );
}

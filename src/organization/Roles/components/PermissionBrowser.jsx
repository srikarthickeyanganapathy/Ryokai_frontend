// PermissionBrowser.jsx
import React from 'react';
import { PermissionToolbar } from './PermissionToolbar';
import { PermissionGroups } from './PermissionGroups';

export function PermissionBrowser({ groupedPermissions, localScopedPerms, permissionMap, isAdmin, searchQuery, onSearchChange, riskFilter, onRiskFilterChange, onToggle, onSelect, activePermission, onEnableAll, onDisableAll, onReset, collapsedGroups, onToggleGroupCollapsed }) {
  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-card)]">
      <PermissionToolbar searchQuery={searchQuery} onSearchChange={onSearchChange} riskFilter={riskFilter} onRiskFilterChange={onRiskFilterChange} isAdmin={isAdmin} onEnableAll={onEnableAll} onDisableAll={onDisableAll} onReset={onReset} />
      <PermissionGroups groupedPermissions={groupedPermissions} localScopedPerms={localScopedPerms} isAdmin={isAdmin} onToggle={onToggle} onSelect={onSelect} activePermission={activePermission} collapsedGroups={collapsedGroups} onToggleGroupCollapsed={onToggleGroupCollapsed} />
    </div>
  );
}
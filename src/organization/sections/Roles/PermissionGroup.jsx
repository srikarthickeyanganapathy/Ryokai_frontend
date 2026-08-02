import React from 'react';
import { PermissionRow } from './PermissionRow';
import { GROUP_LABELS } from './constants';

export function PermissionGroup({
  groupKey,
  permissions = [],
  localScopedPerms = {},
  isAdmin,
  onToggle,
  onSelect,
  activePermission,
}) {
  if (!permissions || permissions.length === 0) return null;

  const enabledCount = permissions.filter((p) => Boolean(localScopedPerms?.[p.code])).length;

  return (
    <div className="mb-3">
      <div className="sticky top-0 z-10 bg-[var(--bg-card)] py-1.5 px-2.5 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {GROUP_LABELS[groupKey] || groupKey}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {enabledCount}/{permissions.length}
        </span>
      </div>

      <div className="space-y-0.5">
        {permissions.map((perm) => (
          <PermissionRow
            key={perm.code}
            perm={perm}
            isEnabled={Boolean(localScopedPerms?.[perm.code])}
            isActive={activePermission?.code === perm.code}
            isAdmin={isAdmin}
            onToggle={onToggle}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  );
}
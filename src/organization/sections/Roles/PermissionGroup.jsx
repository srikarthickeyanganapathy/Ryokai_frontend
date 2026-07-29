import React from 'react';
import { PermissionRow } from './PermissionRow';
import { GROUP_LABELS } from './constants';

export function PermissionGroup({
  groupKey,
  permissions,
  localScopedPerms,
  isAdmin,
  onToggle,
  onSelect,
  activePermission,
}) {
  if (!permissions || permissions.length === 0) return null;

  return (
    <div className="mb-2">
      {/* Sticky group header */}
      <div className="sticky top-0 z-10 bg-[var(--bg-card)]/90 backdrop-blur-xs py-1.5 px-3 border-b border-[var(--border-subtle)] flex items-center justify-between mb-1">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
          {GROUP_LABELS[groupKey] || groupKey}
        </span>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">
          {permissions.filter((p) => Boolean(localScopedPerms[p.code])).length}/
          {permissions.length}
        </span>
      </div>

      {/* Permission rows */}
      <div className="space-y-0.5">
        {permissions.map((perm) => (
          <PermissionRow
            key={perm.code}
            perm={perm}
            isEnabled={Boolean(localScopedPerms[perm.code])}
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

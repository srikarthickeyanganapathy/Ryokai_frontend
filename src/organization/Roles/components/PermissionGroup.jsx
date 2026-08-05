import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { PermissionRow } from './PermissionRow';
import { GROUP_LABELS, getGroupConfig } from '../entities/constants';

export function PermissionGroup({ groupKey, permissions = [], localScopedPerms = {}, isAdmin, onToggle, onSelect, activePermission, collapsed = false, onToggleCollapsed }) {
  if (!permissions || permissions.length === 0) return null;

  const enabledCount = permissions.filter((p) => Boolean(localScopedPerms?.[p.code])).length;
  const criticalCount = permissions.filter((p) => p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH').length;
  const group = getGroupConfig(groupKey);

  return (
    <div className="mb-3">
      <button onClick={onToggleCollapsed} className="sticky top-0 z-10 w-full bg-[var(--bg-card)]/95 backdrop-blur-sm py-1.5 px-2 flex items-center gap-1.5 justify-between hover:bg-[var(--bg-hover)] rounded-md transition-colors">
        <div className="flex items-center gap-1.5">
          <ChevronRight className={cn('w-3 h-3 text-[var(--text-muted)] transition-transform', !collapsed && 'rotate-90')} />
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: group.text }} />
          <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">{GROUP_LABELS[groupKey] || groupKey}</span>
          {criticalCount > 0 && <span className="text-[9px] font-semibold text-[var(--danger)] bg-[var(--danger-soft)] px-1.5 py-0.5 rounded-full">{criticalCount} critical</span>}
        </div>
        <span className="text-[10px] text-[var(--text-muted)] font-mono">{enabledCount}/{permissions.length}</span>
      </button>

      {!collapsed && (
        <div className="space-y-0.5 mt-1 pl-1">
          {permissions.map((perm) => (
            <PermissionRow key={perm.code} perm={perm} isEnabled={Boolean(localScopedPerms?.[perm.code])} isActive={activePermission?.code === perm.code} isAdmin={isAdmin} onToggle={onToggle} onSelect={onSelect} />
          ))}
        </div>
      )}
    </div>
  );
}

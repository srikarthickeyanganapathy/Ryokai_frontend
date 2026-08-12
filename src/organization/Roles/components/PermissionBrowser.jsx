// PermissionBrowser.jsx
import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import api from '@/shared/api/api';
import { Inbox } from '@/shared/ui/Icons';
import { PermissionToolbar } from './PermissionToolbar';
import { PermissionRow } from './PermissionRow';
import { computeModuleLevel, getModuleIcon, MODULE_HUES, GROUP_ORDER, LEVEL_TIERS } from '../entities/constants';

const RESOURCE_TYPES = ['PROJECT', 'TEAM', 'CREW'];

export function PermissionBrowser({ module, groupedPermissions, localScopedPerms, permissionMap, isAdmin, searchQuery, onSearchChange, riskFilter, onRiskFilterChange, onToggle, onEnableAll, onDisableAll, onReset, collapsedGroups, onToggleGroupCollapsed, onScopeChange, onResourceAssignmentChange, onSetModuleLevel }) {
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

  // Flat, demo-style ordered rows: groups in canonical order, permissions within each group as-is
  const flatPerms = [];
  if (groupedPermissions) {
    GROUP_ORDER.forEach((g) => {
      const list = groupedPermissions[g];
      if (list && list.length > 0) flatPerms.push(...list);
    });
  }

  const enabled = new Set(Object.keys(localScopedPerms || {}));
  const en = module ? module.permissions.filter((p) => enabled.has(p.code)).length : 0;
  const total = module?.permissions?.length || 0;
  const ModuleIcon = module ? getModuleIcon(module.code) : null;
  const moduleHue = module ? MODULE_HUES[module.code] || 'var(--accent)' : 'var(--accent)';

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--bg-card)]">
      {module && (
        <div className="flex items-center gap-2.5 px-3.5 pt-3 pb-2.5 border-b border-[var(--border-subtle)] shrink-0">
          {ModuleIcon && (
            <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: moduleHue + '1c', color: moduleHue }}>
              <ModuleIcon className="w-4 h-4" />
            </span>
          )}
          <div className="min-w-0">
            <div className="text-[14px] font-bold text-[var(--text-primary)] tracking-tight capitalize leading-tight truncate">{module.name}</div>
            <div className="text-[10.5px] text-[var(--text-muted)] mt-0.5">
              {en} of {total} permissions enabled
              {level.exact && level.max > 0 ? ` · level ${LEVEL_TIERS[level.max - 1].name}` : level.max > 0 ? ' · custom mix' : ' · no access'}
            </div>
          </div>
        </div>
      )}

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

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
        {flatPerms.length > 0 ? (
          flatPerms.map((p) => (
            <PermissionRow
              key={p.code}
              perm={p}
              isEnabled={enabled.has(p.code)}
              isAdmin={isAdmin}
              onToggle={onToggle}
              currentScope={localScopedPerms?.[p.code]?.scopeCode}
              currentAssignments={localScopedPerms?.[p.code]?.resourceAssignments}
              onScopeChange={onScopeChange}
              onResourceAssignmentChange={onResourceAssignmentChange}
              resourcesByType={resourcesByType}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 h-48 text-center">
            <Inbox className="w-5 h-5 text-[var(--text-muted)]" />
            <span className="text-[12px] text-[var(--text-muted)]">No permissions found in this module.</span>
          </div>
        )}
      </div>
    </div>
  );
}

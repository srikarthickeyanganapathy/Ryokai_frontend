// PermissionBrowser.jsx
import React, { useEffect, useState } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import api from '@/shared/api/api';
import { Inbox, Search, ShieldAlert, MoreHorizontal, ListPlus, ListMinus, RotateCcw, X } from '@/shared/ui/Icons';
import { Button } from '@/shared/ui/Button';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { cn } from '@/shared/lib/cn';
import { PermissionRow } from './PermissionRow';
import { computeModuleLevel, getModuleIcon, MODULE_HUES, GROUP_ORDER, LEVEL_TIERS } from '../entities/constants';

const RESOURCE_TYPES = ['PROJECT', 'TEAM', 'CREW'];

const LEVEL_ICONS = ['Eye', 'Pencil', 'Sliders', 'KeyRound'];
const LEVEL_TONES = [
  { on: 'bg-[var(--success-soft)] border-[var(--success)] text-[var(--success)]' },
  { on: 'bg-[var(--info-soft,var(--accent-soft))] border-[var(--info,var(--accent))] text-[var(--info,var(--accent))]' },
  { on: 'bg-[var(--warning-soft)] border-[var(--warning)] text-[var(--warning)]' },
  { on: 'bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]' },
];

// Inline the icon components from the Icons library
import { Eye, Pencil, Sliders, KeyRound } from '@/shared/ui/Icons';
const LEVEL_ICON_MAP = { Eye, Pencil, Sliders, KeyRound };

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

  // Flat, ordered rows: groups in canonical order
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
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-4 px-[18px] min-w-0">
      {/* ── Panel header ── */}
      {module && (
        <div className="flex items-center gap-3 mb-1">
          <span
            className="w-9 h-9 rounded-[11px] flex items-center justify-center shrink-0"
            style={{ backgroundColor: moduleHue + '1c', color: moduleHue }}
          >
            {ModuleIcon && <ModuleIcon className="w-[17px] h-[17px]" />}
          </span>
          <div className="min-w-0">
            <div className="font-mono text-[14px] font-bold tracking-[0.01em] text-[var(--text-primary)] capitalize leading-tight truncate">
              {module.name}
            </div>
            <div className="text-[11px] text-[var(--text-muted)] mt-0.5">
              {en} of {total} permissions enabled
              {level.exact && level.max > 0 ? ` · level ${LEVEL_TIERS[level.max - 1].name}` : level.max > 0 ? ' · custom mix' : ' · no access'}
            </div>
          </div>
        </div>
      )}

      {/* ── Level bar ── */}
      <div className="flex items-center gap-[5px] my-3 py-[9px] px-[11px] border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-subtle)]">
        <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.12em] text-[var(--text-muted)] mr-1.5 shrink-0">
          Level
        </span>
        {LEVEL_TIERS.map((t, i) => {
          const Icon = LEVEL_ICON_MAP[t.icon];
          const on = level.exact && level.max === t.lvl;
          return (
            <button
              key={t.lvl}
              disabled={isAdmin}
              onClick={() => onSetModuleLevel(t.lvl)}
              title={`${t.name} — enables ${t.groups.join(', ').toLowerCase()} permissions`}
              className={cn(
                'flex-1 h-[30px] rounded-[9px] border',
                'font-mono text-[9px] font-bold uppercase tracking-[0.08em]',
                'flex items-center justify-center gap-1.5',
                'cursor-pointer transition-all duration-[140ms]',
                'disabled:opacity-50',
                on
                  ? LEVEL_TONES[i].on
                  : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {t.name}
            </button>
          );
        })}
        <button
          disabled={isAdmin}
          onClick={() => onSetModuleLevel(0)}
          title="Remove all access in this module"
          className={cn(
            'w-[26px] h-[26px] rounded-lg border border-[var(--border-strong)]',
            'bg-[var(--bg-card)] text-[var(--text-muted)]',
            'flex items-center justify-center shrink-0',
            'cursor-pointer transition-all duration-[130ms]',
            'hover:text-[var(--danger)] hover:border-[var(--danger)]',
            'disabled:opacity-50'
          )}
        >
          <X className="w-[11px] h-[11px]" />
        </button>
      </div>

      {/* ── Search + filter row ── */}
      <div className="flex items-center gap-2 mb-1">
        <div className="flex-1 max-w-xs relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search permissions..."
            className="w-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg pl-8 pr-3 py-1.5 text-[12px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
          />
        </div>
        <button
          onClick={() => onRiskFilterChange(riskFilter === 'ELEVATED' ? 'ALL' : 'ELEVATED')}
          title="Show only Critical/High risk permissions"
          className={cn(
            'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold border transition-colors cursor-pointer',
            riskFilter === 'ELEVATED'
              ? 'bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]'
              : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Elevated only</span>
        </button>
        <div className="flex-1" />
        {!isAdmin && (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={[
              { label: 'Enable All', icon: ListPlus, onClick: onEnableAll },
              { label: 'Disable All', icon: ListMinus, onClick: onDisableAll },
              { label: 'Reset module', icon: RotateCcw, onClick: onReset, separator: 'before' },
            ]}
          />
        )}
      </div>

      {/* ── Permission rows ── */}
      <div className="flex flex-col max-h-[calc(100vh-440px)] min-h-[320px] overflow-y-auto custom-scrollbar">
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

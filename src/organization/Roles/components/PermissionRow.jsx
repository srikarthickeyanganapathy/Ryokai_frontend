import React from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { Check } from '@/shared/ui/Icons';
import { getRiskConfig, SCOPE_LABELS, permissionLabel, resourceHue } from '../entities/constants';

const RESOURCE_SCOPES = ['PROJECT', 'TEAM', 'CREW'];

export function PermissionRow({ perm, isEnabled, isAdmin, onToggle, currentScope, currentAssignments = [], onScopeChange, onResourceAssignmentChange, resourcesByType = {} }) {
  const risk = getRiskConfig(perm.riskLevel);
  const supportedScopes = perm.supportedScopes?.length > 0 ? perm.supportedScopes : ['ORGANIZATION'];
  const showScope = perm.scopeRequired !== false && supportedScopes.length > 1;
  const scope = currentScope || supportedScopes[0];
  const showResources = isEnabled && perm.requiresResourceAssignment && RESOURCE_SCOPES.includes(scope);
  const resourceList = resourcesByType?.[scope] || [];
  const selectedIds = new Set((currentAssignments || []).map((a) => a.resourceId));

  const handleToggleResource = (res) => {
    if (isAdmin) return;
    const exists = selectedIds.has(res.id);
    const next = exists
      ? (currentAssignments || []).filter((a) => a.resourceId !== res.id)
      : [...(currentAssignments || []), { resourceType: scope, resourceId: res.id, displayName: res.name }];
    onResourceAssignmentChange(perm.code, next);
  };

  const handleAllResources = () => {
    if (isAdmin) return;
    const all = resourceList.map((r) => ({ resourceType: scope, resourceId: r.id, displayName: r.name }));
    const allSelected = resourceList.length > 0 && resourceList.every((r) => selectedIds.has(r.id));
    onResourceAssignmentChange(perm.code, allSelected ? [] : all);
  };

  return (
    <div className={cn('flex items-center gap-3.5 px-3.5 py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 transition-colors hover:bg-[var(--bg-hover)]')}>
      <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
        <Checkbox checked={isEnabled} disabled={isAdmin} onCheckedChange={() => onToggle(perm)} />
      </div>

      <div className="w-[150px] shrink-0 min-w-0">
        <div className={cn('text-[12.5px] truncate leading-tight', isEnabled ? 'font-semibold text-[var(--text-primary)]' : 'font-normal text-[var(--text-muted)]')}>
          {permissionLabel(perm)}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: risk.dot }} />
          <span className="text-[8.5px] font-mono font-bold uppercase tracking-[0.08em]" style={{ color: risk.text }}>{risk.label}</span>
        </div>
      </div>

      <div className="flex-1 flex items-center gap-1.5 flex-wrap min-w-0">
        {isEnabled && showScope && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            {supportedScopes.map((s) => (
              <button
                key={s}
                disabled={isAdmin}
                onClick={() => onScopeChange(perm.code, s)}
                className={cn('text-[9px] font-mono font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border transition-colors', scope === s ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' : 'border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]')}
              >
                {SCOPE_LABELS[s] || s}
              </button>
            ))}
          </div>
        )}

        {showResources && (
          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
            <span className="text-[9px] font-mono font-semibold uppercase tracking-wide text-[var(--text-muted)] mr-0.5">{SCOPE_LABELS[scope]}s</span>
            {resourceList.length > 0 && (
              <button onClick={handleAllResources} className="text-[10px] font-semibold text-[var(--accent)] hover:underline px-1">
                {resourceList.length > 0 && resourceList.every((r) => selectedIds.has(r.id)) ? 'Deselect all' : 'Select all'}
              </button>
            )}
            {resourceList.map((res) => {
              const on = selectedIds.has(res.id);
              return (
                <button
                  key={res.id}
                  disabled={isAdmin}
                  onClick={() => handleToggleResource(res)}
                  className={cn('inline-flex items-center gap-1.5 text-[10.5px] font-medium px-2 py-0.5 rounded-full border transition-colors', on ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]')}
                >
                  <span className="w-[7px] h-[7px] rounded-full shrink-0" style={{ backgroundColor: on ? (res.hue || res.color || resourceHue(res.id)) : 'var(--text-muted)' }} />
                  {res.name}
                  {on && <Check className="w-2.5 h-2.5 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

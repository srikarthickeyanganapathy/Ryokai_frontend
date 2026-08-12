import React from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { ChevronRight, Check } from '@/shared/ui/Icons';
import { getRiskConfig, SCOPE_LABELS } from '../entities/constants';

const RESOURCE_SCOPES = ['PROJECT', 'TEAM', 'CREW'];

export function PermissionRow({ perm, isEnabled, isActive, isAdmin, onToggle, onSelect, currentScope, currentAssignments = [], onScopeChange, onResourceAssignmentChange, resourcesByType = {} }) {
  const risk = getRiskConfig(perm.riskLevel);
  const isElevated = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';
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
    <div role="button" tabIndex={0} onClick={() => onSelect(perm)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(perm); } }} className={cn('group relative flex items-start gap-3 pl-3 pr-2.5 py-2 ml-0.5 rounded-md cursor-pointer transition-colors select-none', isActive ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-hover)]')}>
      {isElevated && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full" style={{ backgroundColor: risk.dot }} />}
      <div onClick={(e) => e.stopPropagation()} className="shrink-0 mt-0.5">
        <Checkbox checked={isEnabled} disabled={isAdmin} onCheckedChange={() => onToggle(perm)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[13px] truncate', isEnabled ? 'font-medium text-[var(--text-primary)]' : 'font-normal text-[var(--text-muted)]')}>{perm.name}</span>
          <span className="hidden md:inline text-[10px] font-mono text-[var(--text-muted)]/70 truncate">{perm.code}</span>
        </div>
        {perm.description && <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mt-0.5">{perm.description}</p>}

        {isEnabled && showScope && (
          <div className="flex items-center gap-1 mt-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
          <div className="flex items-center gap-1 mt-1.5 flex-wrap" onClick={(e) => e.stopPropagation()}>
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
                  className={cn('inline-flex items-center gap-1 text-[10.5px] font-medium px-2 py-0.5 rounded-full border transition-colors', on ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)]' : 'border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]')}
                >
                  {res.name}
                  {on && <Check className="w-2.5 h-2.5 text-[var(--accent)]" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 mt-0.5 transition-opacity', isActive ? 'text-[var(--accent)] opacity-100' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100')} />
    </div>
  );
}

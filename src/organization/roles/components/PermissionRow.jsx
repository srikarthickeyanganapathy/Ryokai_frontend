import React, { useState, useMemo } from 'react';
import { cn } from '@/shared/lib/cn';
import { Check, Search, ChevronDown } from '@/shared/ui/Icons';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { getRiskConfig, SCOPE_LABELS, permissionLabel, resourceHue } from '../entities/constants';

const RESOURCE_SCOPES = ['PROJECT', 'TEAM', 'CREW'];
const MAX_VISIBLE_CHIPS = 3;

export function PermissionRow({ perm, isEnabled, isAdmin, onToggle, currentScope, currentAssignments = [], onScopeChange, onResourceAssignmentChange, resourcesByType = {} }) {
  const risk = getRiskConfig(perm.riskLevel);
  const supportedScopes = perm.supportedScopes?.length > 0 ? perm.supportedScopes : ['ORGANIZATION'];
  const showScope = perm.scopeRequired !== false && supportedScopes.length > 1;
  const scope = currentScope || supportedScopes[0];
  const showResources = isEnabled && perm.requiresResourceAssignment && RESOURCE_SCOPES.includes(scope);
  const resourceList = resourcesByType?.[scope] || [];
  const selectedIds = new Set((currentAssignments || []).map((a) => a.resourceId));
  const selectedCount = (currentAssignments || []).length;

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

  // Show inline chips only for small lists, use popover picker for larger lists
  const usePopover = resourceList.length > MAX_VISIBLE_CHIPS;

  return (
    <div
      className={cn(
        'flex items-center gap-3 py-2.5 px-1 border-b border-[var(--border-subtle)] last:border-b-0',
        isEnabled && 'on'
      )}
    >
      {/* Custom checkbox */}
      <button
        onClick={(e) => { e.stopPropagation(); if (!isAdmin) onToggle(perm); }}
        disabled={isAdmin}
        className={cn(
          'w-[19px] h-[19px] rounded-[7px] border-[1.5px] shrink-0',
          'flex items-center justify-center',
          'transition-all duration-[130ms] cursor-pointer',
          isEnabled
            ? 'bg-[var(--accent)] border-[var(--accent)] text-[#17102B]'
            : 'bg-[var(--bg-subtle)] border-[var(--border-strong)] text-transparent',
          isAdmin && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Check className="w-[11px] h-[11px]" />
      </button>

      {/* Label */}
      <div className="flex-[0_0_190px] min-w-0">
        <div className={cn(
          'text-[12px] font-semibold truncate leading-tight',
          isEnabled ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
        )}>
          {permissionLabel(perm)}
        </div>
        <div className="flex items-center gap-[5px] mt-0.5">
          <i
            className="w-[5px] h-[5px] rounded-full not-italic block shrink-0"
            style={{ backgroundColor: risk.dot }}
          />
          <span
            className="font-mono text-[7.5px] font-bold uppercase tracking-[0.08em]"
            style={{ color: risk.text }}
          >
            {risk.label}
          </span>
        </div>
      </div>

      {/* Middle: scope pills + resources */}
      <div className="flex items-center gap-2 flex-1 min-w-0 flex-wrap">
        {/* Scope pills */}
        {isEnabled && showScope && (
          <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
            {supportedScopes.map((s) => (
              <button
                key={s}
                disabled={isAdmin}
                onClick={() => onScopeChange(perm.code, s)}
                className={cn(
                  'font-mono text-[8px] font-semibold uppercase tracking-[0.04em]',
                  'px-2 py-[3px] rounded-full border',
                  'cursor-pointer transition-all duration-[120ms]',
                  scope === s
                    ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]'
                    : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
                )}
              >
                {SCOPE_LABELS[s] || s}
              </button>
            ))}
          </div>
        )}

        {/* Resources -- inline chips for small lists, popover picker for large lists */}
        {showResources && (
          <div className="flex items-center gap-1.5 flex-wrap flex-1 basis-full" onClick={(e) => e.stopPropagation()}>
            <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
              {SCOPE_LABELS[scope]}s
            </span>

            {usePopover ? (
              /* --- Popover picker for large resource lists --- */
              <ResourcePopoverPicker
                scope={scope}
                resourceList={resourceList}
                selectedIds={selectedIds}
                selectedCount={selectedCount}
                isAdmin={isAdmin}
                onToggle={handleToggleResource}
                onToggleAll={handleAllResources}
              />
            ) : (
              /* --- Inline chips for small resource lists ( 3) --- */
              <>
                {resourceList.map((res) => {
                  const on = selectedIds.has(res.id);
                  return (
                    <button
                      key={res.id}
                      disabled={isAdmin}
                      onClick={() => handleToggleResource(res)}
                      className={cn(
                        'inline-flex items-center gap-[5px] text-[10.5px] font-medium',
                        'px-[9px] py-1 rounded-full border',
                        'cursor-pointer transition-all duration-[120ms]',
                        on
                          ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)]'
                          : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      )}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: on ? (res.hue || res.color || resourceHue(res.id)) : 'var(--text-muted)' }}
                      />
                      {res.name}
                      {on && (
                        <span className="inline-flex text-[var(--accent)]">
                          <Check className="w-[9px] h-[9px]" />
                        </span>
                      )}
                    </button>
                  );
                })}
                {resourceList.length > 0 && (
                  <button
                    onClick={handleAllResources}
                    className="text-[10px] font-semibold text-[var(--accent)] cursor-pointer bg-transparent border-none px-1 py-0.5 hover:underline"
                  >
                    {resourceList.every((r) => selectedIds.has(r.id)) ? 'Deselect all' : 'Select all'}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---
 * ResourcePopoverPicker -- searchable popover for large resource lists
 * ---*/
function ResourcePopoverPicker({ scope, resourceList, selectedIds, selectedCount, isAdmin, onToggle, onToggleAll }) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search.trim()) return resourceList;
    const q = search.toLowerCase();
    return resourceList.filter((r) => r.name.toLowerCase().includes(q));
  }, [resourceList, search]);

  const allSelected = resourceList.length > 0 && resourceList.every((r) => selectedIds.has(r.id));
  const scopeLabel = SCOPE_LABELS[scope] || scope;

  // Show up to 2 selected names as mini chips, rest as "+N"
  const selectedResources = resourceList.filter((r) => selectedIds.has(r.id));
  const visibleSelected = selectedResources.slice(0, 2);
  const overflowCount = selectedResources.length - visibleSelected.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          disabled={isAdmin}
          className={cn(
            'inline-flex items-center gap-1.5 text-[10.5px] font-medium',
            'pl-2.5 pr-2 py-1 rounded-full border',
            'cursor-pointer transition-all duration-[120ms]',
            selectedCount > 0
              ? 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--text-primary)]'
              : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-[var(--text-muted)] hover:text-[var(--text-primary)]',
            isAdmin && 'opacity-50 cursor-not-allowed'
          )}
        >
          {selectedCount > 0 ? (
            <>
              {visibleSelected.map((res) => (
                <span key={res.id} className="inline-flex items-center gap-1">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: res.hue || res.color || resourceHue(res.id) }}
                  />
                  <span className="max-w-[60px] truncate">{res.name}</span>
                </span>
              ))}
              {overflowCount > 0 && (
                <span className="font-mono text-[9px] font-bold text-[var(--accent)]">+{overflowCount}</span>
              )}
            </>
          ) : (
            <span>Select {scopeLabel}s...</span>
          )}
          <ChevronDown className={cn('w-3 h-3 shrink-0 transition-transform', open && 'rotate-180')} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-0 overflow-hidden">
        {/* Search */}
        <div className="p-2 border-b border-[var(--border-subtle)]">
          <div className="relative">
            <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Search ${scopeLabel.toLowerCase()}s...`}
              autoFocus
              className="w-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md pl-7 pr-2.5 py-1.5 text-[11px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--accent)] transition-colors"
            />
          </div>
        </div>

        {/* Header with select/deselect all */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]">
          <span className="font-mono text-[8px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">
            {selectedCount} of {resourceList.length} selected
          </span>
          <button
            onClick={onToggleAll}
            className="text-[9px] font-semibold text-[var(--accent)] hover:underline cursor-pointer bg-transparent border-none"
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
        </div>

        {/* Resource list */}
        <div className="max-h-52 overflow-y-auto custom-scrollbar">
          {filtered.length > 0 ? filtered.map((res) => {
            const on = selectedIds.has(res.id);
            return (
              <button
                key={res.id}
                disabled={isAdmin}
                onClick={() => onToggle(res)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-left',
                  'transition-colors cursor-pointer border-none',
                  on
                    ? 'bg-[var(--accent-soft)]'
                    : 'bg-transparent hover:bg-[var(--bg-hover)]'
                )}
              >
                {/* Mini checkbox */}
                <span className={cn(
                  'w-4 h-4 rounded-md border-[1.5px] shrink-0 flex items-center justify-center transition-all',
                  on
                    ? 'bg-[var(--accent)] border-[var(--accent)] text-[#17102B]'
                    : 'border-[var(--border-strong)] bg-[var(--bg-card)] text-transparent'
                )}>
                  <Check className="w-2.5 h-2.5" />
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: res.hue || res.color || resourceHue(res.id) }}
                />
                <span className={cn(
                  'text-[11px] truncate flex-1',
                  on ? 'font-medium text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                )}>
                  {res.name}
                </span>
              </button>
            );
          }) : (
            <div className="px-3 py-4 text-center text-[11px] text-[var(--text-muted)]">
              No {scopeLabel.toLowerCase()}s match "{search}"
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

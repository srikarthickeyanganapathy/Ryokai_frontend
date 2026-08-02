import React from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { ArrowRight } from 'lucide-react';
import { SCOPE_LABELS } from './constants';

export function ReviewDrawer({
  open,
  onOpenChange,
  roleName,
  addedPerms,
  removedPerms,
  scopeChangedPerms,
  priorityChanged,
  originalPriority,
  newPriority,
  permissionMap,
  localScopedPerms = {},
  originalMap = {},
  onSave,
  onDiscard,
}) {
  const totalChanges =
    addedPerms.length + removedPerms.length + scopeChangedPerms.length + (priorityChanged ? 1 : 0);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-sm p-0 flex flex-col">
        <DrawerHeader className="px-5 pt-5 pb-3 border-b border-[var(--border-subtle)]">
          <DrawerTitle className="text-[15px]">Review Pending Changes</DrawerTitle>
          <DrawerDescription className="text-[12px]">
            {totalChanges} change{totalChanges !== 1 ? 's' : ''} for{' '}
            <strong className="text-[var(--text-primary)]">{roleName}</strong>
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-2">
          {priorityChanged && (
            <GitDiffRow badge="~" color="var(--warning)" title="Priority">
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                <span>{originalPriority}</span>
                <ArrowRight className="w-3 h-3" />
                <span className="font-semibold text-[var(--text-primary)]">{newPriority}</span>
              </div>
            </GitDiffRow>
          )}

          {addedPerms.map((code) => {
            const p = permissionMap.get(code);
            const config = localScopedPerms?.[code] || {};
            const scope = config.scopeCode || 'ORGANIZATION';
            const resCount = config.resourceAssignments?.length || 0;
            return (
              <GitDiffRow key={code} badge="+" color="var(--success)" title={p?.name || code}>
                <Badge variant="outline" className="text-[9px] uppercase">
                  {SCOPE_LABELS[scope] || scope}
                  {resCount > 0 ? ` + ${resCount} res` : ''}
                </Badge>
              </GitDiffRow>
            );
          })}

          {scopeChangedPerms.map((code) => {
            const p = permissionMap?.get(code);
            const oldConfig = originalMap?.[code] || {};
            const newConfig = localScopedPerms?.[code] || {};
            const oldScope = oldConfig.scopeCode || 'ORGANIZATION';
            const newScope = newConfig.scopeCode || 'ORGANIZATION';
            const oldResCount = oldConfig.resourceAssignments?.length || 0;
            const newResCount = newConfig.resourceAssignments?.length || 0;
            return (
              <GitDiffRow key={code} badge="~" color="var(--warning)" title={p?.name || code}>
                <div className="flex flex-col gap-1 text-[11px] text-[var(--text-muted)]">
                  <div className="flex items-center gap-1">
                    <span>{SCOPE_LABELS[oldScope]}</span>
                    <ArrowRight className="w-2.5 h-2.5" />
                    <span className="font-semibold text-[var(--text-primary)]">{SCOPE_LABELS[newScope]}</span>
                  </div>
                  {(oldResCount !== newResCount || newResCount > 0) && (
                    <div className="flex items-center gap-1 opacity-80">
                      <span>{oldResCount} res</span>
                      <ArrowRight className="w-2.5 h-2.5" />
                      <span className="font-semibold">{newResCount} res</span>
                    </div>
                  )}
                </div>
              </GitDiffRow>
            );
          })}

          {removedPerms.map((code) => {
            const p = permissionMap.get(code);
            return <GitDiffRow key={code} badge="-" color="var(--danger)" title={p?.name || code} isRemoved />;
          })}
        </div>

        <div className="p-4 border-t border-[var(--border-subtle)] flex gap-3">
          <Button variant="outline" className="flex-1 text-[12px]" onClick={onDiscard}>
            Discard
          </Button>
          <Button variant="primary" className="flex-1 text-[12px]" onClick={onSave}>
            Save Changes
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function GitDiffRow({ badge, color, title, children, isRemoved }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-md bg-[var(--bg-subtle)]">
      <span
        className="w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] shrink-0"
        style={{ backgroundColor: `color-mix(in srgb, ${color} 15%, transparent)`, color }}
      >
        {badge}
      </span>
      <span
        className={`text-[13px] flex-1 truncate ${
          isRemoved ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)] font-medium'
        }`}
      >
        {title}
      </span>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
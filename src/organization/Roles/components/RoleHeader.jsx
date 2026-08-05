import React, { useMemo } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { MoreHorizontal, Copy, Trash2, CheckCircle2, ShieldAlert, PanelRight, PanelRightClose, Shield } from '@/shared/ui/Icons';

export function RoleHeader({ role, isAdmin, permissionCount, isDirty, changeCount, supervisionNames, onDiscard, onSave, onReview, onClone, onDelete, permissionMap, localScopedPerms, inspectorOpen = true, onToggleInspector }) {
  const stats = useMemo(() => {
    if (!permissionMap || !localScopedPerms) return { read: 0, write: 0, workflow: 0, critical: 0 };
    let read = 0, write = 0, workflow = 0, critical = 0;
    Object.keys(localScopedPerms).forEach((code) => {
      const p = permissionMap.get(code);
      if (!p) return;
      const g = p.group || 'GENERAL';
      if (g === 'READ') read++; else if (g === 'WRITE') write++; else if (g === 'WORKFLOW') workflow++;
      if (p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH') critical++;
    });
    return { read, write, workflow, critical };
  }, [permissionMap, localScopedPerms]);

  if (!role) return null;

  return (
    <div className="px-6 py-3.5 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: isAdmin ? 'var(--warning-soft)' : 'var(--accent-soft)' }}>
            <Shield className="w-4.5 h-4.5" style={{ color: isAdmin ? 'var(--warning)' : 'var(--accent)' }} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5">
              <h2 className="text-[17px] font-bold tracking-tight text-[var(--text-primary)] truncate">{role.name}</h2>
              {isAdmin && <Badge variant="warning" className="text-[10px] uppercase font-semibold shrink-0">System</Badge>}
              {isDirty && !isAdmin && (
                <span className="text-[10px] font-medium text-[var(--danger)] flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] animate-pulse" /> Unsaved changes
                </span>
              )}
            </div>
            <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-[11px] text-[var(--text-muted)]">
              <span>Priority <strong className="text-[var(--text-secondary)] font-semibold font-mono">{role.priority ?? 0}</strong></span>
              <Dot />
              <span>{permissionCount} enabled</span>
              <Dot />
              <span className="text-[var(--success)] font-medium">{stats.read} read</span>
              <Dot />
              <span className="text-[var(--warning)] font-medium">{stats.write} write</span>
              <Dot />
              <span className="text-[var(--accent)] font-medium">{stats.workflow} workflow</span>
              {stats.critical > 0 && (<><Dot /><span className="text-[var(--danger)] font-semibold flex items-center gap-1"><ShieldAlert className="w-3 h-3" /> {stats.critical} critical</span></>)}
              {supervisionNames.length > 0 && (<><Dot /><span>Manages <strong className="text-[var(--text-secondary)] font-medium">{supervisionNames.join(', ')}</strong></span></>)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button variant="ghost" size="sm" onClick={onToggleInspector} className="hidden lg:flex h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]" title={inspectorOpen ? 'Hide role overview panel' : 'Show role overview panel'}>
            {inspectorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
          </Button>
          {!isAdmin && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><MoreHorizontal className="w-4 h-4" /></Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-38 p-1">
                <button onClick={onClone} className="w-full text-left px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md flex items-center gap-2 transition-colors"><Copy className="w-3.5 h-3.5" /> Clone Role</button>
                <div className="my-1 h-px bg-[var(--border-subtle)]" />
                <button onClick={onDelete} className="w-full text-left px-2.5 py-1.5 text-[12px] text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-md flex items-center gap-2 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete Role</button>
              </PopoverContent>
            </Popover>
          )}
          {!isAdmin && (
            isDirty ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={onReview} className="h-8 text-[12px] px-3">Review</Button>
                <Button variant="ghost" size="sm" onClick={onDiscard} className="h-8 text-[12px] text-[var(--text-muted)] px-3">Discard</Button>
                <Button variant="primary" size="sm" onClick={onSave} className="h-8 text-[12px] px-4 font-semibold shadow-xs">Save ({changeCount})</Button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-1.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" />
                <span className="font-medium">Saved</span>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

function Dot() { return <span className="text-[var(--border-subtle)]">·</span>; }
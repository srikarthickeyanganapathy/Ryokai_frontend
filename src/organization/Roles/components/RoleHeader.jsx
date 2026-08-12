import React from 'react';
import { Button } from '@/shared/ui/Button';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { MoreHorizontal, Copy, Trash2, ArrowLeft, CheckCircle2 } from '@/shared/ui/Icons';
import { rolePurpose } from '../entities/constants';

export function RoleHeader({ role, isAdmin, isDirty, changeCount, onDiscard, onSave, onReview, onClone, onDelete, onBack }) {
  if (!role) return null;

  return (
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-3.5 min-w-0">
        {onBack && (
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-[var(--text-secondary)] px-2.5 py-[7px] rounded-lg hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Command chain
          </button>
        )}
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <h2 className="font-mono font-bold text-[16px] tracking-wide text-[var(--text-primary)] truncate">{role.name}</h2>
            {isAdmin && (
              <span className="inline-flex items-center gap-1.5 text-[9.5px] font-mono font-bold uppercase tracking-[0.12em] text-[var(--warning)] bg-[var(--warning-soft)] border border-[var(--warning)]/25 px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1 h-1 rounded-full bg-[var(--warning)]" /> System
              </span>
            )}
          </div>
          <p className="text-[11.5px] text-[var(--text-secondary)] mt-0.5 truncate">{rolePurpose(role.name)}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {!isAdmin && (
          <DropdownMenu
            trigger={<Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><MoreHorizontal className="w-4 h-4" /></Button>}
            items={[
              { label: 'Clone Role', icon: Copy, onClick: onClone },
              { label: 'Delete Role', icon: Trash2, onClick: onDelete, danger: true, separator: 'before' },
            ]}
          />
        )}
        {!isAdmin && (
          isDirty ? (
            <div className="flex items-center gap-1.5 pl-3 pr-1.5 py-1 rounded-full bg-[var(--danger-soft)] border border-[var(--danger)]/40">
              <span className="text-[11px] font-bold text-[var(--danger)] shrink-0">{changeCount} change{changeCount === 1 ? '' : 's'}</span>
              <Button variant="ghost" size="sm" onClick={onReview} className="h-7 px-2.5 text-[11px] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Review</Button>
              <Button variant="ghost" size="sm" onClick={onDiscard} className="h-7 px-2.5 text-[11px] rounded-full text-[var(--text-secondary)] hover:text-[var(--text-primary)]">Discard</Button>
              <Button variant="primary" size="sm" onClick={onSave} className="h-7 px-3 text-[11px] rounded-full font-semibold shadow-xs">Save</Button>
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-card)] border border-[var(--border-subtle)] px-3.5 py-2 rounded-full">
              <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)]" /> Saved
            </div>
          )
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { ChevronRight } from 'lucide-react';
import { getRiskConfig } from '../entities/constants';

export function PermissionRow({ perm, isEnabled, isActive, isAdmin, onToggle, onSelect }) {
  const risk = getRiskConfig(perm.riskLevel);
  const isElevated = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';

  return (
    <div role="button" tabIndex={0} onClick={() => onSelect(perm)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(perm); } }} className={cn('group relative flex items-center gap-3 pl-3 pr-2.5 py-2 ml-0.5 rounded-md cursor-pointer transition-colors select-none', isActive ? 'bg-[var(--accent-soft)]' : 'hover:bg-[var(--bg-hover)]')}>
      {isElevated && <span className="absolute left-0 top-1.5 bottom-1.5 w-[2.5px] rounded-full" style={{ backgroundColor: risk.dot }} />}
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox checked={isEnabled} disabled={isAdmin} onCheckedChange={() => onToggle(perm)} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className={cn('text-[13px] truncate', isEnabled ? 'font-medium text-[var(--text-primary)]' : 'font-normal text-[var(--text-muted)]')}>{perm.name}</span>
          <span className="hidden md:inline text-[10px] font-mono text-[var(--text-muted)]/70 truncate">{perm.code}</span>
        </div>
        {perm.description && <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mt-0.5">{perm.description}</p>}
      </div>
      <ChevronRight className={cn('w-3.5 h-3.5 shrink-0 transition-opacity', isActive ? 'text-[var(--accent)] opacity-100' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100')} />
    </div>
  );
}
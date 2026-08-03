import React from 'react';
import { cn } from '@/shared/lib/cn';
import { getModuleIcon } from './constants';

export function ModuleSidebar({ modules = [], activeModule, onModuleChange, localScopedPerms = {} }) {
  return (
    <div className="w-[180px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 overflow-y-auto">
      <div className="px-3 pt-3 pb-1.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Modules</span>
      </div>
      <div className="px-1.5 pb-2 space-y-0.5">
        {modules.map((module) => {
          const isActive = activeModule === module.moduleCode;
          const Icon = getModuleIcon(module.moduleCode);
          const enabledCount = module.permissions.filter((p) => Boolean(localScopedPerms?.[p.code])).length;
          const totalCount = module.permissions.length;
          const coverage = totalCount > 0 ? Math.round((enabledCount / totalCount) * 100) : 0;

          return (
            <button key={module.moduleCode} onClick={() => onModuleChange(module.moduleCode)} className={cn('w-full flex flex-col gap-1.5 px-2.5 py-2 rounded-md text-[12px] font-medium transition-colors text-left', isActive ? 'bg-[var(--bg-card)] text-[var(--accent)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-[var(--border-subtle)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/60 hover:text-[var(--text-primary)]')}>
              <div className="flex items-center gap-2">
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate flex-1">{module.displayName}</span>
                <span className={cn('text-[10px] font-mono shrink-0', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{enabledCount > 0 ? `${enabledCount}/${totalCount}` : totalCount}</span>
              </div>
              {totalCount > 0 && (
                <div className="h-[2px] w-full rounded-full bg-[var(--border-subtle)] overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${coverage}%`, backgroundColor: isActive ? 'var(--accent)' : 'var(--text-muted)', opacity: coverage > 0 ? (isActive ? 1 : 0.5) : 0 }} />
                </div>
              )}
            </button>
          );
        })}
        {modules.length === 0 && <div className="px-2.5 py-4 text-[11px] text-[var(--text-muted)] text-center">No modules match.</div>}
      </div>
    </div>
  );
}
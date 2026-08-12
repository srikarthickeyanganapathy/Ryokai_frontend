import React from 'react';
import { cn } from '@/shared/lib/cn';
import { getModuleIcon, MODULE_HUES, computeModuleLevel } from '../entities/constants';

const DOTS = [
  { cls: 'd1', color: 'var(--success)' },
  { cls: 'd2', color: 'var(--accent)' },
  { cls: 'd3', color: 'var(--warning)' },
  { cls: 'd4', color: 'var(--danger)' },
];

export function ModuleSidebar({ modules = [], activeModule, onModuleChange, localScopedPerms = {}, permissionMap = null }) {
  const enabledCodes = Object.keys(localScopedPerms);
  return (
    <div className="w-[188px] shrink-0 border-r border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 overflow-y-auto">
      <div className="px-3 pt-3 pb-1.5">
        <span className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Modules</span>
      </div>
      <div className="px-1.5 pb-2 space-y-0.5">
        {modules.map((module) => {
          const isActive = activeModule === module.moduleCode;
          const Icon = getModuleIcon(module.moduleCode);
          const hue = MODULE_HUES[module.moduleCode] || 'var(--accent)';
          const enabledCount = module.permissions.filter((p) => Boolean(localScopedPerms?.[p.code])).length;
          const totalCount = module.permissions.length;
          const level = computeModuleLevel({ module, enabledCodes, permissionMap });

          return (
            <button key={module.moduleCode} onClick={() => onModuleChange(module.moduleCode)} className={cn('w-full flex flex-col gap-1 px-2 py-2 rounded-lg text-[12px] font-medium transition-colors text-left', isActive ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-[0_1px_2px_rgba(0,0,0,0.04)] ring-1 ring-inset ring-[var(--accent)]/30' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card)]/60 hover:text-[var(--text-primary)]')}>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-md flex items-center justify-center shrink-0" style={{ backgroundColor: hue + '1c', color: hue }}>
                  <Icon className="w-3 h-3" />
                </span>
                <span className="truncate flex-1">{module.displayName}</span>
                <span className={cn('text-[10px] font-mono shrink-0', isActive ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')}>{enabledCount > 0 ? `${enabledCount}/${totalCount}` : totalCount}</span>
              </div>
              <div className="flex items-center gap-1 pl-8">
                {DOTS.map((dot, i) => {
                  const solid = level.max > 0 && i < level.cov;
                  const partial = level.max > 0 && !level.exact && i >= level.cov && i < level.max;
                  return (
                    <span
                      key={dot.cls}
                      className={cn('w-[5px] h-[5px] rounded-full border border-[var(--border-subtle)]', solid && 'border-transparent', partial && 'border-dashed border-[var(--accent)] bg-transparent')}
                      style={solid ? { backgroundColor: dot.color } : undefined}
                    />
                  );
                })}
              </div>
            </button>
          );
        })}
        {modules.length === 0 && <div className="px-2.5 py-4 text-[11px] text-[var(--text-muted)] text-center">No modules match.</div>}
      </div>
    </div>
  );
}

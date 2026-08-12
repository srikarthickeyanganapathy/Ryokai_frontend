import React from 'react';
import { cn } from '@/shared/lib/cn';
import { getModuleIcon, MODULE_HUES, computeModuleLevel } from '../entities/constants';

const DOT_COLORS = [
  'var(--success)',
  'var(--info, var(--accent))',
  'var(--warning)',
  'var(--danger)',
];

export function ModuleSidebar({ modules = [], activeModule, onModuleChange, localScopedPerms = {}, permissionMap = null }) {
  const enabledCodes = Object.keys(localScopedPerms);

  return (
    <nav
      className={cn(
        'bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-2',
        'lg:sticky lg:top-0',
        // Responsive: horizontal flex-wrap on small screens
        'max-lg:flex max-lg:flex-wrap max-lg:gap-1 max-lg:static'
      )}
    >
      {/* Rail label */}
      <div className="flex items-center gap-[7px] px-2.5 py-1.5 pb-2 max-lg:w-full">
        <span className="w-2.5 h-0.5 rounded-sm bg-[var(--accent)] shrink-0" />
        <span className="font-mono text-[8.5px] font-bold uppercase tracking-[0.14em] text-[var(--text-muted)]">
          Modules
        </span>
      </div>

      {/* Module items */}
      {modules.map((module) => {
        const isActive = activeModule === module.moduleCode;
        const Icon = getModuleIcon(module.moduleCode);
        const hue = MODULE_HUES[module.moduleCode] || 'var(--accent)';
        const enabledCount = module.permissions.filter((p) => Boolean(localScopedPerms?.[p.code])).length;
        const totalCount = module.permissions.length;
        const level = computeModuleLevel({ module, enabledCodes, permissionMap });

        return (
          <button
            key={module.moduleCode}
            onClick={() => onModuleChange(module.moduleCode)}
            className={cn(
              'w-full flex items-center gap-[9px] px-[9px] py-2 rounded-[10px]',
              'border-none bg-transparent text-[var(--text-secondary)]',
              'text-[12px] font-semibold text-left cursor-pointer',
              'transition-all duration-[130ms]',
              'hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]',
              isActive && 'bg-[var(--accent-soft)] text-[var(--text-primary)]',
              // Responsive
              'max-lg:flex-1 max-lg:basis-[30%] max-lg:w-auto'
            )}
          >
            {/* Icon */}
            <span
              className="w-6 h-6 rounded-[7px] flex items-center justify-center shrink-0"
              style={{ backgroundColor: hue + '1c', color: hue }}
            >
              <Icon className="w-3 h-3" />
            </span>

            {/* Name */}
            <span className="flex-1 font-mono text-[9.5px] font-bold tracking-[0.05em] uppercase overflow-hidden text-ellipsis whitespace-nowrap">
              {module.displayName}
            </span>

            {/* Count */}
            <span className={cn(
              'font-mono text-[8.5px] text-[var(--text-muted)] shrink-0',
              isActive && 'text-[var(--accent)]'
            )}>
              {enabledCount > 0 ? `${enabledCount}/${totalCount}` : totalCount}
            </span>

            {/* Level dots */}
            <span className="flex gap-[2.5px] items-center shrink-0">
              {DOT_COLORS.map((color, i) => {
                const solid = level.max > 0 && i < level.cov;
                const partial = level.max > 0 && !level.exact && i >= level.cov && i < level.max;
                return (
                  <i
                    key={i}
                    className={cn(
                      'w-[5px] h-[5px] rounded-full not-italic block',
                      !solid && !partial && 'bg-[var(--bg-subtle)] border border-[var(--border-strong)]',
                      partial && 'border border-dashed border-[var(--accent)] bg-transparent'
                    )}
                    style={solid ? { backgroundColor: color, borderColor: color, border: `1px solid ${color}` } : undefined}
                  />
                );
              })}
            </span>
          </button>
        );
      })}

      {modules.length === 0 && (
        <div className="px-2.5 py-4 text-[11px] text-[var(--text-muted)] text-center max-lg:w-full">
          No modules match.
        </div>
      )}
    </nav>
  );
}

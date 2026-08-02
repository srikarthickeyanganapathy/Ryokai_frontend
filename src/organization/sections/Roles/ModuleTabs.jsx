import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/lib/cn';
import { getModuleIcon } from './constants';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { ChevronDown } from 'lucide-react';

export function ModuleTabs({
  modules = [],
  activeModule,
  onModuleChange,
  localScopedPerms = {},
}) {
  const visibleModules = modules.slice(0, 5);
  const overflowModules = modules.slice(5);

  const isOverflowActive = overflowModules.some((m) => m.moduleCode === activeModule);

  return (
    <div className="flex items-center px-3 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
      <div className="flex items-center gap-0.5">
        {visibleModules.map((module) => {
          const isActive = activeModule === module.moduleCode;
          const Icon = getModuleIcon(module.moduleCode);
          const enabledCount = module.permissions.filter((p) =>
            Boolean(localScopedPerms?.[p.code])
          ).length;

          return (
            <button
              key={module.moduleCode}
              onClick={() => onModuleChange(module.moduleCode)}
              className={cn(
                'relative flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-medium transition-colors select-none',
                isActive
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{module.displayName}</span>
              {enabledCount > 0 && (
                <span
                  className={cn(
                    'text-[10px] font-mono min-w-[16px] h-4 px-1 rounded-full inline-flex items-center justify-center',
                    isActive
                      ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                      : 'bg-[var(--bg-subtle)] text-[var(--text-muted)]'
                  )}
                >
                  {enabledCount}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="module-tab-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-[var(--accent)]"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}

        {overflowModules.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                className={cn(
                  'flex items-center gap-1 px-2.5 py-2.5 text-[12px] font-medium transition-colors select-none',
                  isOverflowActive
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                )}
              >
                <span>More</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-44 p-1">
              {overflowModules.map((module) => {
                const Icon = getModuleIcon(module.moduleCode);
                const isSelected = activeModule === module.moduleCode;
                const enabledCount = module.permissions.filter((p) =>
                  Boolean(localScopedPerms?.[p.code])
                ).length;

                return (
                  <button
                    key={module.moduleCode}
                    onClick={() => onModuleChange(module.moduleCode)}
                    className={cn(
                      'w-full text-left px-2.5 py-1.5 text-[12px] font-medium rounded-md flex items-center justify-between gap-2 transition-colors',
                      isSelected
                        ? 'bg-[var(--accent-soft)] text-[var(--accent)]'
                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Icon className="w-3.5 h-3.5" />
                      <span className="truncate">{module.displayName}</span>
                    </div>
                    {enabledCount > 0 && (
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{enabledCount}</span>
                    )}
                  </button>
                );
              })}
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}
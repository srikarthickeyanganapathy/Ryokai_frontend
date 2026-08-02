import React from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { ChevronRight } from 'lucide-react';
import { getRiskConfig, getGroupConfig } from './constants';

export function PermissionRow({
  perm,
  isEnabled,
  isActive,
  isAdmin,
  onToggle,
  onSelect,
}) {
  const risk = getRiskConfig(perm.riskLevel);
  const group = getGroupConfig(perm.group || 'GENERAL');
  const isElevated = perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH';

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(perm)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(perm);
        }
      }}
      className={cn(
        'group flex items-center gap-3 px-2.5 py-2 rounded-md cursor-pointer transition-colors select-none',
        isActive
          ? 'bg-[var(--accent-soft)] ring-1 ring-inset ring-[var(--accent)]'
          : 'hover:bg-[var(--bg-hover)]'
      )}
    >
      <div onClick={(e) => e.stopPropagation()} className="shrink-0">
        <Checkbox
          checked={isEnabled}
          disabled={isAdmin}
          onCheckedChange={() => onToggle(perm)}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span
            className={cn(
              'text-[13px] truncate',
              isEnabled
                ? 'font-medium text-[var(--text-primary)]'
                : 'font-normal text-[var(--text-muted)]'
            )}
          >
            {perm.name}
          </span>
          {isElevated && (
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: risk.dot }}
              title={`${risk.label} risk`}
            />
          )}
        </div>
        {perm.description && (
          <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight mt-0.5">
            {perm.description}
          </p>
        )}
      </div>

      <span
        className="hidden sm:inline text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0"
        style={{ backgroundColor: group.bg, color: group.text }}
      >
        {group.label}
      </span>

      <ChevronRight
        className={cn(
          'w-3.5 h-3.5 shrink-0 transition-opacity',
          isActive ? 'text-[var(--accent)] opacity-100' : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100'
        )}
      />
    </div>
  );
}
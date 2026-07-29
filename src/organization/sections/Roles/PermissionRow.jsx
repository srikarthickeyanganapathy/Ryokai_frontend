import React from 'react';
import { Checkbox } from '@/shared/ui/Checkbox';
import { cn } from '@/shared/lib/cn';
import { ChevronRight, Check } from 'lucide-react';
import { getRiskConfig } from './constants';

const GROUP_COLORS = {
  READ: { text: '#30A46C', bg: '#ECFDF3', label: 'Read' },
  WORKFLOW: { text: '#5E6AD2', bg: '#F0F2FF', label: 'Workflow' },
  WRITE: { text: '#F5A623', bg: '#FEF6E7', label: 'Write' },
  ADMINISTRATION: { text: '#E5484D', bg: '#FFF0F0', label: 'Admin' },
  GENERAL: { text: '#6E6E73', bg: '#F4F4F5', label: 'General' },
};

export function PermissionRow({
  perm,
  isEnabled,
  isActive,
  isAdmin,
  onToggle,
  onSelect,
}) {
  const risk = getRiskConfig(perm.riskLevel);
  const groupStyle = GROUP_COLORS[perm.group || 'GENERAL'] || GROUP_COLORS.GENERAL;

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
        'group relative flex items-center justify-between gap-3 px-3 py-1.5 min-h-[42px] cursor-pointer transition-all duration-120 rounded-md border text-left border-l-2 select-none',
        isActive
          ? 'bg-[var(--accent-soft)]/60 border-[var(--accent)] text-[var(--accent)] shadow-2xs'
          : isEnabled
          ? 'border-transparent hover:bg-[var(--bg-hover)]'
          : 'border-transparent opacity-75 hover:opacity-100 hover:bg-[var(--bg-hover)]'
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div onClick={(e) => e.stopPropagation()} className="shrink-0 flex items-center">
          <Checkbox
            checked={isEnabled}
            disabled={isAdmin}
            onCheckedChange={() => onToggle(perm)}
          />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'text-[13px] font-semibold truncate transition-colors',
                isEnabled
                  ? 'text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] font-medium'
              )}
            >
              {perm.name}
            </span>
          </div>
          {perm.description && (
            <p className="text-[11px] text-[var(--text-muted)] truncate leading-tight font-normal">
              {perm.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {/* Semantic Group Badge */}
        <span
          className="text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider"
          style={{ backgroundColor: groupStyle.bg, color: groupStyle.text }}
        >
          {groupStyle.label}
        </span>

        {/* Enabled / Disabled status badge */}
        {isEnabled ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#30A46C] bg-[#ECFDF3] px-1.5 py-0.5 rounded">
            <Check className="w-2.5 h-2.5" />
            <span>Enabled</span>
          </span>
        ) : (
          <span className="text-[10px] font-medium text-[var(--text-muted)] bg-[var(--bg-subtle)] px-1.5 py-0.5 rounded">
            Disabled
          </span>
        )}

        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 transition-transform duration-120',
            isActive
              ? 'text-[var(--accent)] translate-x-0.5'
              : 'text-[var(--text-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5'
          )}
        />
      </div>
    </div>
  );
}

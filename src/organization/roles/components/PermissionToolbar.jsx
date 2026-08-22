import React from 'react';
import { Button } from '@/shared/ui/Button';
import { SearchInput } from '@/shared/ui/SearchInput';
import { MoreHorizontal, RotateCcw, ShieldAlert, ListPlus, ListMinus, Eye, Pencil, Sliders, KeyRound, X } from '@/shared/ui/Icons';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';
import { cn } from '@/shared/lib/cn';
import { LEVEL_TIERS } from '../entities/constants';

const LEVEL_ICONS = { Eye, Pencil, Sliders, KeyRound };
const LEVEL_TONES = [
  { active: 'bg-[var(--success-soft)] border-[var(--success)] text-[var(--success)]' },
  { active: 'bg-[var(--accent-soft)] border-[var(--accent)] text-[var(--accent)]' },
  { active: 'bg-[var(--warning-soft)] border-[var(--warning)] text-[var(--warning)]' },
  { active: 'bg-[var(--danger-soft)] border-[var(--danger)] text-[var(--danger)]' },
];

export function PermissionToolbar({ searchQuery, onSearchChange, riskFilter = 'ALL', onRiskFilterChange, isAdmin, onEnableAll, onDisableAll, onReset, level = { cov: 0, max: 0, exact: false }, onSetLevel }) {
  return (
    <div className="shrink-0 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border-subtle)]">
      {/* Access level bar */}
      <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-2">
        <span className="text-[9.5px] font-semibold text-[var(--text-muted)] uppercase tracking-wider mr-1 shrink-0">Level</span>
        {LEVEL_TIERS.map((t) => {
          const Icon = LEVEL_ICONS[t.icon];
          const on = level.exact && level.max === t.lvl;
          return (
            <button
              key={t.lvl}
              disabled={isAdmin}
              onClick={() => onSetLevel(t.lvl)}
              title={`${t.name} — enables ${t.groups.join(', ').toLowerCase()} permissions`}
              className={cn('flex-1 h-8 rounded-md border text-[10.5px] font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50', on ? LEVEL_TONES[t.lvl - 1].active : 'border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]')}
            >
              <Icon className="w-3 h-3" />
              {t.name}
            </button>
          );
        })}
        <button
          disabled={isAdmin}
          onClick={() => onSetLevel(0)}
          title="Remove all access in this module"
          className="w-7 h-7 rounded-md border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-muted)] flex items-center justify-center transition-colors hover:text-[var(--danger)] hover:border-[var(--danger)] disabled:opacity-50 shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
        <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-wider ml-1 shrink-0 hidden md:inline">
          {level.exact && level.max > 0 ? `Level ${LEVEL_TIERS[level.max - 1].name}` : level.max > 0 ? 'Custom mix' : 'No access'}
        </span>
      </div>

      {/* Search + filters (unchanged) */}
      <div className="flex items-center gap-2 px-3.5 py-2.5">
        <div className="flex-1 max-w-xs">
          <SearchInput value={searchQuery} onChange={onSearchChange} placeholder="Search permissions..." debounceMs={0} />
        </div>
        <Button variant={riskFilter === 'ELEVATED' ? 'danger' : 'outline'} size="sm" className="rounded-full text-[11px]" onClick={() => onRiskFilterChange(riskFilter === 'ELEVATED' ? 'ALL' : 'ELEVATED')} title="Show only Critical/High risk permissions">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Elevated only</span>
        </Button>
        <div className="flex-1" />
        {!isAdmin && (
          <DropdownMenu
            trigger={
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            }
            items={[
              { label: 'Enable All', icon: ListPlus, onClick: onEnableAll },
              { label: 'Disable All', icon: ListMinus, onClick: onDisableAll },
              { label: 'Reset module', icon: RotateCcw, onClick: onReset, separator: 'before' },
            ]}
          />
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Button } from '@/shared/ui/Button';
import { SearchInput } from '@/shared/ui/SearchInput';
import { MoreHorizontal, RotateCcw, ShieldAlert, ListPlus, ListMinus } from '@/shared/ui/Icons';
import { DropdownMenu } from '@/shared/ui/DropdownMenu';

export function PermissionToolbar({ searchQuery, onSearchChange, riskFilter = 'ALL', onRiskFilterChange, isAdmin, onEnableAll, onDisableAll, onReset }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card)]/80 backdrop-blur-md">
      <div className="flex-1 max-w-xs">
        <SearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search permissions..."
          debounceMs={0}
        />
      </div>
      <Button
        variant={riskFilter === 'ELEVATED' ? 'danger' : 'outline'}
        size="sm"
        className="rounded-full text-[11px]"
        onClick={() => onRiskFilterChange(riskFilter === 'ELEVATED' ? 'ALL' : 'ELEVATED')}
        title="Show only Critical/High risk permissions"
      >
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
  );
}

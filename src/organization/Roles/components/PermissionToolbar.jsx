import React from 'react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Search, MoreHorizontal, RotateCcw, ShieldAlert } from '@/shared/ui/Icons';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { cn } from '@/shared/lib/cn';

export function PermissionToolbar({ searchQuery, onSearchChange, riskFilter = 'ALL', onRiskFilterChange, isAdmin, onEnableAll, onDisableAll, onReset }) {
  return (
    <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-card)]/80 backdrop-blur-md">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input value={searchQuery} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search permissions..." className="pl-8 h-7 text-[12px] rounded-md border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 focus:bg-[var(--bg-card)] transition-colors" />
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
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><MoreHorizontal className="w-4 h-4" /></Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={onEnableAll}>Enable All</Button>
            <Button variant="ghost" size="sm" className="w-full justify-start text-[12px]" onClick={onDisableAll}>Disable All</Button>
            <div className="my-1 h-px bg-[var(--border-subtle)]" />
            <Button variant="ghost" size="sm" className="w-full justify-between text-[12px]" onClick={onReset}><span>Reset module</span><RotateCcw className="w-3 h-3" /></Button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}


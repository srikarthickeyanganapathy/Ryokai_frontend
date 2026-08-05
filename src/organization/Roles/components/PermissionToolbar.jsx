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
      <button onClick={() => onRiskFilterChange(riskFilter === 'ELEVATED' ? 'ALL' : 'ELEVATED')} className={cn('flex items-center gap-1.5 h-7 px-2.5 rounded-full text-[11px] font-medium transition-colors shrink-0 border', riskFilter === 'ELEVATED' ? 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger-border,transparent)]' : 'text-[var(--text-muted)] border-[var(--border-subtle)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-secondary)]')} title="Show only Critical/High risk permissions">
        <ShieldAlert className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Elevated only</span>
      </button>
      <div className="flex-1" />
      {!isAdmin && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><MoreHorizontal className="w-4 h-4" /></Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <button onClick={onEnableAll} className="w-full text-left px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors">Enable All</button>
            <button onClick={onDisableAll} className="w-full text-left px-2.5 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors">Disable All</button>
            <div className="my-1 h-px bg-[var(--border-subtle)]" />
            <button onClick={onReset} className="w-full text-left px-2.5 py-1.5 text-[12px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-md flex items-center justify-between transition-colors"><span>Reset module</span><RotateCcw className="w-3 h-3" /></button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}


import React from 'react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Search, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';

export function PermissionToolbar({
  searchQuery,
  onSearchChange,
  isAdmin,
  onEnableAll,
  onDisableAll,
  onReset,
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-[var(--border-subtle)]">
      <div className="relative flex-1 max-w-xs">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search permissions..."
          className="pl-8 h-7 text-[12px] rounded-md border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40"
        />
      </div>

      {!isAdmin && (
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-40 p-1">
            <button
              onClick={onEnableAll}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              Enable All
            </button>
            <button
              onClick={onDisableAll}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
            >
              Disable All
            </button>
            <div className="my-1 h-px bg-[var(--border-subtle)]" />
            <button
              onClick={onReset}
              className="w-full text-left px-3 py-1.5 text-[12px] text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-md flex items-center justify-between transition-colors"
            >
              <span>Reset module</span>
              <RotateCcw className="w-3 h-3" />
            </button>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
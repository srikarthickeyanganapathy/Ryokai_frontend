import React, { useMemo } from 'react';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Search, MoreHorizontal, RotateCcw } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';

function AnalyticsChips({ localScopedPerms, permissionMap }) {
  const stats = useMemo(() => {
    let read = 0,
      write = 0,
      workflow = 0,
      critical = 0;
    Object.keys(localScopedPerms).forEach((code) => {
      const perm = permissionMap.get(code);
      if (!perm) return;
      const g = perm.group || 'GENERAL';
      if (g === 'READ') read++;
      else if (g === 'WRITE') write++;
      else if (g === 'WORKFLOW') workflow++;
      if (perm.riskLevel === 'CRITICAL' || perm.riskLevel === 'HIGH') critical++;
    });
    return {
      enabled: Object.keys(localScopedPerms).length,
      read,
      write,
      workflow,
      critical,
    };
  }, [localScopedPerms, permissionMap]);

  return (
    <div className="flex items-center gap-1.5 flex-wrap px-4 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/40 text-xs">
      <Chip>{stats.enabled} Enabled</Chip>
      <ChipDot />
      <Chip color="var(--accent)">{stats.read} Read</Chip>
      <ChipDot />
      <Chip color="#F5A623">{stats.write} Write</Chip>
      <ChipDot />
      <Chip color="#30A46C">{stats.workflow} Workflow</Chip>
      {stats.critical > 0 && (
        <>
          <ChipDot />
          <Chip color="#E5484D">{stats.critical} Critical</Chip>
        </>
      )}
    </div>
  );
}

function Chip({ children, color }) {
  return (
    <span
      className="text-[11px] font-medium px-1.5 py-0.5 rounded-md"
      style={
        color
          ? { color, backgroundColor: `${color}15` }
          : { color: 'var(--text-muted)' }
      }
    >
      {children}
    </span>
  );
}

function ChipDot() {
  return <span className="text-[var(--border-subtle)] text-[10px]">·</span>;
}

export function PermissionToolbar({
  searchQuery,
  onSearchChange,
  isAdmin,
  onEnableAll,
  onDisableAll,
  onReset,
  localScopedPerms,
  permissionMap,
}) {
  return (
    <div className="flex flex-col">
      <AnalyticsChips
        localScopedPerms={localScopedPerms}
        permissionMap={permissionMap}
      />

      <div className="flex items-center gap-2 px-4 py-2 border-b border-[var(--border-subtle)]">
        <div className="relative flex-1 max-w-xs">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search permissions..."
            className="pl-8 h-7 text-xs rounded-md border-[var(--border-subtle)]"
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
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
              >
                Enable All
              </button>
              <button
                onClick={onDisableAll}
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md transition-colors"
              >
                Disable All
              </button>
              <div className="my-1 h-px bg-[var(--border-subtle)]" />
              <button
                onClick={onReset}
                className="w-full text-left px-3 py-1.5 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-hover)] rounded-md flex items-center justify-between transition-colors"
              >
                <span>Reset module</span>
                <RotateCcw className="w-3 h-3" />
              </button>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
}

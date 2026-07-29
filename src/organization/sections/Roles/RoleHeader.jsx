import React, { useMemo } from 'react';
import { Badge } from '@/shared/ui/Badge';
import { Button } from '@/shared/ui/Button';
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover';
import { MoreHorizontal, Copy, Trash2, CheckCircle2, ShieldAlert } from 'lucide-react';

export function RoleHeader({
  role,
  isAdmin,
  permissionCount,
  isDirty,
  changeCount,
  supervisionNames,
  onDiscard,
  onSave,
  onReview,
  onClone,
  onDelete,
  permissionMap,
  localScopedPerms,
}) {
  if (!role) return null;

  const criticalCount = useMemo(() => {
    if (!permissionMap || !localScopedPerms) return 0;
    let count = 0;
    Object.keys(localScopedPerms).forEach((code) => {
      const p = permissionMap.get(code);
      if (p && (p.riskLevel === 'CRITICAL' || p.riskLevel === 'HIGH')) {
        count++;
      }
    });
    return count;
  }, [permissionMap, localScopedPerms]);

  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-card)]">
      {/* Left — rich role metrics */}
      <div className="min-w-0">
        <div className="flex items-center gap-3 mb-1">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
            {role.name}
          </h2>
          {isAdmin && (
            <Badge variant="warning" className="text-[10px] uppercase font-bold shrink-0">
              System Built-in
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-xs flex-wrap">
          <MetricChip label="Priority" value={role.priority ?? 0} />
          <MetricChip label="Permissions" value={permissionCount} />
          {criticalCount > 0 && (
            <MetricChip
              label="Critical"
              value={criticalCount}
              color="#E5484D"
              icon={ShieldAlert}
            />
          )}
          {supervisionNames.length > 0 && (
            <div className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 pl-1">
              <span>Can manage:</span>
              <strong className="text-[var(--text-secondary)] font-medium">
                {supervisionNames.join(', ')}
              </strong>
            </div>
          )}
        </div>
      </div>

      {/* Right — Actions & Save Bar */}
      <div className="flex items-center gap-2.5 shrink-0">
        {!isAdmin && (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-38 p-1">
              <button
                onClick={onClone}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] rounded-md flex items-center gap-2 transition-colors"
              >
                <Copy className="w-3.5 h-3.5" /> Clone Role
              </button>
              <div className="my-1 h-px bg-[var(--border-subtle)]" />
              <button
                onClick={onDelete}
                className="w-full text-left px-2.5 py-1.5 text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] rounded-md flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete Role
              </button>
            </PopoverContent>
          </Popover>
        )}

        {!isAdmin && (
          <div className="flex items-center gap-2">
            {isDirty ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onReview}
                  className="h-8 text-xs px-3"
                >
                  Review
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDiscard}
                  className="h-8 text-xs text-[var(--text-muted)] px-3"
                >
                  Discard
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onSave}
                  className="h-8 text-xs px-4 font-semibold shadow-xs"
                >
                  Save Changes ({changeCount})
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] bg-[var(--bg-subtle)] px-3 py-1.5 rounded-md border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#30A46C]" />
                <span className="font-medium text-[var(--text-secondary)]">Saved</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MetricChip({ label, value, color, icon: Icon }) {
  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px] font-mono text-[var(--text-secondary)]">
      {Icon && <Icon className="w-3 h-3" style={color ? { color } : undefined} />}
      <span className="text-[var(--text-muted)] font-sans">{label}:</span>
      <strong style={color ? { color } : undefined}>{value}</strong>
    </div>
  );
}

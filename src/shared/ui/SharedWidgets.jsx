import React from 'react'
import { Button } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { Progress } from '@/shared/ui/Progress'
import { LockIcon } from '@/shared/ui/Icons/custom'

/**
 * SharedWidgets -- Common stat & permission components used across org and crew domains.
 * Previously duplicated in organization/teams/components/Shared.jsx and crew/components/CrewShared.jsx.
 */

export function ProgressBar({ value, max, className }) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return <Progress value={pct} className={className} />
}

export function PermissionButton({
  allowed, reason, onClick, children,
  variant = 'outline', size = 'sm', className, icon: Icon,
}) {
  if (!allowed) {
    return (
      <Button type="button" variant="outline" size={size} disabled title={reason}
        className={cn('opacity-50 cursor-not-allowed gap-1.5 text-[12px] h-8', className)}>
        <LockIcon className="w-3 h-3" /> {children}
      </Button>
    )
  }
  return (
    <Button type="button" variant={variant} size={size} onClick={onClick}
      className={cn('gap-1.5 text-[12px] h-8 shadow-sm', className)}>
      {Icon && <Icon className="w-3 h-3" />} {children}
    </Button>
  )
}

export function SummaryStat({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-lg bg-[var(--bg-subtle)]/50 p-4 border border-[var(--border-subtle)]">
      <div className="flex items-center gap-1.5 mb-2">
        {Icon && (
          <Icon className={cn('w-3.5 h-3.5',
            accent === 'success' ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]')} />
        )}
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold">{label}</span>
      </div>
      <div className="text-xl font-bold tabular-nums text-[var(--text-primary)] tracking-tight">{value}</div>
    </div>
  )
}

export function AnalyticsStat({ label, value, tone }) {
  return (
    <div className="rounded-lg bg-[var(--bg-subtle)]/50 p-4 border border-[var(--border-subtle)]">
      <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">{label}</div>
      <div className={cn('text-lg font-bold tabular-nums tracking-tight',
        tone === 'warning' ? 'text-[var(--warning)]' : 'text-[var(--text-primary)]')}>{value}</div>
    </div>
  )
}

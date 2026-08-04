import React, { forwardRef } from 'react'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/Tooltip'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'

function resolveCrewHealthTier({ completionRate = 0, crewTasks = [], status }) {
  if (status === 'initializing' || status === 'loading') {
    return {
      tier: 'initializing',
      label: 'Syncing',
      description: 'Crew telemetry & metrics synchronizing...',
      badgeClass: 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)] border-[var(--border-subtle)]',
      dotClass: 'bg-[var(--text-tertiary)] animate-pulse',
      icon: Icons.refresh,
    }
  }

  const rate = typeof completionRate === 'number' ? completionRate : 0
  const totalTasks = Array.isArray(crewTasks) ? crewTasks.length : 0
  const completedTasks = Array.isArray(crewTasks)
    ? crewTasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'DONE').length
    : Math.round((rate / 100) * totalTasks)

  if (status === 'optimal' || rate >= 85) {
    return {
      tier: 'optimal',
      label: 'Optimal Health',
      description: `High velocity! ${completedTasks}/${totalTasks || 0} tasks finished (${rate}% complete).`,
      badgeClass: 'bg-[var(--success-soft)] text-[var(--success)] border-transparent',
      dotClass: 'bg-[var(--success)]',
      icon: Icons.checkCircle,
    }
  }

  if (status === 'healthy' || status === 'on_track' || rate >= 60) {
    return {
      tier: 'healthy',
      label: 'On Track',
      description: `Steady momentum. ${completedTasks}/${totalTasks || 0} tasks finished (${rate}% complete).`,
      badgeClass: 'bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)]',
      dotClass: 'bg-[var(--accent)]',
      icon: Icons.trendingUp,
    }
  }

  if (status === 'steady' || rate >= 40) {
    return {
      tier: 'steady',
      label: 'Steady',
      description: `Normal activity level. ${completedTasks}/${totalTasks || 0} tasks finished (${rate}% complete).`,
      badgeClass: 'bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
      dotClass: 'bg-[var(--text-secondary)]',
      icon: Icons.activity,
    }
  }

  if (status === 'at_risk' || rate >= 20) {
    return {
      tier: 'at_risk',
      label: 'Needs Attention',
      description: `Task backlog accumulating. ${rate}% tasks completed.`,
      badgeClass: 'bg-[var(--warning-soft)] text-[var(--warning)] border border-transparent',
      dotClass: 'bg-[var(--warning)] animate-pulse',
      icon: Icons.alertCircle,
    }
  }

  if (status === 'critical' || (totalTasks > 0 && rate < 20)) {
    return {
      tier: 'critical',
      label: 'Critical Delay',
      description: `Critical task delay detected. Only ${rate}% complete.`,
      badgeClass: 'bg-[var(--danger-soft)] text-[var(--danger)] border border-transparent',
      dotClass: 'bg-[var(--danger)] animate-pulse',
      icon: Icons.shieldAlert,
    }
  }

  return {
    tier: 'empty',
    label: 'No Activity',
    description: 'No active tasks logged for this crew yet.',
    badgeClass: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)]',
    dotClass: 'bg-[var(--text-tertiary)]',
    icon: Icons.info,
  }
}

export const CrewStatusPill = forwardRef(({ completionRate = 0, crewTasks = [], members = [], status, size = 'md', interactive = true, className }, ref) => {
  const healthInfo = resolveCrewHealthTier({ completionRate, crewTasks, status })
  const IconComp = healthInfo.icon

  const pillSizes = {
    sm: 'px-2 py-0.5 text-[10px] gap-1.5',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-3 py-1.5 text-xs gap-2',
  }

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }

  const pillContent = (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-[var(--duration-base)] ease-[var(--ease-out)] select-none',
        healthInfo.badgeClass,
        pillSizes[size],
        interactive && 'hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer',
        className
      )}
      tabIndex={interactive ? 0 : undefined}
      role={interactive ? 'button' : 'status'}
      aria-label={`Crew Health: ${healthInfo.label}`}
    >
      <span className={cn('rounded-full shrink-0 h-1.5 w-1.5', healthInfo.dotClass)} />
      {IconComp && <IconComp className={cn('shrink-0', iconSizes[size])} />}
      <span className="font-semibold tracking-tight whitespace-nowrap">{healthInfo.label}</span>
      <span className="font-mono text-[10px] opacity-80 pl-0.5 border-l border-current/20">
        {Math.round(completionRate)}%
      </span>
    </div>
  )

  if (!interactive) return pillContent

  const totalTasks = Array.isArray(crewTasks) ? crewTasks.length : 0
  const completedTasks = Array.isArray(crewTasks)
    ? crewTasks.filter(t => t.completed || t.status === 'COMPLETED' || t.status === 'DONE').length
    : Math.round((completionRate / 100) * totalTasks)

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{pillContent}</TooltipTrigger>
        <TooltipContent side="top" className="flex flex-col gap-2 p-2.5 min-w-[200px] max-w-[260px]">
          <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5">
            <span className="font-semibold text-[12px] text-[var(--text-primary)]">Crew Health Metrics</span>
            <span className="text-[10px] font-mono font-bold text-[var(--accent)]">{healthInfo.label}</span>
          </div>

          <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
            {healthInfo.description}
          </p>

          <div className="space-y-1">
            <div className="flex justify-between text-[10px] text-[var(--text-secondary)] font-mono">
              <span>Task Progress</span>
              <span>{completedTasks} / {totalTasks} ({Math.round(completionRate)}%)</span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-[var(--bg-subtle)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--accent)] transition-all duration-[var(--duration-slow)]"
                style={{ width: `${Math.min(100, Math.max(0, completionRate))}%` }}
              />
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
CrewStatusPill.displayName = 'CrewStatusPill'

import React, { forwardRef } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/shared/ui/Avatar'
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from '@/shared/ui/Tooltip'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'

const STATUS_CONFIG = {
  online: {
    label: 'Online',
    colorClass: 'bg-[var(--success)]',
    ringClass: 'ring-[var(--success-soft)] border-[var(--success)]',
    pulse: true,
  },
  idle: {
    label: 'Idle',
    colorClass: 'bg-[var(--warning)]',
    ringClass: 'ring-[var(--warning-soft)] border-[var(--warning)]',
    pulse: false,
  },
  busy: {
    label: 'Busy',
    colorClass: 'bg-[var(--danger)]',
    ringClass: 'ring-[var(--danger-soft)] border-[var(--danger)]',
    pulse: false,
  },
  offline: {
    label: 'Offline',
    colorClass: 'bg-[var(--text-tertiary)]',
    ringClass: 'ring-[var(--bg-subtle)] border-[var(--border-strong)]',
    pulse: false,
  },
}

function getInitials(name = '') {
  if (!name) return '?'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

function resolveStatus(member) {
  if (!member) return STATUS_CONFIG.offline
  if (typeof member.status === 'string' && STATUS_CONFIG[member.status.toLowerCase()]) {
    return STATUS_CONFIG[member.status.toLowerCase()]
  }
  if (member.isOnline || member.online || member.status === 'online') {
    return STATUS_CONFIG.online
  }
  return STATUS_CONFIG.offline
}

export const MemberAvatarHalo = forwardRef(({ member, size = 'sm', className, showTooltip = true }, ref) => {
  const statusInfo = resolveStatus(member)
  const name = member?.name || member?.username || member?.email || 'Crew Member'
  const initials = getInitials(name)
  const role = member?.role || member?.title || 'Member'
  const statusMsg = member?.statusMessage || member?.activity || statusInfo.label

  const avatarSizes = {
    xs: 'h-6 w-6 text-[10px]',
    sm: 'h-8 w-8 text-xs',
    md: 'h-10 w-10 text-sm',
    lg: 'h-12 w-12 text-base',
  }

  const dotSizes = {
    xs: 'h-2 w-2 bottom-0 right-0 border',
    sm: 'h-2.5 w-2.5 bottom-0 right-0 border-2',
    md: 'h-3 w-3 bottom-0.5 right-0.5 border-2',
    lg: 'h-3.5 w-3.5 bottom-0.5 right-0.5 border-2',
  }

  const avatarContent = (
    <div
      ref={ref}
      className={cn(
        'relative inline-flex items-center justify-center shrink-0 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-out)] hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]',
        className
      )}
      tabIndex={0}
      role="img"
      aria-label={`${name} (${statusInfo.label})`}
    >
      {/* Dynamic presence halo ring around avatar */}
      <div
        className={cn(
          'absolute -inset-0.5 rounded-full transition-all duration-[var(--duration-base)] border opacity-90',
          statusInfo.ringClass,
          statusInfo.pulse && 'animate-pulse'
        )}
      />
      <Avatar size={size} className={cn('relative z-10 border-[var(--bg-card)]', avatarSizes[size])}>
        {member?.avatar && <AvatarImage src={member.avatar} alt={name} />}
        <AvatarFallback className="bg-[var(--bg-subtle)] text-[var(--text-primary)] font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>

      {/* Status dot */}
      <span
        className={cn(
          'absolute z-20 rounded-full border-[var(--bg-card)] shadow-xs transition-colors duration-[var(--duration-fast)]',
          statusInfo.colorClass,
          dotSizes[size]
        )}
      />
    </div>
  )

  if (!showTooltip) return avatarContent

  return (
    <TooltipProvider>
      <Tooltip delayDuration={150}>
        <TooltipTrigger asChild>{avatarContent}</TooltipTrigger>
        <TooltipContent side="top" className="flex flex-col gap-1 p-2 min-w-[140px] max-w-[220px]">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-[var(--text-primary)] truncate text-[12px]">{name}</span>
            <Badge variant="outline" className="text-[9px] px-1 py-0 uppercase tracking-wider font-mono">
              {role}
            </Badge>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-secondary)]">
            <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', statusInfo.colorClass)} />
            <span className="truncate">{statusMsg}</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
})
MemberAvatarHalo.displayName = 'MemberAvatarHalo'

export const PresenceHalo = forwardRef(({ members = [], member, maxDisplay = 5, size = 'sm', showTooltip = true, className }, ref) => {
  const memberList = member ? [member] : Array.isArray(members) ? members : []

  if (memberList.length === 0) {
    return (
      <div ref={ref} className={cn('inline-flex items-center text-[12px] text-[var(--text-muted)] italic', className)}>
        No active members
      </div>
    )
  }

  const displayedMembers = memberList.slice(0, maxDisplay)
  const overflowCount = memberList.length - maxDisplay
  const overflowMembers = overflowCount > 0 ? memberList.slice(maxDisplay) : []

  return (
    <div ref={ref} className={cn('inline-flex items-center -space-x-2 overflow-visible', className)}>
      {displayedMembers.map((m, idx) => (
        <div key={m.id || m.email || idx} className="relative transition-all duration-[var(--duration-fast)] hover:z-30 focus-within:z-30">
          <MemberAvatarHalo member={m} size={size} showTooltip={showTooltip} />
        </div>
      ))}

      {overflowCount > 0 && (
        <TooltipProvider>
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <div
                className={cn(
                  'relative z-20 flex shrink-0 items-center justify-center rounded-full border-2 border-[var(--bg-card)] bg-[var(--bg-hover)] text-[var(--text-secondary)] font-semibold text-[11px] hover:bg-[var(--bg-hover-strong)] cursor-pointer transition-transform duration-[var(--duration-fast)] hover:scale-105',
                  size === 'xs' && 'h-6 w-6 text-[9px]',
                  size === 'sm' && 'h-8 w-8 text-[11px]',
                  size === 'md' && 'h-10 w-10 text-[12px]',
                  size === 'lg' && 'h-12 w-12 text-[14px]'
                )}
                tabIndex={0}
                role="button"
                aria-label={`${overflowCount} more members`}
              >
                +{overflowCount}
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="p-2 max-w-[200px] flex flex-col gap-1">
              <span className="text-[11px] font-semibold text-[var(--text-primary)]">
                +{overflowCount} More Member{overflowCount > 1 ? 's' : ''}:
              </span>
              <ul className="text-[11px] text-[var(--text-secondary)] space-y-0.5 max-h-[120px] overflow-y-auto">
                {overflowMembers.map((om, i) => (
                  <li key={om.id || i} className="truncate">
                    • {om.name || om.email || 'Crew Member'}
                  </li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  )
})
PresenceHalo.displayName = 'PresenceHalo'

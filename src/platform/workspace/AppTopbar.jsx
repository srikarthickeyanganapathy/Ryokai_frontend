import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { DropdownMenu } from '@/shared/ui/DropdownMenu'
import { Skeleton } from '@/shared/ui/Skeleton'
import { RyokaiLogo } from '@/shared/ui/Logo/RyokaiLogo'
import { useAuth } from '@/identity'
import { useTheme } from '@/app/providers/ThemeProvider'
import {
  useUnreadCount,
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/platform/notifications'
import { useAcceptInvite, useDeclineInvite } from '@/organization'
import { cn } from '@/shared/lib/cn'
import { Play, CheckCircle2, XCircle } from '@/shared/ui/Icons'
import { CommandMenu } from '../command-palette'
import { LensStatusIndicator } from '@/shared/ui/LensStatusIndicator'
import { useRealtime } from '@/app/providers/RealTimeProvider'
import { useActiveFocus } from './useActiveFocus'

function FocusTimerIndicator() {
  const { data: focusData, isLoading } = useActiveFocus()

  if (isLoading || !focusData?.isActive) return null

  return (
    <div
      title="Focus session running"
      className="flex items-center h-7 gap-1.5 bg-[var(--accent-soft)] text-[var(--accent)] px-2 sm:px-2.5 rounded-full text-[11px] font-semibold border border-[var(--accent-border)] transition-colors"
    >
      <Play className="w-3 h-3 fill-current" aria-hidden="true" />
      <span className="tabular-nums">{focusData.timeRemaining || '24:59'}</span>
    </div>
  )
}

function SyncStatusIndicator() {
  const { connected } = useRealtime()

  return (
    <div
      title={connected
        ? 'Connected — live updates enabled'
        : 'Offline — reconnecting… updates may be delayed'}
      role="status"
      aria-label={connected ? 'Online' : 'Offline'}
      className={cn(
        'flex items-center h-7 px-1.5 sm:px-2.5 rounded-full border text-[11px] font-medium transition-colors',
        connected
          ? 'border-[var(--success)]/30 bg-[var(--success-soft)] text-[var(--success)]'
          : 'border-[var(--warning)]/30 bg-[var(--warning-soft)] text-[var(--warning)]'
      )}
    >
      {connected
        ? <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] shrink-0" aria-hidden="true" />
        : <Icons.wifiOff className="w-3 h-3 shrink-0" aria-hidden="true" />}
      <span className="hidden sm:inline ml-1.5">{connected ? 'Online' : 'Offline'}</span>
    </div>
  )
}

const typeIcons = {
  TASK_IN_PROGRESS: Icons.tasks,
  TASK_COMPLETED: Icons.check,
  TASK_COMMENT: Icons.tasks,
  TASK_UPDATED: Icons.settings,
  REMINDER: Icons.alert,
  MENTION: Icons.user,
  SYSTEM: Icons.workspace,
  ORG_INVITE_RECEIVED: Icons.users,
}

function TopbarDivider() {
  return <div className="hidden sm:block h-5 w-px bg-[var(--border-subtle)] mx-0.5" aria-hidden="true" />
}

export function AppTopbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [inviteDecisions, setInviteDecisions] = useState({}) // notifId → 'accepted' | 'declined'
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notifications = [], isLoading: notifLoading } = useNotificationList({ size: 20 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const unread = typeof unreadCount === 'number' ? unreadCount : 0

  return (
    <header className="h-12 flex items-center px-3 sm:px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)]/70 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-10 shadow-[var(--inset-highlight-soft)]">

      <div className="flex-1 flex justify-center min-w-0 px-2 sm:px-4">
        <div className="w-full max-w-xl min-w-0">
          <CommandMenu />
        </div>
      </div>

      {/* RIGHT — status context → divider → actions */}
      <div className="flex items-center gap-1 shrink-0 min-w-0">

        <LensStatusIndicator />
        <SyncStatusIndicator />
        <FocusTimerIndicator />

        <TopbarDivider />

        {/* Quick Actions */}
        <DropdownMenu
          trigger={<IconButton variant="ghost" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors" title="Quick Actions" aria-label="Quick actions"><Icons.plus className="w-5 h-5" /></IconButton>}
          items={[
            { label: 'Create Task', icon: Icons.listTodo, onClick: () => navigate('/app/tasks') },
            { label: 'Create Project', icon: Icons.folderClosed, onClick: () => navigate('/app/projects') },
            { label: 'Capture Idea', icon: Icons.pencil, onClick: () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true, ctrlKey: true, bubbles: true })) },
            { label: 'Invite User', icon: Icons.userPlus, onClick: () => navigate('/app/organizations'), separator: 'before' },
          ]}
        />

        {/* Theme Toggle */}
        <IconButton
          variant="ghost"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
          title="Toggle theme"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Icons.sun className="w-5 h-5" /> : <Icons.moon className="w-5 h-5" />}
        </IconButton>

        {/* Notification Bell */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <div>
              <IconButton
                variant="ghost"
                className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                title="Notifications"
                aria-label={`Notifications${unread > 0 ? `, ${unread} unread` : ''}`}
              >
                <Icons.bell className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[16px] flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-[9px] font-semibold leading-none px-1 border-2 border-[var(--bg-base)] shadow-[0_0_8px_var(--accent)]">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </IconButton>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-[min(20rem,calc(100vw-1.5rem))] p-0 max-h-[420px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <Heading level={4} className="text-[13px]">Notifications</Heading>
              {unread > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-[11px]"
                  onClick={() => markAllRead.mutate()}
                  isLoading={markAllRead.isPending}
                >
                  Mark all read
                </Button>
              )}
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto">
              {notifLoading && (
                <div className="p-4 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-1.5">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!notifLoading && notifications.length === 0 && (
                <div className="py-12 text-center">
                  <Text variant="muted" size="sm">No notifications yet</Text>
                </div>
              )}

              {!notifLoading && notifications.slice(0, 5).map((n) => {
                const IconComponent = typeIcons[n.type] || Icons.alert
                const isRead = n.isRead !== false
                const isInvite = n.type === 'ORG_INVITE_RECEIVED' && n.deduplicationKey
                const inviteId = isInvite ? n.deduplicationKey.replace('org-invite:', '') : null
                const decision = inviteDecisions[n.id]
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)] cursor-pointer group',
                      !isRead && 'bg-[var(--accent-soft)]',
                      'hover:bg-[var(--bg-hover)]'
                    )}
                    onClick={() => {
                      if (!isRead) markRead.mutate(n.id)
                      setNotifOpen(false)
                    }}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                      !isRead ? 'bg-[var(--accent-soft)] text-[var(--accent)]' : 'bg-[var(--bg-subtle)] text-[var(--text-tertiary)]'
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Text className="text-sm font-medium leading-snug line-clamp-2">
                          {n.title}
                        </Text>
                        <IconButton
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 shrink-0 transition-all"
                          title="Dismiss"
                          aria-label="Dismiss notification"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification.mutate(n.id)
                          }}
                        >
                          <Icons.x className="w-3.5 h-3.5" />
                        </IconButton>
                      </div>
                      {n.message && (
                        <Text variant="muted" size="xs" className="line-clamp-1 mt-0.5">
                          {n.message}
                        </Text>
                      )}
                      <Text variant="muted" size="xs" className="mt-1">
                        {n.relativeTime || 'Just now'}
                      </Text>

                      {isInvite && decision === 'accepted' && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[var(--success)]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Invitation accepted
                        </div>
                      )}
                      {isInvite && decision === 'declined' && (
                        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-semibold text-[var(--text-secondary)]">
                          <XCircle className="w-3.5 h-3.5" />
                          Invitation declined
                        </div>
                      )}
                      {isInvite && !decision && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button
                            size="sm"
                            variant="primary"
                            className="h-7 text-xs px-2"
                            disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (inviteId) {
                                acceptInviteMutation.mutate(inviteId, {
                                  onSuccess: () => setInviteDecisions((prev) => ({ ...prev, [n.id]: 'accepted' })),
                                  onError: (err) => toast.error(err?.response?.data?.message || 'Failed to accept invitation'),
                                })
                              }
                            }}
                          >
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs px-2 text-[var(--text-secondary)]"
                            disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation()
                              if (inviteId) {
                                declineInviteMutation.mutate(inviteId, {
                                  onSuccess: () => setInviteDecisions((prev) => ({ ...prev, [n.id]: 'declined' })),
                                  onError: (err) => toast.error(err?.response?.data?.message || 'Failed to decline invitation'),
                                })
                              }
                            }}
                          >
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                    {!isRead && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shrink-0 mt-1.5" />
                    )}
                  </div>
                )
              })}
            </div>
            
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-1 shrink-0 min-w-0">
          <IconButton
            variant="ghost"
            className="lg:hidden -ml-1.5"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
          >
            <Icons.menu className="w-5 h-5 text-[var(--text-secondary)]" />
          </IconButton>
          <button
            type="button"
            onClick={() => navigate('/app')}
            className="flex items-center h-8 px-1 rounded-md hover:bg-[var(--bg-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] transition-colors"
            aria-label="Ryokai home"
          >
            <RyokaiLogo size="sm" />
          </button>
        </div>

      </div>

    </header>
  )
}

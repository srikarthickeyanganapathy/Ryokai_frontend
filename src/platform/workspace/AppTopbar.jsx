import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
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
import { Play } from '@/shared/ui/Icons'
import { CommandMenu } from '../command-palette'
import { LensStatusIndicator } from '@/shared/ui/LensStatusIndicator'

import { useRealtime } from '@/app/providers/RealTimeProvider'
import { useActiveFocus } from './useActiveFocus'

function FocusTimerIndicator() {
  const { data: focusData, isLoading } = useActiveFocus();
  
  if (isLoading || !focusData?.isActive) return null;

  return (
    <div className="hidden sm:flex items-center gap-2 bg-[var(--accent-soft)] text-[var(--accent)] px-3 py-1.5 rounded-full text-xs font-semibold mr-2 border border-[var(--accent-border)]">
      <Play className="w-3.5 h-3.5" />
      <span>{focusData.timeRemaining || '24:59'}</span>
    </div>
  );
}

function SyncStatusIndicator() {
  const { connected } = useRealtime();
  const syncState = connected ? 'synced' : 'offline'; 
  
  if (syncState === 'synced') return null;

  return (
    <div className="flex items-center gap-1.5 text-xs font-medium text-[var(--text-muted)] mr-2">
      {syncState === 'syncing' && <Icons.refresh className="w-3.5 h-3.5 animate-spin" />}
      {syncState === 'offline' && <Icons.wifiOff className="w-3.5 h-3.5" />}
      {syncState === 'conflict' && <Icons.alert className="w-3.5 h-3.5 text-[var(--danger)]" />}
      <span className="hidden sm:inline capitalize">{syncState}</span>
    </div>
  );
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

export function AppTopbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notifications = [], isLoading: notifLoading } = useNotificationList({ size: 20 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const unread = typeof unreadCount === 'number' ? unreadCount : 0

  return (
    <header className="h-12 flex items-center justify-between px-3 md:px-4 border-b border-[var(--color-border-subtle)] bg-[var(--bg-base)]/70 backdrop-blur-xl backdrop-saturate-150 sticky top-0 z-10 shadow-[var(--inset-highlight-soft)]">

      <div className="flex items-center gap-4 flex-1 min-w-0">
        <IconButton
          variant="ghost"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
        >
          <Icons.menu className="w-5 h-5 text-[var(--text-secondary)]" />
        </IconButton>
      </div>

      <div className="flex-1 flex justify-center px-2 sm:px-4 max-w-2xl min-w-0">
        <CommandMenu />
      </div>

      <div className="flex items-center justify-end gap-1 sm:gap-3 flex-1 min-w-0">

        <LensStatusIndicator />

        <SyncStatusIndicator />
        <FocusTimerIndicator />

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
              aria-label="Notifications"
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
          <PopoverContent align="end" className="w-80 p-0 max-h-[420px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-border-subtle)]">
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
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 border-b border-[var(--color-border-subtle)] last:border-b-0 transition-colors duration-[var(--duration-base)] ease-[var(--ease-out)] cursor-pointer group',
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
                      {n.type === 'ORG_INVITE_RECEIVED' && n.deduplicationKey && (
                        <div className="flex items-center gap-2 mt-2">
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="h-7 text-xs px-2"
                            disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                            onClick={(e) => {
                              e.stopPropagation();
                              const inviteId = n.deduplicationKey.replace('org-invite:', '');
                              if (inviteId) acceptInviteMutation.mutate(inviteId);
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
                              e.stopPropagation();
                              const inviteId = n.deduplicationKey.replace('org-invite:', '');
                              if (inviteId) declineInviteMutation.mutate(inviteId);
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

        {/* New Ryokai Gradient Logo */}
        <div className="hidden sm:block cursor-pointer ml-2" onClick={() => navigate('/app')}>
          <RyokaiLogo size="sm" />
        </div>

      </div>

    </header>
  )
}

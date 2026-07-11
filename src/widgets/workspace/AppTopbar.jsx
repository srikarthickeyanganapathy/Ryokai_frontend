import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CommandMenu } from '@/features/command-palette'
import { Icons } from '@/shared/ui/Icons'
import { IconButton, Button } from '@/shared/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar'
import { Heading, Text } from '@/shared/ui/Typography'
import { Popover, PopoverTrigger, PopoverContent } from '@/shared/ui/Popover'
import { Separator } from '@/shared/ui/Separator'
import { Skeleton } from '@/shared/ui/Skeleton'
import { useAuth } from '@/features/auth/hooks/useAuth'
import {
  useUnreadCount,
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/features/notifications/hooks/useNotifications'
import { useAcceptInvite, useDeclineInvite } from '@/features/organizations/hooks/useOrganizations'
import { cn } from '@/shared/lib/cn'

const typeIcons = {
  TASK_ASSIGNED: Icons.tasks,
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
  const navigate = useNavigate()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()
  const { data: notifications = [], isLoading: notifLoading } = useNotificationList({ size: 20 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const unread = typeof unreadCount === 'number' ? unreadCount : 0

  return (
    <header className="h-12 flex items-center justify-between px-3 md:px-4 border-b border-[var(--border-subtle)] bg-[var(--bg-base)] sticky top-0 z-10">

      <div className="flex items-center gap-4">
        <IconButton
          variant="ghost"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Icons.menu className="w-5 h-5 text-[var(--text-secondary)]" />
        </IconButton>

        <div className="hidden sm:block w-64 lg:w-72">
          <CommandMenu />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="sm:hidden">
          <IconButton variant="ghost">
            <Icons.search className="w-5 h-5" />
          </IconButton>
        </div>

        {/* Notification Bell */}
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <div>
              <IconButton
                variant="ghost"
                className="relative text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                <Icons.alert className="w-5 h-5" />
                {unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] flex items-center justify-center rounded-full bg-[var(--accent)] text-white text-[9px] font-semibold leading-none px-1 border-2 border-[var(--bg-base)]">
                    {unread > 99 ? '99+' : unread}
                  </span>
                )}
              </IconButton>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-80 p-0 max-h-[420px] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-[var(--border-subtle)]">
              <Heading level={4} className="text-[13px]">Notifications</Heading>
              {unread > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  disabled={markAllRead.isPending}
                  className="text-[11px] font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors"
                >
                  Mark all read
                </button>
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

              {!notifLoading && notifications.map((n) => {
                const IconComponent = typeIcons[n.type] || Icons.alert
                const isRead = n.isRead !== false
                return (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-3 py-2.5 border-b border-[var(--border-subtle)] last:border-b-0 transition-colors cursor-pointer group',
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
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification.mutate(n.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 p-0.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] shrink-0 transition-all"
                        >
                          <Icons.x className="w-3.5 h-3.5" />
                        </button>
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

        {/* User Avatar + Dropdown */}
        <Popover open={userMenuOpen} onOpenChange={setUserMenuOpen}>
          <PopoverTrigger asChild>
            <div>
              <Avatar size="sm" className="cursor-pointer transition-shadow focus-ring">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.name?.charAt(0) || user?.username?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            </div>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-1.5">
            <div className="px-2 py-1.5">
              <Text className="font-medium text-[13px]">{user?.name || user?.username}</Text>
              {user?.email && (
                <Text variant="muted" size="xs" className="truncate">{user.email}</Text>
              )}
            </div>
            <Separator className="my-1" />
            <div className="space-y-0.5">
              <Link
                to="/app/sessions"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2 px-2 h-7 text-[13px] rounded-[var(--radius-sm)] hover:bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors w-full"
              >
                <Icons.settings className="w-3.5 h-3.5" />
                Settings
              </Link>
              <button
                onClick={async () => {
                  setUserMenuOpen(false)
                  await logout()
                  navigate('/login')
                }}
                className="flex items-center gap-2 px-2 h-7 text-[13px] rounded-[var(--radius-sm)] hover:bg-[var(--danger-soft)] text-[var(--text-secondary)] hover:text-[var(--danger)] transition-colors w-full text-left"
              >
                <Icons.x className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

    </header>
  )
}
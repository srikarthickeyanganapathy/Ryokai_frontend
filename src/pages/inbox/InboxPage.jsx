import React, { useState, useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Button, IconButton } from '@/shared/ui/Button'
import {
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/features/notifications/hooks/useNotifications'
import { useAcceptInvite, useDeclineInvite } from '@/features/organizations/hooks/useOrganizations'
import { NotificationPanel } from '@/widgets/notifications/NotificationPanel'

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

export function InboxPage() {
  const [filterTab, setFilterTab] = useState('ALL') // ALL | UNREAD | MENTIONS | INVITES
  const [activeNotification, setActiveNotification] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const { data: notifications = [], isLoading: notifLoading } = useNotificationList({ size: 100 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const unreadCount = notifications.filter(n => n.isRead === false).length
  const mentionsCount = notifications.filter(n => n.type === 'MENTION').length
  const invitesCount = notifications.filter(n => n.type === 'ORG_INVITE_RECEIVED').length

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'UNREAD') return notifications.filter(n => n.isRead === false)
    if (filterTab === 'MENTIONS') return notifications.filter(n => n.type === 'MENTION')
    if (filterTab === 'INVITES') return notifications.filter(n => n.type === 'ORG_INVITE_RECEIVED')
    return notifications
  }, [notifications, filterTab])

  const openNotification = (n) => {
    setActiveNotification(n)
    setIsPanelOpen(true)
    if (n.isRead === false) {
      markRead.mutate(n.id)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto space-y-6" role="region" aria-label="Inbox">
      
      {/* 🧭 ORIENT MODE STICKY HEADER */}
      <div className="pb-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              ORIENT Mode
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• Action Stream & Telemetry</span>
          </div>
          <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">Action Inbox & Telemetry</Heading>
          <Text variant="muted" className="text-[13px] mt-1">
            {unreadCount > 0 ? `You have ${unreadCount} unread action${unreadCount === 1 ? '' : 's'} requiring attention.` : "You're completely caught up."}
          </Text>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="h-9 text-[13px]"
          >
            <Icons.checkCircle className="w-4 h-4 mr-2" />
            Mark all read
          </Button>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 border-b border-[var(--color-border-subtle)] pb-2">
        {[
          { id: 'ALL', label: 'All Activity', count: notifications.length },
          { id: 'UNREAD', label: 'Unread', count: unreadCount },
          { id: 'MENTIONS', label: 'Mentions', count: mentionsCount },
          { id: 'INVITES', label: 'Invitations', count: invitesCount },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterTab(tab.id)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5',
              filterTab === tab.id
                ? 'bg-[var(--accent-soft)] text-[var(--accent)] font-semibold'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-subtle)]'
            )}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={cn('px-1.5 py-0.2 rounded-full font-mono text-[10px]', filterTab === tab.id ? 'bg-[var(--accent)] text-white' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]')}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* LIST CONTAINER */}
      <div className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden flex flex-col min-h-0">
        {notifLoading && (
          <div className="p-6 space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-2 mt-1">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!notifLoading && filteredNotifications.length === 0 && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
              <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <Heading level={4} className="text-base font-semibold">Zero pending actions</Heading>
            <Text variant="muted" className="mt-1 text-xs">No notifications match your current filter.</Text>
          </div>
        )}

        {!notifLoading && filteredNotifications.length > 0 && (
          <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto custom-scrollbar">
            {filteredNotifications.map((n) => {
              const IconComponent = typeIcons[n.type] || Icons.alert
              const isRead = n.isRead !== false
              const isSelected = activeNotification?.id === n.id && isPanelOpen
              
              return (
                <div
                  key={n.id}
                  className={cn(
                    'flex items-start gap-4 p-5 transition-colors duration-[var(--duration-fast)] ease-out cursor-pointer group',
                    isSelected
                      ? 'bg-[var(--accent-soft)] border-l-4 border-l-[var(--accent)]'
                      : !isRead
                      ? 'bg-[var(--accent-soft)]/40 hover:bg-[var(--bg-subtle)]'
                      : 'bg-[var(--bg-base)] hover:bg-[var(--bg-subtle)]'
                  )}
                  onClick={() => openNotification(n)}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center shrink-0 border',
                    !isRead 
                      ? 'bg-[var(--bg-base)] border-transparent text-[var(--accent)] shadow-sm' 
                      : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                  )}>
                    <IconComponent className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Text className={cn("text-[14px] font-medium leading-snug", !isRead ? "text-[var(--text-primary)]" : "text-[var(--text-secondary)]")}>
                          {n.title}
                        </Text>
                        {n.message && (
                          <Text variant="muted" className="text-[13px] mt-1.5 leading-relaxed line-clamp-2">
                            {n.message}
                          </Text>
                        )}
                        <Text variant="muted" className="text-[12px] mt-2.5 font-medium flex items-center gap-1.5">
                          {n.relativeTime || 'Just now'}
                        </Text>

                        {n.type === 'ORG_INVITE_RECEIVED' && n.deduplicationKey && (
                          <div className="flex items-center gap-2.5 mt-4">
                            <Button 
                              size="sm" 
                              variant="primary" 
                              disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                              onClick={(e) => {
                                e.stopPropagation();
                                const inviteId = n.deduplicationKey.replace('org-invite:', '');
                                if (inviteId) acceptInviteMutation.mutate(inviteId);
                              }}
                            >
                              Accept Invitation
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
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

                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                        {!isRead && (
                          <IconButton
                            variant="ghost"
                            size="sm"
                            title="Mark as read"
                            onClick={(e) => {
                              e.stopPropagation()
                              markRead.mutate(n.id)
                            }}
                          >
                            <Icons.check className="w-4 h-4 text-[var(--text-secondary)]" />
                          </IconButton>
                        )}
                        <IconButton
                          variant="ghost"
                          size="sm"
                          title="Delete"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification.mutate(n.id)
                          }}
                          className="text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                        >
                          <Icons.trash2 className="w-4 h-4" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                  
                  {!isRead && (
                    <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-4 shadow-[0_0_8px_var(--accent)]" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* OUTLOOK-STYLE RIGHT ACTION PANEL */}
      <NotificationPanel
        notification={activeNotification}
        isOpen={isPanelOpen}
        onClose={() => {
          setIsPanelOpen(false)
          setActiveNotification(null)
        }}
      />
    </div>
  )
}

import React, { useState, useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { Button, IconButton } from '@/shared/ui/Button'
import {
  useNotificationList,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/platform/notifications'
import { useAcceptInvite, useDeclineInvite } from '@/organization'
import { NotificationPanel } from '@/platform/notifications'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

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

export function InboxPage() {
  const [filterTab, setFilterTab] = useState('ALL')
  const [activeNotification, setActiveNotification] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)

  const { workspaceMode } = useWorkspace()

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
    if (n.isRead === false) markRead.mutate(n.id)
  }

  const workspaceModeLabel = workspaceMode === 'ORG' ? 'ORG' : workspaceMode === 'CREWS' ? 'CREWS' : 'PERSONAL'
  const isEmpty = notifications.length === 0
  const isFilterEmpty = !isEmpty && filteredNotifications.length === 0

  return (
    <PageShell maxWidth="narrow" workspaceMode={workspaceModeLabel}>
      <PageHero
        title="Inbox"
        subtitle={unreadCount > 0 ? `You have ${unreadCount} unread items requiring attention.` : "You're completely caught up."}
        eyebrow="Action Center"
      >
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllRead.mutate()} isLoading={markAllRead.isPending} className="h-9 text-[13px] gap-2">
            <Icons.checkCircle className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </PageHero>

      <div className="flex items-center gap-2 pb-4 flex-wrap">
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

      <PageContent>
        <PageState state={notifLoading ? 'loading' : 'ready'} stateProps={{ loadingVariant: 'table' }}>
          <div className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden flex flex-col min-h-0">
            {isEmpty ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                  <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                </div>
                <Heading level={4} className="text-base font-semibold">Your inbox is clear</Heading>
                <Text variant="muted" className="mt-1 text-xs">New activity will appear here.</Text>
              </div>
            ) : isFilterEmpty ? (
              <div className="py-24 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                  <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                </div>
                <Heading level={4} className="text-base font-semibold">Zero pending actions</Heading>
                <Text variant="muted" className="mt-1 text-xs">No notifications match your current filter.</Text>
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-subtle)] overflow-y-auto custom-scrollbar">
                {filteredNotifications.map((n) => {
                  const IconComponent = typeIcons[n.type] || Icons.alert
                  const isRead = n.isRead !== false
                  const isSelected = activeNotification?.id === n.id && isPanelOpen
                  
                  return (
                    <div
                      key={n.id}
                      className={cn(
                        'flex items-start gap-4 p-5 transition-colors ease-out cursor-pointer group',
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
                        !isRead ? 'bg-[var(--bg-base)] border-transparent text-[var(--accent)] shadow-sm' : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
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
                              <div className="flex items-center gap-2.5 mt-4 flex-wrap">
                                <Button size="sm" variant="primary" isLoading={acceptInviteMutation.isPending} disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending} onClick={(e) => {
                                  e.stopPropagation();
                                  const inviteId = n.deduplicationKey.replace('org-invite:', '');
                                  if (inviteId) acceptInviteMutation.mutate(inviteId);
                                }}>Accept Invitation</Button>
                                <Button size="sm" variant="outline" isLoading={declineInviteMutation.isPending} disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending} onClick={(e) => {
                                  e.stopPropagation();
                                  const inviteId = n.deduplicationKey.replace('org-invite:', '');
                                  if (inviteId) declineInviteMutation.mutate(inviteId);
                                }}>Decline</Button>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!isRead && (
                              <IconButton variant="ghost" size="sm" title="Mark as read" onClick={(e) => { e.stopPropagation(); markRead.mutate(n.id); }}>
                                <Icons.check className="w-4 h-4 text-[var(--text-secondary)]" />
                              </IconButton>
                            )}
                            <IconButton variant="ghost" size="sm" title="Delete" onClick={(e) => { e.stopPropagation(); deleteNotification.mutate(n.id); }} className="text-[var(--text-secondary)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]">
                              <Icons.trash2 className="w-4 h-4" />
                            </IconButton>
                          </div>
                        </div>
                      </div>
                      
                      {!isRead && (
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0 mt-4" />
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </PageState>
      </PageContent>

      <NotificationPanel
        notification={activeNotification}
        isOpen={isPanelOpen}
        onClose={() => { setIsPanelOpen(false); setActiveNotification(null); }}
        onMarkRead={(id) => markRead.mutate(id)}
        onDelete={(id) => { deleteNotification.mutate(id); setIsPanelOpen(false); }}
        onAcceptInvite={(id) => acceptInviteMutation.mutate(id.replace('org-invite:', ''))}
        onDeclineInvite={(id) => declineInviteMutation.mutate(id.replace('org-invite:', ''))}
      />
    </PageShell>
  )
}

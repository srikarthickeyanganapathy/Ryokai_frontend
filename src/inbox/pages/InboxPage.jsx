import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { Skeleton } from '@/shared/ui/Skeleton'

/**
 * Workspace-aware inbox:
 *  - ORGANIZATION / CREWS → Linear-style Inbox scoped to the active org/crew:
 *    grouped by date, filtered by kind, rows jump straight to the work.
 *  - PERSONAL → Notification Center: account-level activity and invites.
 *
 * Isolation is enforced by the backend (membership-checked scoped queries);
 * the page only supplies the active workspace's scope.
 */

const ASSIGNED_TYPES = new Set(['TASK_ASSIGNED', 'TEAM_MEMBER_ADDED'])
const REVIEW_TYPES = new Set(['TASK_SUBMITTED'])

const isInboxActivity = (type) =>
  !ASSIGNED_TYPES.has(type) && !REVIEW_TYPES.has(type)

const groupOf = (n) => {
  const created = new Date(n.createdAt || n.created_at || Date.now())
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const t = created.getTime()
  if (t >= startOfToday) return 'Today'
  if (t >= startOfToday - 6 * 86400000) return 'This week'
  return 'Earlier'
}

const GROUP_ORDER = ['Today', 'This week', 'Earlier']

export function InboxPage() {
  const [filterTab, setFilterTab] = useState('ALL')
  const [activeNotification, setActiveNotification] = useState(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const navigate = useNavigate()

  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace()

  // ── Scope resolution ──────────────────────────────────────────────────
  const scope = (() => {
    if (workspaceMode === 'ORG') {
      return activeOrganization?.id
        ? { workspace: 'ORGANIZATION', orgId: activeOrganization.id }
        : null
    }
    if (workspaceMode === 'CREWS') {
      return activeCrew?.id
        ? { workspace: 'CREW', crewId: activeCrew.id }
        : null
    }
    return { workspace: 'PERSONAL' }
  })()

  const scopeParams = scope ? { size: 100, ...scope } : null

  const { data: notifications = [], isLoading: notifLoading } =
    useNotificationList(scopeParams || { size: 100 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()
  const deleteNotification = useDeleteNotification()

  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const isNotificationCenter = !scope || scope.workspace === 'PERSONAL'
  const scopeMissing = !scope // org/crew lens active but nothing selected

  const unreadCount = notifications.filter(n => n.isRead === false).length
  const invitesCount = notifications.filter(n => n.type === 'ORG_INVITE_RECEIVED').length
  const assignedCount = notifications.filter(n => ASSIGNED_TYPES.has(n.type)).length
  const reviewCount = notifications.filter(n => REVIEW_TYPES.has(n.type)).length
  const activityCount = notifications.filter(n => isInboxActivity(n.type)).length

  const filterTabs = isNotificationCenter
    ? [
        { id: 'ALL', label: 'All', count: notifications.length },
        { id: 'UNREAD', label: 'Unread', count: unreadCount },
        { id: 'INVITES', label: 'Invitations', count: invitesCount },
      ]
    : [
        { id: 'ALL', label: 'Inbox', count: notifications.length },
        { id: 'UNREAD', label: 'Unread', count: unreadCount },
        { id: 'ASSIGNED', label: 'Assigned', count: assignedCount },
        { id: 'REVIEW', label: 'Review', count: reviewCount },
        { id: 'ACTIVITY', label: 'Activity', count: activityCount },
      ]

  const filteredNotifications = useMemo(() => {
    if (filterTab === 'UNREAD') return notifications.filter(n => n.isRead === false)
    if (filterTab === 'INVITES') return notifications.filter(n => n.type === 'ORG_INVITE_RECEIVED')
    if (filterTab === 'ASSIGNED') return notifications.filter(n => ASSIGNED_TYPES.has(n.type))
    if (filterTab === 'REVIEW') return notifications.filter(n => REVIEW_TYPES.has(n.type))
    if (filterTab === 'ACTIVITY') return notifications.filter(n => isInboxActivity(n.type))
    return notifications
  }, [notifications, filterTab])

  // Linear-style date grouping (inbox modes only)
  const grouped = useMemo(() => {
    if (isNotificationCenter) return null
    const groups = new Map()
    for (const n of filteredNotifications) {
      const g = groupOf(n)
      if (!groups.has(g)) groups.set(g, [])
      groups.get(g).push(n)
    }
    return GROUP_ORDER.filter(g => groups.has(g)).map(g => ({ label: g, items: groups.get(g) }))
  }, [filteredNotifications, isNotificationCenter])

  const openNotification = (n) => {
    if (n.isRead === false) markRead.mutate(n.id)
    if (!isNotificationCenter && n.taskId) {
      // Go straight to the work — that is the point of the inbox.
      navigate(`/app/tasks/${n.taskId}`)
      return
    }
    setActiveNotification(n)
    setIsPanelOpen(true)
  }

  const markAllInScope = () => markAllRead.mutate(scope || undefined)

  const scopeLabel =
    scope?.workspace === 'ORGANIZATION'
      ? activeOrganization?.name || 'Organization'
      : scope?.workspace === 'CREW'
        ? activeCrew?.name || 'Crew'
        : null

  const pageTitle = isNotificationCenter ? 'Notifications' : 'Inbox'
  const pageEyebrow = isNotificationCenter ? 'Notification Center' : `${scope?.workspace === 'ORGANIZATION' ? 'Organization' : 'Crew'} Inbox`
  const subtitle = scopeMissing
    ? 'Select an organization or crew to see its inbox.'
    : unreadCount > 0
      ? `${unreadCount} unread ${isNotificationCenter ? 'notifications' : 'items'}.`
      : "You're all caught up."

  const isEmpty = notifications.length === 0
  const isFilterEmpty = !isEmpty && filteredNotifications.length === 0

  return (
    <PageShell maxWidth="narrow" workspaceMode={workspaceMode}>
      <PageHero
        title={pageTitle}
        subtitle={subtitle}
        eyebrow={pageEyebrow}
      >
        {unreadCount > 0 && !scopeMissing && (
          <Button variant="outline" size="sm" onClick={markAllInScope} isLoading={markAllRead.isPending} className="h-9 text-[13px] gap-2">
            <Icons.checkCircle className="w-4 h-4" />
            Mark all read
          </Button>
        )}
      </PageHero>

      {!scopeMissing && (
        <div className="flex items-center gap-2 pb-4 flex-wrap">
          {filterTabs.map(tab => (
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
                <span className={cn('px-1.5 py-0.5 rounded-full font-mono text-[10px]', filterTab === tab.id ? 'bg-[var(--accent)] text-[var(--text-on-accent)]' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)]')}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      <PageContent>
        {scopeMissing ? (
          <div className="py-24 flex flex-col items-center justify-center text-center border border-[var(--border-subtle)] rounded-[var(--radius-lg)] bg-[var(--bg-subtle)]/30">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
              <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
            </div>
            <Heading level={4} className="text-base font-semibold">No workspace selected</Heading>
            <Text variant="muted" className="mt-1 text-xs">
              Pick an organization or crew from the workspace switcher to open its inbox.
            </Text>
          </div>
        ) : (
          <PageState state={notifLoading ? 'loading' : 'ready'} stateProps={{ skeleton: <InboxSkeleton />, loadingVariant: 'table' }}>
            <div className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden flex flex-col min-h-0">
              {isEmpty ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                    <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                  </div>
                  <Heading level={4} className="text-base font-semibold">
                    {isNotificationCenter ? 'No notifications' : 'Inbox zero'}
                  </Heading>
                  <Text variant="muted" className="mt-1 text-xs">
                    {isNotificationCenter
                      ? 'Account activity and invitations will appear here.'
                      : scopeLabel
                        ? `Activity in ${scopeLabel} that involves you will appear here.`
                        : 'New activity will appear here.'}
                  </Text>
                </div>
              ) : isFilterEmpty ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mb-4">
                    <Icons.inbox className="w-6 h-6 text-[var(--text-tertiary)]" />
                  </div>
                  <Heading level={4} className="text-base font-semibold">Nothing here</Heading>
                  <Text variant="muted" className="mt-1 text-xs">No items match this filter.</Text>
                </div>
              ) : (
                <div className="overflow-y-auto custom-scrollbar">
                  {(grouped || [{ label: null, items: filteredNotifications }]).map((group) => (
                    <div key={group.label || 'all'}>
                      {group.label && (
                        <div className="px-5 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
                          {group.label}
                        </div>
                      )}
                      <div className="divide-y divide-[var(--border-subtle)]">
                        {group.items.map((n) => {
                          const isRead = n.isRead !== false
                          const isSelected = activeNotification?.id === n.id && isPanelOpen
                          const isInvite = n.type === 'ORG_INVITE_RECEIVED'

                          return (
                            <div
                              key={n.id}
                              className={cn(
                                'flex items-start gap-4 px-5 py-4 transition-colors ease-out cursor-pointer group',
                                isSelected
                                  ? 'bg-[var(--accent-soft)] border-l-4 border-l-[var(--accent)]'
                                  : !isRead
                                    ? 'bg-[var(--accent-soft)]/40 hover:bg-[var(--bg-subtle)]'
                                    : 'bg-[var(--bg-base)] hover:bg-[var(--bg-subtle)]'
                              )}
                              onClick={() => openNotification(n)}
                            >
                              <div className={cn(
                                'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border',
                                !isRead ? 'bg-[var(--bg-base)] border-transparent text-[var(--accent)] shadow-sm' : 'bg-[var(--bg-subtle)] border-transparent text-[var(--text-secondary)]'
                              )}>
                                {n.actorUsername ? (
                                  <span className="text-[12px] font-bold uppercase">
                                    {n.actorUsername.charAt(0)}
                                  </span>
                                ) : (
                                  <Icons.alert className="w-4 h-4" />
                                )}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <Text className={cn('text-[13.5px] font-medium leading-snug', !isRead ? 'text-[var(--text-primary)] font-semibold' : 'text-[var(--text-secondary)]')}>
                                      {n.title}
                                    </Text>
                                    {n.message && (
                                      <Text variant="muted" className="text-[12.5px] mt-1 leading-relaxed line-clamp-1">
                                        {n.message}
                                      </Text>
                                    )}
                                    <div className="mt-1.5 flex items-center gap-2">
                                      {n.taskTitle && (
                                        <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-[var(--bg-subtle)] text-[var(--text-tertiary)] max-w-[220px] truncate">
                                          {n.taskTitle}
                                        </span>
                                      )}
                                      <Text variant="muted" className="text-[11.5px] font-medium">
                                        {n.relativeTime || 'Just now'}
                                      </Text>
                                    </div>

                                    {isInvite && n.deduplicationKey && (
                                      <div className="flex items-center gap-2.5 mt-3 flex-wrap">
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </PageState>
        )}
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

function InboxSkeleton() {
  return (
    <div className="flex-1 bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] shadow-sm overflow-hidden flex flex-col min-h-0">
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3.5">
            <Skeleton className="w-9 h-9 rounded-lg shrink-0" />
            <div className="flex-1 space-y-1.5"><Skeleton className="h-3.5 w-1/2" /><Skeleton className="h-3 w-2/3" /></div>
            <Skeleton className="w-4 h-4 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}

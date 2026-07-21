import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Trash2, X, Check, ExternalLink, Mail, UserCheck, UserX, ShieldAlert } from 'lucide-react'
import { Button, IconButton } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useMarkRead, useDeleteNotification } from '@/features/notifications/hooks/useNotifications'
import { useAcceptInvite, useDeclineInvite } from '@/features/organizations/hooks/useOrganizations'
import { TaskPanel } from '@/widgets/tasks/TaskPanel'
import { useTaskList } from '@/features/tasks/hooks/useTasks'

export function NotificationPanel({ notification, isOpen, onClose }) {
  const markRead = useMarkRead()
  const deleteNotification = useDeleteNotification()
  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const { data: tasks = [] } = useTaskList()
  const [selectedTask, setSelectedTask] = useState(null)

  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ryokai_notifpanel_width')
    return saved ? parseInt(saved, 10) : 560
  })
  const [isResizing, setIsResizing] = useState(false)

  const startResizing = useCallback((e) => {
    e.preventDefault()
    setIsResizing(true)
    const startX = e.clientX
    const startWidth = panelWidth

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 380), window.innerWidth - 60)
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [panelWidth])

  useEffect(() => {
    if (panelWidth) {
      localStorage.setItem('ryokai_notifpanel_width', String(panelWidth))
    }
  }, [panelWidth])

  // Automatically mark notification as read when opened in panel
  useEffect(() => {
    if (notification && notification.isRead === false) {
      markRead.mutate(notification.id)
    }
  }, [notification])

  if (!isOpen || !notification) return null

  // Extract linked taskId if deduplicationKey or target payload contains task ID
  const taskIdMatch = notification.deduplicationKey?.match(/task:(\d+)/) || notification.message?.match(/task #(\d+)/i)
  const linkedTaskId = taskIdMatch ? taskIdMatch[1] : null
  const linkedTask = linkedTaskId ? tasks.find(t => String(t.id) === String(linkedTaskId)) : null

  const handleDelete = () => {
    deleteNotification.mutate(notification.id, { onSuccess: onClose })
  }

  const isInvite = notification.type === 'ORG_INVITE_RECEIVED'
  const inviteId = isInvite && notification.deduplicationKey ? notification.deduplicationKey.replace('org-invite:', '') : null

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-black/40 backdrop-blur-xs"
            />

            {/* PANEL SLIDE-OVER */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              style={{ width: `${panelWidth}px` }}
              className={cn(
                "relative bg-[var(--bg-base)] border-l border-[var(--color-border-subtle)] shadow-2xl h-full flex flex-col z-10 select-text",
                isResizing && "select-none transition-none"
              )}
            >
              {/* DRAG RESIZE HANDLE */}
              <div
                onMouseDown={startResizing}
                className={cn(
                  "absolute left-0 top-0 bottom-0 w-3 -ml-1.5 z-30 cursor-ew-resize flex items-center justify-center group select-none hover:bg-[var(--accent)]/30 transition-colors",
                  isResizing && "bg-[var(--accent)]/50"
                )}
                title="Drag to resize panel"
              >
                <div className="w-1 h-10 rounded-full bg-[var(--text-muted)]/40 group-hover:bg-[var(--accent)] transition-colors" />
              </div>

              {/* PANEL TOP TOOLBAR */}
              <div className="p-4 border-b border-[var(--color-border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] font-mono text-[10px] uppercase font-semibold border border-[var(--accent-border)] flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    Action Detail
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[var(--bg-subtle)] text-[var(--text-muted)] font-mono text-[10px] uppercase font-medium">
                    {notification.type}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <IconButton
                    variant="ghost"
                    size="sm"
                    title="Delete Notification"
                    onClick={handleDelete}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>

                  <IconButton
                    variant="ghost"
                    size="sm"
                    title="Close"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              {/* PANEL CONTENT BODY */}
              <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
                {/* TITLE & METADATA */}
                <div className="space-y-2">
                  <Heading level={2} className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                    {notification.title}
                  </Heading>
                  <Text variant="muted" className="text-xs font-mono">
                    Received: {notification.relativeTime || 'Just now'}
                  </Text>
                </div>

                {/* MESSAGE CARD */}
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] space-y-3 shadow-xs">
                  <Text className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {notification.message || 'No additional message details provided.'}
                  </Text>
                </div>

                {/* DYNAMIC ACTION TRIGGER CARDS */}
                {isInvite && inviteId && (
                  <div className="p-5 rounded-2xl bg-[var(--accent-soft)]/20 border border-[var(--accent-border)] space-y-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--accent)]">
                      <ShieldAlert className="w-4 h-4" />
                      <span>Organization Access Invitation</span>
                    </div>
                    <Text variant="muted" className="text-xs">
                      You have been invited to collaborate in an Organization workspace. Accept to claim your membership.
                    </Text>
                    <div className="flex items-center gap-3 pt-2">
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                        onClick={() => acceptInviteMutation.mutate(inviteId, { onSuccess: onClose })}
                        className="gap-1.5 text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Accept Invitation
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                        onClick={() => declineInviteMutation.mutate(inviteId, { onSuccess: onClose })}
                        className="gap-1.5 text-xs"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {linkedTask && (
                  <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Associated Task</Text>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTask(linkedTask)}
                        className="gap-1.5 text-xs h-8"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        Inspect Task #{linkedTask.id}
                      </Button>
                    </div>
                    <Text className="text-sm font-medium">{linkedTask.title}</Text>
                  </div>
                )}

              </div>

              {/* PANEL FOOTER */}
              <div className="p-4 border-t border-[var(--color-border-subtle)] bg-[var(--bg-elevated)]/50 flex items-center justify-end">
                <Button variant="ghost" onClick={onClose} className="text-xs">
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LINKED TASK INSPECTOR PANEL */}
      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </>
  )
}

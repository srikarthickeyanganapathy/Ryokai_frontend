import React, { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Trash2, X, Check, CheckCircle2, ExternalLink, Mail, UserCheck, UserX, ShieldAlert, XCircle } from '@/shared/ui/Icons'
import { toast } from 'sonner'
import { Button, IconButton } from '@/shared/ui/Button'
import { Heading, Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { useMarkRead, useDeleteNotification } from './hooks/useNotifications'
import { useAcceptInvite, useDeclineInvite } from '@/organization'
import { useNavigate } from 'react-router-dom'

export function NotificationPanel({
 notification, isOpen, onClose }) {
  const navigate = useNavigate()
  const markRead = useMarkRead()
  const deleteNotification = useDeleteNotification()
  const acceptInviteMutation = useAcceptInvite()
  const declineInviteMutation = useDeclineInvite()

  const [panelWidth, setPanelWidth] = useState(() => {
    const saved = localStorage.getItem('ryokai_notifpanel_width')
    return saved ? parseInt(saved, 10) : 560
  })
  const [isResizing, setIsResizing] = useState(false)
  const dragStartRef = useRef(null)

  // Invite decision taken inside this panel ('accepted' | 'declined') -- the
  // card must reflect the outcome instead of showing action buttons forever.
  // Reset when a different notification is opened.
  const [inviteDecision, setInviteDecision] = useState(null)
  useEffect(() => {
    setInviteDecision(null)
  }, [notification?.id])

  const startResizing = useCallback((e) => {
    e.preventDefault()
    dragStartRef.current = { startX: e.clientX, startWidth: panelWidth }
    setIsResizing(true)
  }, [panelWidth])

  // Window listeners live in an effect bound to isResizing so they are ALWAYS
  // cleaned up -- on mouseup AND on unmount-mid-drag (route change / panel close
  // used to leak the listeners and keep mutating a removed component).
  useEffect(() => {
    if (!isResizing) return
    const { startX, startWidth } = dragStartRef.current || { startX: 0, startWidth: panelWidth }

    const handleMouseMove = (moveEvent) => {
      const deltaX = startX - moveEvent.clientX
      const newWidth = Math.min(Math.max(startWidth + deltaX, 380), window.innerWidth - 60)
      setPanelWidth(newWidth)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, panelWidth])

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
  }, [notification, markRead])

  if (!isOpen || !notification) return null

  // Extract linked taskId: prefer the DTO's own taskId/taskTitleSnapshot -- the
  // old tasks.find(...) searched an array that was never defined or passed in,
  // crashing with ReferenceError on every task-linked notification.
  const taskIdMatch = notification.taskId
    ? String(notification.taskId)
    : (notification.deduplicationKey?.match(/task:(\d+)/) || notification.message?.match(/task #(\d+)/i) || [])[1] || null
  const linkedTask = taskIdMatch
    ? { id: Number(taskIdMatch), title: notification.taskTitleSnapshot || `Task #${taskIdMatch}` }
    : null

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
                "relative bg-[var(--bg-base)] border-l border-[var(--border-subtle)] shadow-2xl h-full flex flex-col z-10 select-text",
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
              <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-elevated)]/50">
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
                    aria-label="Delete notification"
                    onClick={handleDelete}
                    className="text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </IconButton>

                  <IconButton
                    variant="ghost"
                    size="sm"
                    title="Close"
                    aria-label="Close notification"
                    onClick={onClose}
                  >
                    <X className="w-4 h-4" />
                  </IconButton>
                </div>
              </div>

              {/* PANEL CONTENT BODY */}
              <div aria-live="polite" className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                
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
                <div className="p-5 rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-subtle)] space-y-3 shadow-xs">
                  <Text className="text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                    {notification.message || 'No additional message details provided.'}
                  </Text>
                </div>

                {/* DYNAMIC ACTION TRIGGER CARDS */}
                {isInvite && inviteId && inviteDecision === 'accepted' && (
                  <div className="p-5 rounded-2xl bg-[var(--success-soft)]/30 border border-[var(--success)]/30 space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--success)]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Invitation accepted</span>
                    </div>
                    <Text variant="muted" className="text-xs">
                      You have joined the organization workspace.
                    </Text>
                    <div className="pt-1">
                      <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                        Done
                      </Button>
                    </div>
                  </div>
                )}

                {isInvite && inviteId && inviteDecision === 'declined' && (
                  <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-2">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[var(--text-secondary)]">
                      <XCircle className="w-4 h-4" />
                      <span>Invitation declined</span>
                    </div>
                    <Text variant="muted" className="text-xs">
                      This invitation was rejected. The organization can re-invite you later.
                    </Text>
                    <div className="pt-1">
                      <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
                        Done
                      </Button>
                    </div>
                  </div>
                )}

                {isInvite && inviteId && !inviteDecision && (
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
                        onClick={() => acceptInviteMutation.mutate(inviteId, {
                          onSuccess: () => setInviteDecision('accepted'),
                          onError: (err) => toast.error(err?.response?.data?.message || 'Failed to accept invitation'),
                        })}
                        className="gap-1.5 text-xs"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        Accept Invitation
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={acceptInviteMutation.isPending || declineInviteMutation.isPending}
                        onClick={() => declineInviteMutation.mutate(inviteId, {
                          onSuccess: () => setInviteDecision('declined'),
                          onError: (err) => toast.error(err?.response?.data?.message || 'Failed to decline invitation'),
                        })}
                        className="gap-1.5 text-xs"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}

                {linkedTask && (
                  <div className="p-5 rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between">
                      <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Associated Task</Text>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => navigate(`/app/tasks/${linkedTask.id}`, { state: { task: linkedTask } })}
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
              <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-elevated)]/50 flex items-center justify-end">
                <Button variant="ghost" onClick={onClose} className="text-xs">
                  Done
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Task detail opens in full page via /app/tasks/:taskId */}
    </>
  )
}

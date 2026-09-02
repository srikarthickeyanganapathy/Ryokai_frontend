import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Pencil, Trash2, Clock } from 'lucide-react'
import { Button } from '@/shared/ui/Button'
import { EmptyState } from '@/shared/ui/EmptyState'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { Input } from '@/shared/ui/Input'
import { useOrgWhiteboards, useCreateOrgWhiteboard, useDeleteOrgWhiteboard } from '@/whiteboard'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog'

function relativeTime(dateInput) {
  if (!dateInput) return ''
  const diff = Date.now() - new Date(dateInput).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  return `${Math.floor(hours / 24)}d ago`
}

/**
 * Organization whiteboards — org-scoped, fully isolated from crew boards.
 * Available to every organization member; boards open full-screen.
 */
export function OrgWhiteboardsTab({ orgId }) {
  const navigate = useNavigate()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()
  const { data: boards = [], isLoading } = useOrgWhiteboards(orgId)
  const createBoard = useCreateOrgWhiteboard(orgId)
  const deleteBoard = useDeleteOrgWhiteboard(orgId)
  const [createOpen, setCreateOpen] = useState(false)
  const [title, setTitle] = useState('')

  const handleCreate = () => {
    const name = title.trim()
    if (!name) return
    createBoard.mutate(name, {
      onSuccess: (board) => {
        setCreateOpen(false)
        setTitle('')
        navigate(`/app/organizations/${orgId}/whiteboards/${board.id}`)
      },
    })
  }

  const handleDelete = (board) => {
    confirm({
      title: 'Delete whiteboard?',
      description: `"${board.title}" and its contents will be removed for everyone in this organization.`,
      confirmLabel: 'Delete',
      onConfirm: () => deleteBoard.mutate(board.id),
    })
  }

  return (
    <div className="space-y-4">
      {confirmDialog}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-[15px] font-semibold text-[var(--text-primary)]">Whiteboards</h3>
          <p className="text-[12.5px] text-[var(--text-secondary)]">
            Collaborative boards for your organization — visible to all members.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" /> New board
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
          ))}
        </div>
      ) : boards.length === 0 ? (
        <EmptyState
          icon={Pencil}
          title="No boards yet"
          description="Create a shared whiteboard for planning, diagrams, and workshops."
          actionLabel="Create the first board"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {boards.map((board) => (
            <motion.div
              key={board.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="group relative rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-elevated)] overflow-hidden hover:border-[var(--border-strong)] transition-colors"
            >
              <button
                type="button"
                onClick={() => navigate(`/app/organizations/${orgId}/whiteboards/${board.id}`)}
                className="block w-full text-left"
              >
                <div className="h-16 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] flex items-center justify-center">
                  <Pencil className="h-6 w-6 text-[var(--text-tertiary)]" strokeWidth={1.5} />
                </div>
                <div className="p-3">
                  <div className="text-[13px] font-semibold text-[var(--text-primary)] truncate">
                    {board.title}
                  </div>
                  <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[var(--text-tertiary)]">
                    <Clock className="h-3 w-3" />
                    Updated {relativeTime(board.updatedAt)}
                    {board.createdByUsername && (
                      <span className="truncate"> · {board.createdByUsername}</span>
                    )}
                  </div>
                </div>
              </button>
              <button
                type="button"
                aria-label={`Delete ${board.title}`}
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(board)
                }}
                className="absolute top-2 right-2 rounded-md p-1.5 bg-[var(--bg-elevated)]/90 text-[var(--text-tertiary)] opacity-0 group-hover:opacity-100 hover:text-[var(--danger)] transition-all"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onOpenChange={setCreateOpen}>
        <ModalContent className="max-w-sm">
          <ModalHeader>
            <ModalTitle>New whiteboard</ModalTitle>
            <ModalDescription>Shared with every member of this organization.</ModalDescription>
          </ModalHeader>
          <Input
            autoFocus
            placeholder="Board name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={handleCreate} disabled={!title.trim() || createBoard.isPending}>
              Create board
            </Button>
          </div>
        </ModalContent>
      </Modal>
    </div>
  )
}

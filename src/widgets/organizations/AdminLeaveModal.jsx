import React, { useState, useEffect } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal'
import { useAdminLeave } from '@/features/organizations/hooks/useOrganizations'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function AdminLeaveModal({ isOpen, onClose, orgId, members = [] }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const adminLeaveMutation = useAdminLeave(orgId)
  
  // Filter out the current admin from the successor candidates list
  const otherMembers = members.filter(m => m.userId !== user?.id)
  const isAlone = otherMembers.length === 0

  const [mode, setMode] = useState(isAlone ? 'dissolve' : 'transfer') // 'transfer' or 'dissolve'
  const [successorUserId, setSuccessorUserId] = useState('')

  // Reset local state on modal open
  useEffect(() => {
    if (isOpen) {
      setMode(isAlone ? 'dissolve' : 'transfer')
      setSuccessorUserId('')
    }
  }, [isOpen, isAlone])

  const handleConfirm = () => {
    const isDissolving = mode === 'dissolve'
    const payload = {
      successorUserId: isDissolving ? null : Number(successorUserId),
      dissolve: isDissolving
    }

    if (!isDissolving && !successorUserId) return

    adminLeaveMutation.mutate(payload, {
      onSuccess: () => {
        onClose()
        navigate('/dashboard')
      }
    })
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]">
        <ModalHeader>
          <ModalTitle className="text-[var(--text-primary)]">Exit Organization</ModalTitle>
        </ModalHeader>

        <div className="space-y-5 mt-4">
          {isAlone ? (
            <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] p-4 rounded-[var(--radius-md)]">
              <Text className="text-sm font-medium text-[var(--danger)]">
                ⚠️ Warning: You are the only member in this organization. Exiting will permanently dissolve and delete all its data, teams, and projects.
              </Text>
            </div>
          ) : (
            <div className="space-y-4">
              <Text className="text-sm text-[var(--text-secondary)]">
                Please select how you would like to exit this organization:
              </Text>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('transfer')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === 'transfer'
                      ? 'border-[var(--accent)] bg-[var(--accent-soft)]/20'
                      : 'border-[var(--color-border-subtle)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Text className="font-semibold text-sm block mb-1">Transfer Admin Role</Text>
                  <Text size="xs" variant="muted">Pass ownership to another member</Text>
                </button>

                <button
                  type="button"
                  onClick={() => setMode('dissolve')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    mode === 'dissolve'
                      ? 'border-[var(--danger)] bg-[var(--danger-soft)]/20'
                      : 'border-[var(--color-border-subtle)] hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <Text className="font-semibold text-sm block mb-1 text-[var(--danger)]">Dissolve Organization</Text>
                  <Text size="xs" variant="muted">Remove all members and delete org</Text>
                </button>
              </div>

              {mode === 'transfer' ? (
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Select Successor Admin</label>
                  <Select
                    value={successorUserId}
                    onValueChange={setSuccessorUserId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a member..." />
                    </SelectTrigger>
                    <SelectContent>
                      {otherMembers.map(m => (
                        <SelectItem key={m.userId} value={m.userId.toString()}>
                          {m.username}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="bg-[var(--danger-soft)] border border-[var(--danger-border)] p-4 rounded-[var(--radius-md)] mt-2">
                  <Text className="text-xs text-[var(--danger)] font-medium">
                    ⚠️ Irreversible Action: All other members will be removed, and all tasks, teams, and projects under this organization will be permanently deleted.
                  </Text>
                </div>
              )}
            </div>
          )}

          <ModalFooter className="flex gap-3 justify-end pt-4 border-t border-[var(--color-border-subtle)]">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant={mode === 'dissolve' ? 'danger' : 'primary'}
              onClick={handleConfirm}
              disabled={adminLeaveMutation.isPending || (mode === 'transfer' && !successorUserId)}
            >
              {adminLeaveMutation.isPending
                ? 'Processing...'
                : mode === 'dissolve'
                ? 'Dissolve & Exit'
                : 'Transfer & Exit'}
            </Button>
          </ModalFooter>
        </div>
      </ModalContent>
    </Modal>
  )
}

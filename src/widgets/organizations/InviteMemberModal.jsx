import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { useInviteMember } from '@/features/organizations/hooks/useOrganizations'

export function InviteMemberModal({ isOpen, onClose, orgId }) {
  const [username, setUsername] = useState('')
  const [orgRole, setOrgRole] = useState('EMPLOYEE')
  
  const inviteMutation = useInviteMember(orgId)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username) return
    inviteMutation.mutate({ username, orgRole }, {
      onSuccess: () => {
        setUsername('')
        setOrgRole('EMPLOYEE')
        onClose()
      }
    })
  }


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-[var(--bg-base)] border border-[var(--color-border-subtle)] rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border-subtle)]">
            <Heading level={3} className="text-lg">Invite Member</Heading>
            <IconButton variant="ghost" onClick={onClose}>
              <Icons.x className="w-5 h-5" />
            </IconButton>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]/50 transition-all"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--text-secondary)]">Role</label>
              <select
                value={orgRole}
                onChange={(e) => setOrgRole(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]/50 transition-all"
              >
                <option value="EMPLOYEE">Employee</option>
                <option value="MANAGER">Manager</option>
                <option value="DIRECTOR">Director</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-border-subtle)]">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={inviteMutation.isPending || !username}>
                {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  )
}

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { useInviteMember, useOrgRoles } from '@/features/organizations/hooks/useOrganizations'

export function InviteMemberModal({ isOpen, onClose, orgId }) {
  const [username, setUsername] = useState('')
  const [roleId, setRoleId] = useState('')
  
  const { data: roles = [], isLoading: rolesLoading } = useOrgRoles(orgId)
  const inviteMutation = useInviteMember(orgId)

  // Set default role when roles load
  React.useEffect(() => {
    if (roles.length > 0 && !roleId) {
      const employeeRole = roles.find(r => r.name === 'EMPLOYEE') || roles[0]
      setRoleId(employeeRole.id)
    }
  }, [roles, roleId])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!username || !roleId) return
    inviteMutation.mutate({ username, roleId }, {
      onSuccess: () => {
        setUsername('')
        setRoleId('') // will be reset by effect next time
        onClose()
      }
    })
  }


  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] p-4">
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
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                disabled={rolesLoading}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-cyan)]/50 transition-all disabled:opacity-50"
              >
                {rolesLoading ? (
                  <option value="">Loading roles...</option>
                ) : (
                  roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))
                )}
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
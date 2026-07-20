import { Label } from '@/shared/ui/Typography/Label';

import React, { useState } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Input } from '@/shared/ui/Input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal'
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
      setRoleId(employeeRole.id.toString())
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
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle>Invite Member</ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">Username</Label>
            <Input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoFocus
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">Role</Label>
            <Select
              value={roleId}
              onValueChange={setRoleId}
              disabled={rolesLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder={rolesLoading ? "Loading roles..." : "Select a role"} />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.id} value={role.id.toString()}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ModalFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={inviteMutation.isPending || !username}>
              {inviteMutation.isPending ? 'Inviting...' : 'Send Invite'}
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  )
}
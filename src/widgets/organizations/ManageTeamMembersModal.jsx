import React, { useState } from 'react'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { useAddTeamMember, useRemoveTeamMember } from '@/features/organizations/hooks/useOrganizations'

export function ManageTeamMembersModal({ isOpen, onClose, team, orgMembers }) {
  const addMember = useAddTeamMember()
  const removeMember = useRemoveTeamMember()
  
  // Available members to add (org members not already in the team)
  const availableMembers = orgMembers?.filter(
    (orgMem) => !team?.members?.some((teamMem) => teamMem.id === orgMem.userId)
  )

  const handleAddMember = (userId) => {
    if (!team?.id) return
    addMember.mutate({ teamId: team.id, userId })
  }

  const handleRemoveMember = (userId) => {
    if (!team?.id) return
    removeMember.mutate({ teamId: team.id, userId })
  }

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <Heading level={3} className="mb-2">Manage Team: {team?.name}</Heading>
        <Text variant="muted" className="mb-6">
          Add or remove members for this team.
        </Text>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pr-2">
          
          {/* Current Members */}
          <section>
            <Heading level={4} className="mb-3 text-sm text-[var(--text-secondary)] uppercase tracking-wider">Current Members</Heading>
            {team?.members?.length === 0 ? (
              <Text variant="muted" className="text-sm italic">No members in this team.</Text>
            ) : (
              <div className="space-y-2">
                {team?.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent-violet)] text-white flex items-center justify-center text-xs">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{member.username}</span>
                    </div>
                    <IconButton 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removeMember.isPending}
                    >
                      <Icons.x className="w-4 h-4" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add Members */}
          <section>
            <Heading level={4} className="mb-3 text-sm text-[var(--text-secondary)] uppercase tracking-wider">Add from Organization</Heading>
            {availableMembers?.length === 0 ? (
              <Text variant="muted" className="text-sm italic">All organization members are already in this team.</Text>
            ) : (
              <div className="space-y-2">
                {availableMembers?.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-2 rounded-lg bg-[var(--bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--color-border-default)] transition-colors">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-none">{member.username}</div>
                        <div className="text-xs text-[var(--text-muted)] mt-1">{member.email}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddMember(member.userId)}
                      disabled={addMember.isPending}
                    >
                      <Icons.plus className="w-3 h-3 mr-1" />
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>
      </ModalContent>
    </Modal>
  )
}

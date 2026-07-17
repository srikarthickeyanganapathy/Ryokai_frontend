import React from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { 
  useAddTeamMember, 
  useRemoveTeamMember,
  useTeamObservers,
  useAddTeamObserver,
  useRemoveTeamObserver
} from '@/features/organizations/hooks/useOrganizations'

export function ManageTeamMembersModal({ isOpen, onClose, team, orgMembers }) {
  const addMember = useAddTeamMember()
  const removeMember = useRemoveTeamMember()
  const { data: observers } = useTeamObservers(team?.id)
  const addObserver = useAddTeamObserver()
  const removeObserver = useRemoveTeamObserver()
  
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

  const handleAddObserver = (userId) => {
    if (!team?.id) return
    addObserver.mutate({ teamId: team.id, userId })
  }

  const handleRemoveObserver = (userId) => {
    if (!team?.id) return
    removeObserver.mutate({ teamId: team.id, userId })
  }

  // Available observers to add (org members not in the team and not already observers)
  const availableObservers = orgMembers?.filter(
    (orgMem) => 
      !team?.members?.some((teamMem) => teamMem.id === orgMem.userId) &&
      !observers?.some((obsMem) => obsMem.id === orgMem.userId)
  )

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md max-h-[80vh] flex flex-col">
        <ModalHeader>
          <ModalTitle>Manage Team: {team?.name}</ModalTitle>
          <ModalDescription>Add or remove members for this team.</ModalDescription>
        </ModalHeader>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 pr-2 custom-scrollbar">
          
          {/* Current Members */}
          <section>
            <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Current Members</Text>
            {team?.members?.length === 0 ? (
              <Text variant="muted" className="text-sm italic">No members in this team.</Text>
            ) : (
              <div className="space-y-2">
                {team?.members?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-medium">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{member.username}</span>
                    </div>
                    <IconButton 
                      variant="ghost" 
                      size="sm" 
                      className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
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
            <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Add from Organization</Text>
            {availableMembers?.length === 0 ? (
              <Text variant="muted" className="text-sm italic">All organization members are already in this team.</Text>
            ) : (
              <div className="space-y-2">
                {availableMembers?.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] transition-colors duration-[var(--duration-base)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-none">{member.username}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-1">{member.email}</div>
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

          {/* Current Observers */}
          <section>
            <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Team Observers (Read-Only)</Text>
            {!observers || observers.length === 0 ? (
              <Text variant="muted" className="text-sm italic">No observers in this team.</Text>
            ) : (
              <div className="space-y-2">
                {observers?.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--text-muted)] text-white flex items-center justify-center text-xs font-medium">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium">{member.username}</span>
                    </div>
                    <IconButton 
                      variant="ghost" 
                      size="sm" 
                      className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                      onClick={() => handleRemoveObserver(member.id)}
                      disabled={removeObserver.isPending}
                    >
                      <Icons.x className="w-4 h-4" />
                    </IconButton>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Add Observers */}
          <section>
            <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Add Observer from Organization</Text>
            {availableObservers?.length === 0 ? (
              <Text variant="muted" className="text-sm italic">All available members are already in the team or are observers.</Text>
            ) : (
              <div className="space-y-2">
                {availableObservers?.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-[var(--radius-md)] bg-[var(--bg-base)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-border)] transition-colors duration-[var(--duration-base)]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center text-xs font-medium text-[var(--text-secondary)]">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="text-sm font-medium leading-none">{member.username}</div>
                        <div className="text-[11px] text-[var(--text-muted)] mt-1">{member.email}</div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddObserver(member.userId)}
                      disabled={addObserver.isPending}
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

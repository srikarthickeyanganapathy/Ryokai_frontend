import React, { useState } from 'react'
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription } from '@/shared/ui/Modal'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { useAddTeamMember, useRemoveTeamMember, useTeamObservers, useAddTeamObserver, useRemoveTeamObserver } from '@/organization'

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

function PersonAvatar({ name, muted = false }) {
  const hue = hashHue(name || '?')
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold text-white shrink-0 shadow-sm" style={{ background: muted ? 'var(--text-muted)' : `linear-gradient(135deg, hsl(${hue} 65% 50%), hsl(${(hue + 30) % 360} 65% 40%))` }}>
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  )
}

function SearchInput({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Icons.search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
      <input type="text" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full pl-8 pr-7 py-2 text-xs bg-[var(--bg-base)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/25 focus:border-[var(--accent)] transition-colors" />
      {value && <button type="button" onClick={() => onChange('')} aria-label="Clear search" className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]"><Icons.x className="w-3 h-3" /></button>}
    </div>
  )
}

export function ManageTeamMembersModal({ isOpen, onClose, team, orgMembers }) {
  const [activeTab, setActiveTab] = useState('members')
  const addMember = useAddTeamMember()
  const removeMember = useRemoveTeamMember()
  const { data: observers } = useTeamObservers(team?.id)
  const addObserver = useAddTeamObserver()
  const removeObserver = useRemoveTeamObserver()

  const [memberSearch, setMemberSearch] = useState('')
  const availableMembers = orgMembers?.filter((orgMem) => !team?.members?.some((teamMem) => teamMem.id === orgMem.userId)).filter((mem) => mem.username?.toLowerCase().includes(memberSearch.toLowerCase()) || mem.email?.toLowerCase().includes(memberSearch.toLowerCase()))

  const [observerSearch, setObserverSearch] = useState('')
  const availableObservers = orgMembers?.filter((orgMem) => !team?.members?.some((teamMem) => teamMem.id === orgMem.userId) && !observers?.some((obsMem) => obsMem.id === orgMem.userId)).filter((mem) => mem.username?.toLowerCase().includes(observerSearch.toLowerCase()) || mem.email?.toLowerCase().includes(observerSearch.toLowerCase()))

  const hue = hashHue(team?.name || 'team')

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-lg max-h-[85vh] flex flex-col p-0 overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border-subtle)] shadow-2xl rounded-xl">
        <div className="relative px-6 pt-6 pb-4 bg-[var(--bg-subtle)] border-b border-[var(--border-subtle)] shrink-0">
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none" style={{ background: `radial-gradient(circle at 15% 0%, hsl(${hue} 80% 55%), transparent 60%)` }} aria-hidden="true" />
          <ModalHeader className="p-0 relative">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0" style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 52%), hsl(${(hue + 40) % 360} 70% 40%))` }}>{team?.name?.charAt(0).toUpperCase()}</div>
              <div className="min-w-0">
                <ModalTitle className="truncate text-[14px] font-semibold tracking-tight">{team?.name}</ModalTitle>
                <ModalDescription className="text-[12px] text-[var(--text-muted)]">Manage roster access and read-only observers.</ModalDescription>
              </div>
            </div>
          </ModalHeader>
        </div>

        <div className="flex gap-1 p-1 bg-[var(--bg-subtle)] mx-6 mt-4 rounded-lg shrink-0 w-fit">
          <button type="button" onClick={() => setActiveTab('members')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors', activeTab === 'members' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            <Icons.users className="w-3.5 h-3.5" /> Members <span className={cn('tabular-nums text-xs', activeTab === 'members' ? 'opacity-90' : 'opacity-60')}>{team?.members?.length || 0}</span>
          </button>
          <button type="button" onClick={() => setActiveTab('observers')} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors', activeTab === 'observers' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>
            <Icons.search className="w-3.5 h-3.5" /> Observers <span className={cn('tabular-nums text-xs', activeTab === 'observers' ? 'opacity-90' : 'opacity-60')}>{observers?.length || 0}</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 min-h-0 px-6 pt-4 pb-6 custom-scrollbar">
          {activeTab === 'members' && (
            <>
              <section>
                <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Current Members</Text>
                {team?.members?.length === 0 ? <EmptyRow text="No members in this team yet." /> : (
                  <div className="space-y-2">
                    {team?.members?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)] transition-colors hover:border-[var(--accent-border)]">
                        <div className="flex items-center gap-2.5"><PersonAvatar name={member.username} /><span className="text-[13px] font-medium">{member.username}</span></div>
                        <IconButton variant="ghost" size="sm" className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] h-7 w-7" onClick={() => removeMember.mutate({ teamId: team.id, userId: member.id })} disabled={removeMember.isPending} title={`Remove ${member.username}`}><Icons.x className="w-3.5 h-3.5" /></IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Add from Organization</Text>
                <div className="mb-3"><SearchInput value={memberSearch} onChange={setMemberSearch} placeholder="Search available members..." /></div>
                {availableMembers?.length === 0 ? <EmptyRow text={memberSearch ? 'No members match your search.' : 'All organization members are already in this team.'} /> : (
                  <div className="space-y-2">
                    {availableMembers?.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <PersonAvatar name={member.username} />
                          <div className="min-w-0"><div className="text-[13px] font-medium leading-none truncate">{member.username}</div><div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">{member.email}</div></div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => addMember.mutate({ teamId: team.id, userId: member.userId })} disabled={addMember.isPending}><Icons.plus className="w-3 h-3 mr-1" /> Add</Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
          {activeTab === 'observers' && (
            <>
              <section>
                <div className="flex items-start gap-2 mb-4 rounded-md bg-[var(--info-soft)]/60 border border-[var(--info)]/20 px-3 py-2.5">
                  <Icons.search className="w-3.5 h-3.5 text-[var(--info)] mt-0.5 shrink-0" />
                  <Text size="xs" className="text-[var(--text-secondary)] leading-relaxed">Observers get read-only access to this team's discussions, projects, and tasks — without becoming members.</Text>
                </div>
                <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Team Observers (Read-Only)</Text>
                {!observers || observers.length === 0 ? <EmptyRow text="No observers in this team." /> : (
                  <div className="space-y-2">
                    {observers?.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2.5"><PersonAvatar name={member.username} muted /><span className="text-[13px] font-medium">{member.username}</span></div>
                        <IconButton variant="ghost" size="sm" className="text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] h-7 w-7" onClick={() => removeObserver.mutate({ teamId: team.id, userId: member.id })} disabled={removeObserver.isPending} title={`Remove ${member.username}`}><Icons.x className="w-3.5 h-3.5" /></IconButton>
                      </div>
                    ))}
                  </div>
                )}
              </section>
              <section>
                <Text className="mb-3 text-[11px] text-[var(--text-secondary)] uppercase tracking-wider font-semibold">Add Observer from Organization</Text>
                <div className="mb-3"><SearchInput value={observerSearch} onChange={setObserverSearch} placeholder="Search available members..." /></div>
                {availableObservers?.length === 0 ? <EmptyRow text={observerSearch ? 'No members match your search.' : 'All available members are already in the team or are observers.'} /> : (
                  <div className="space-y-2">
                    {availableObservers?.map((member) => (
                      <div key={member.userId} className="flex items-center justify-between p-2.5 rounded-md bg-[var(--bg-base)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-colors">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <PersonAvatar name={member.username} />
                          <div className="min-w-0"><div className="text-[13px] font-medium leading-none truncate">{member.username}</div><div className="text-[11px] text-[var(--text-muted)] mt-1 truncate">{member.email}</div></div>
                        </div>
                        <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => addObserver.mutate({ teamId: team.id, userId: member.userId })} disabled={addObserver.isPending}><Icons.plus className="w-3 h-3 mr-1" /> Add</Button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </>
          )}
        </div>
      </ModalContent>
    </Modal>
  )
}

function EmptyRow({ text }) {
  return <div className="text-center py-6 border border-dashed border-[var(--border-subtle)] rounded-md"><Text variant="muted" className="text-[13px] italic">{text}</Text></div>
}
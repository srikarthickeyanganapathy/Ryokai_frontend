import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';



import { useCreateCrewTask } from '@/crew/features/hooks/useCrews'; import { useCompleteCrewTask } from '@/task';
import { useClaimTask } from '@/task/entities/hooks/useTasks';

/* ==================== DIRECTORY-STYLE MEMBERS TAB ==================== */
export function MembersTab({ crewId, members, memberCap, isCreator }) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

  const filteredMembers = useMemo(() => {
    return members.filter(m => 
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [members, searchQuery]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    inviteMutation.mutate(email, {
      onSuccess: () => setEmail('')
    });
  };

  const handleCreateInviteLink = () => {
    inviteLinkMutation.mutate(null, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <Heading level={3} className="text-base font-bold text-[var(--text-primary)] mb-0">
            Crew Members ({members.length}/{memberCap})
          </Heading>
          <Text variant="muted" className="text-xs mt-0.5">
            Active collaborators and squad participants.
          </Text>
        </div>

        <div className="flex items-center gap-3">
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-48 text-xs h-8"
          />
        </div>
      </div>

      {/* Main Grid & Invite Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Member Cards Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.userId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] hover:border-[var(--accent-soft)] rounded-2xl p-4 shadow-sm transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <Avatar size="md" className="bg-[var(--accent)] text-white font-bold shrink-0">
                    <AvatarFallback>{member.username?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <Heading level={4} className="text-sm font-bold text-[var(--text-primary)] truncate mb-0">
                        @{member.username}
                      </Heading>
                      <span className={cn(
                        "text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full uppercase border",
                        member.role === 'CREATOR' 
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20" 
                          : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]"
                      )}>
                        {member.role === 'CREATOR' ? '👑 Owner' : member.role}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--text-muted)] truncate mb-3">
                      {member.email || "No email provided"}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border-subtle)]">
                      {isCreator && member.role !== 'CREATOR' && (
                        <Button
                          variant="outline"
                          size="xs"
                          className="h-7 text-[11px]"
                          onClick={async () => {
                            if (await confirm({ title: `Transfer crew ownership to @${member.username}? You will be demoted to MEMBER.`, danger: true })) {
                              transferOwnershipMutation.mutate(member.userId);
                            }
                          }}
                          isLoading={transferOwnershipMutation.isPending && transferOwnershipMutation.variables === member.userId}
                        >
                          Make Owner
                        </Button>
                      )}

                      <IconButton
                        variant="danger"
                        size="sm"
                        className="h-7 w-7"
                        title="Remove Member"
                        onClick={async () => {
                          if (await confirm({ title: `Remove member @${member.username}?`, danger: true })) {
                            removeMutation.mutate(member.userId);
                          }
                        }}
                        disabled={removeMutation.isPending}
                      >
                        <Icons.trash2 className="w-3.5 h-3.5" />
                      </IconButton>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-12 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl border-dashed">
              <Icons.users className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
              <Heading level={4} className="text-xs font-semibold text-[var(--text-secondary)]">No members found</Heading>
            </div>
          )}
        </div>

        {/* Right 1 Col: Invite Box */}
        <div className="lg:col-span-1 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-5 shadow-sm space-y-5 h-fit">
          <div>
            <Heading level={3} className="text-sm font-bold text-[var(--text-primary)] mb-1">Add Crew Members</Heading>
            <Text variant="muted" className="text-xs">Invite collaborators to join your squad.</Text>
          </div>

          <form onSubmit={handleInvite} className="space-y-2">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Invite by Email</Label>
            <div className="flex gap-2">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@company.com"
                className="flex-1 text-xs h-9"
                required
              />
              <Button type="submit" size="sm" isLoading={inviteMutation.isPending} className="h-9">
                Send
              </Button>
            </div>
          </form>

          <div className="border-t border-[var(--color-border-subtle)] pt-4 space-y-3">
            <Label className="text-xs font-medium text-[var(--text-secondary)]">Shareable Join Link</Label>
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 h-9 text-xs"
              onClick={handleCreateInviteLink}
              isLoading={inviteLinkMutation.isPending}
            >
              <Icons.externalLink className="w-3.5 h-3.5" />
              Generate Invite Link
            </Button>
            
            {inviteLink && (
              <div className="p-2.5 bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-xl text-xs flex items-center justify-between gap-2">
                <span className="truncate text-[var(--text-secondary)] font-mono text-[11px]">{inviteLink}</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(inviteLink);
                    toast.success('Invite link copied!');
                  }}
                >
                  Copy
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}

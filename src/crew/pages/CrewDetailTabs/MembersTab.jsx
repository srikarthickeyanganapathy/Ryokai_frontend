import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Avatar, AvatarFallback } from '@/shared/ui/Avatar';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { useInviteCrewMember, useCreateCrewInviteLink, useRemoveCrewMember, useTransferCrewOwnership } from '@/crew/features/hooks/useCrews';
import { Search, UserPlus, Link2, Copy, Check, Mail, Trash2, Crown, ShieldCheck, CalendarDays, Activity, Users } from 'lucide-react';

// Helper to highlight search results
const highlightText = (text, query) => {
  if (!query) return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-[var(--accent-soft)] text-[var(--accent)] px-0.5 rounded">{part}</mark>
      : part
  );
};

function MemberCard({ member, isCreator, index, searchQuery, onTransfer, onRemove }) {
  const [isHovered, setIsHovered] = useState(false);
  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 transition-all overflow-hidden group hover:border-[var(--accent-border)]"
    >
      {/* Decorative hover background */}
      <div className={cn(
        "absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl transition-opacity duration-500 pointer-events-none",
        isOwner ? "bg-amber-500/10" : "bg-[var(--accent-soft)]",
        isHovered ? "opacity-100" : "opacity-0"
      )} />

      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-2.5">
          <Avatar className="w-14 h-14 rounded-full bg-[var(--accent)] text-white font-bold text-lg shadow-sm border border-[var(--bg-card)]">
            <AvatarFallback className="bg-[var(--accent)] text-white">
              {member.username?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[var(--bg-card)] flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-200"></span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-0.5">
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">
            {highlightText(member.username || 'Unknown', searchQuery)}
          </Heading>
          {isOwner && <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/20" />}
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium mb-3">
          <Mail className="w-3 h-3" />
          <span className="truncate max-w-[140px]">{highlightText(member.email || 'No email', searchQuery)}</span>
        </div>

        <div className="flex items-center gap-2 mb-3">
          <span className={cn(
            "text-[9px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1 border",
            isOwner
              ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
              : "bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]"
          )}>
            {isOwner ? <Crown className="w-2.5 h-2.5" /> : <ShieldCheck className="w-2.5 h-2.5" />}
            {isOwner ? 'Owner' : 'Member'}
          </span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium flex items-center gap-1">
            <CalendarDays className="w-2.5 h-2.5" />
            {new Date(member.joinedAt || Date.now()).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}
          </span>
        </div>

        {/* Hover Profile / Actions */}
        <div className={cn(
          "w-full transition-all duration-300 overflow-hidden",
          isHovered ? "max-h-32 opacity-100" : "max-h-0 opacity-0"
        )}>
          <div className="w-full pt-2.5 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
              <Activity className="w-3 h-3 text-emerald-500" />
              <span>Active now</span>
            </div>
            {isCreator && !isOwner && (
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 text-[10px] px-2 font-semibold"
                  onClick={() => onTransfer(member.userId)}
                >
                  Make Owner
                </Button>
                <IconButton
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  title="Remove Member"
                  onClick={() => onRemove(member.userId)}
                >
                  <Trash2 className="w-3 h-3" />
                </IconButton>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export function MembersTab({ crewId, members, memberCap, isCreator }) {
  const [email, setEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

  const filteredMembers = useMemo(() =>
    members.filter(m =>
      m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.role?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [members, searchQuery]);

  const handleInvite = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    inviteMutation.mutate(email, { onSuccess: () => setEmail('') });
  };

  const handleCreateInviteLink = () => {
    inviteLinkMutation.mutate(null, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
        navigator.clipboard.writeText(link);
        setIsLinkCopied(true);
        toast.success('Invite link generated & copied!');
        setTimeout(() => setIsLinkCopied(false), 2000);
      }
    });
  };

  const handleTransfer = async (userId) => {
    if (await confirm({ title: 'Transfer crew ownership?', description: 'You will be demoted to a standard member.', danger: true })) {
      transferOwnershipMutation.mutate(userId);
    }
  };

  const handleRemove = async (userId) => {
    if (await confirm({ title: 'Remove this member?', description: 'They will lose access to all crew resources immediately.', danger: true })) {
      removeMutation.mutate(userId);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div>
          <Heading level={3} className="text-[14px] font-semibold text-[var(--text-primary)] mb-0 tracking-tight flex items-center gap-2">
            <Users className="w-4 h-4 text-[var(--accent)]" />
            Team Directory
          </Heading>
          <Text variant="muted" className="text-[12px] mt-0.5">
            {members.length} of {memberCap} seats filled. Active collaborators in this crew.
          </Text>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-9 pr-3 py-1.5 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-md focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Members List */}
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredMembers.map((member, index) => (
              <MemberCard
                key={member.userId}
                member={member}
                isCreator={isCreator}
                index={index}
                searchQuery={searchQuery}
                onTransfer={handleTransfer}
                onRemove={handleRemove}
              />
            ))}
          </div>

          {filteredMembers.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
              <Search className="w-8 h-8 text-[var(--text-muted)] mb-3" />
              <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)]">No members found</Heading>
              <Text variant="muted" className="text-[13px] mt-1">Try adjusting your search or filters.</Text>
            </div>
          )}
        </div>

        {/* Invite & Link Generation Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 shadow-sm sticky top-20">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)]">
                <UserPlus className="w-3.5 h-3.5" />
              </div>
              <Heading level={3} className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight">Add Members</Heading>
            </div>
            <Text variant="muted" className="text-[12px] mb-4">Invite collaborators via email or link.</Text>

            <form onSubmit={handleInvite} className="space-y-2 mb-5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Email Invitation</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)]" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="pl-8 h-8 text-[12px] rounded-md font-medium"
                    required
                  />
                </div>
                <Button type="submit" size="sm" className="h-8 px-3 text-[12px] font-semibold" isLoading={inviteMutation.isPending}>
                  Send
                </Button>
              </div>
            </form>

            <div className="border-t border-[var(--border-subtle)] pt-4 space-y-2">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Shareable Invite Link</Label>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 h-8 text-[12px] font-semibold border-dashed"
                onClick={handleCreateInviteLink}
                isLoading={inviteLinkMutation.isPending}
              >
                <Link2 className="w-3.5 h-3.5" />
                {inviteLink ? 'Regenerate Link' : 'Generate Invite Link'}
              </Button>

              {inviteLink && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-2 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-md flex items-center justify-between gap-2"
                >
                  <span className="truncate text-[11px] text-[var(--text-secondary)] font-mono">{inviteLink}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inviteLink);
                      setIsLinkCopied(true);
                      toast.success('Link copied!');
                      setTimeout(() => setIsLinkCopied(false), 2000);
                    }}
                    className="p-1 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] text-[var(--accent)] transition-colors"
                  >
                    {isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      {confirmDialog}
    </div>
  );
}

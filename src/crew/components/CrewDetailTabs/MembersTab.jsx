import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import {
  useCrewMembers,
  useInviteCrewMember,
  useCreateCrewInviteLink,
  useRemoveCrewMember,
  useTransferCrewOwnership,
} from '@/crew';
import { useTaskList } from '@/task';
import { Users } from '@/shared/ui/Icons';
import { MemberCard } from './members/MemberCard';
import { MemberTable } from './members/MemberTable';
import { MemberDetailDrawer } from './members/MemberDetailDrawer';
import { InviteMemberModal } from './members/InviteMemberModal';
import { MembersHeader } from './members/MembersHeader';
import { MembersToolbar } from './members/MembersToolbar';
import { InviteLinkBanner } from './members/InviteLinkBanner';
import { LoadingSkeleton } from './members/LoadingSkeleton';
import { NoResultsState } from './members/NoResultsState';
import { ReadOnlyBanner } from './members/ReadOnlyBanner';
import { getMemberPresence, getMemberWorkload } from './members/utils';

// --- Main Living Team Directory Component (orchestrator) ---
export function MembersTab({ crewId, members = [], memberCap = 10, isCreator = false, isLoading = false, isError = false, refetch }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'OWNER' | 'ADMIN' | 'MEMBER'
  const [presenceFilter, setPresenceFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'FOCUS' | 'AWAY'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Queries & Mutations
  const { data: fetchedMembers, isLoading: isMembersLoading, isError: isMembersError, refetch: refetchMembers } = useCrewMembers(crewId);
  const { data: { tasks: rawCrewTasks = [] } = {} } = useTaskList({ crewId });

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

  // Resolved Member Roster
  const actualMembers = useMemo(() => {
    if (members && members.length > 0) return members;
    return fetchedMembers || [];
  }, [members, fetchedMembers]);

  const activeLoading = isLoading || isMembersLoading;
  const activeError = isError || isMembersError;

  // Workload calculator helper
  const getWorkload = (username) => getMemberWorkload(username, rawCrewTasks);

  // Filtered Roster
  const filteredMembers = useMemo(() => {
    return actualMembers.filter((m) => {
      const matchSearch =
        !searchQuery ||
        m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchQuery.toLowerCase());

      const isOwner = m.role === 'CREATOR' || m.role === 'OWNER';
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'OWNER' && isOwner) ||
        (roleFilter === 'ADMIN' && m.role === 'ADMIN') ||
        (roleFilter === 'MEMBER' && !isOwner && m.role !== 'ADMIN');

      const presence = getMemberPresence(m).toUpperCase();
      const matchPresence = presenceFilter === 'ALL' || presenceFilter === presence;

      return matchSearch && matchRole && matchPresence;
    });
  }, [actualMembers, searchQuery, roleFilter, presenceFilter]);

  // Actions
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail, {
      onSuccess: () => {
        setInviteEmail('');
        setIsInviteModalOpen(false);
      },
    });
  };

  const handleCreateInviteLink = () => {
    inviteLinkMutation.mutate(null, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
        navigator.clipboard.writeText(link);
        setIsLinkCopied(true);
        toast.success('Invite link generated and copied to clipboard!');
        setTimeout(() => setIsLinkCopied(false), 2500);
      },
    });
  };

  const handleCopyInviteLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setIsLinkCopied(true);
    toast.success('Invite link copied!');
    setTimeout(() => setIsLinkCopied(false), 2000);
  };

  const handleTransferOwnership = async (userId) => {
    if (
      await confirm({
        title: 'Transfer Crew Ownership?',
        description: 'You will relinquish crew owner rights and become a standard member.',
        confirmLabel: 'Transfer Ownership',
        cancelLabel: 'Cancel',
        danger: true,
      })
    ) {
      transferOwnershipMutation.mutate(userId);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (
      await confirm({
        title: 'Remove Member from Crew?',
        description: 'They will immediately lose access to crew tasks, channels, and projects.',
        confirmLabel: 'Remove Member',
        cancelLabel: 'Cancel',
        danger: true,
      })
    ) {
      removeMutation.mutate(userId);
    }
  };

  // State 1: Shimmer Skeleton (Loading State)
  if (activeLoading && actualMembers.length === 0) {
    return <LoadingSkeleton />;
  }

  // State 4: Error State
  if (activeError && actualMembers.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState
          title="Unable to load team directory"
          description="Failed to retrieve crew members. Please check your network connection and try again."
          onRetry={() => {
            if (refetch) refetch();
            refetchMembers();
          }}
        />
      </div>
    );
  }

  // State 2: Zero Members Empty State
  if (!activeLoading && actualMembers.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={Users}
          title="No Team Members Found"
          description="Build your living team by inviting collaborators to this crew workspace."
          actionLabel="Invite Team Member"
          onAction={() => setIsInviteModalOpen(true)}
        />

        {/* Email Invitation Modal */}
        <InviteMemberModal
          open={isInviteModalOpen}
          onOpenChange={setIsInviteModalOpen}
          email={inviteEmail}
          onEmailChange={setInviteEmail}
          isPending={inviteMutation.isPending}
          onSubmit={handleSendInvite}
        />
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* State 5: Permission Control Banner (Non-owners read-only notice) */}
      {!isCreator && <ReadOnlyBanner />}

      {/* Directory Header Toolbar -- teams design language (icon chip + title + subtitle) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <MembersHeader
          totalCount={actualMembers.length}
          memberCap={memberCap}
          activeCount={actualMembers.filter((m) => getMemberPresence(m) === 'active').length}
        />

        {/* Controls: Search, Filters, View Switcher & Action Buttons */}
        <MembersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleFilter={roleFilter}
          onRoleFilterChange={setRoleFilter}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onInvite={() => setIsInviteModalOpen(true)}
          onGenerateInviteLink={handleCreateInviteLink}
          isInviteLinkPending={inviteLinkMutation.isPending}
          isLinkCopied={isLinkCopied}
        />
      </div>

      {/* Shareable Link Active Alert (If generated) */}
      {inviteLink && (
        <InviteLinkBanner inviteLink={inviteLink} isLinkCopied={isLinkCopied} onCopy={handleCopyInviteLink} />
      )}

      {/* State 3: Filter / Search Empty Results State */}
      {filteredMembers.length === 0 ? (
        <NoResultsState
          query={searchQuery}
          onClear={() => {
            setSearchQuery('');
            setRoleFilter('ALL');
            setPresenceFilter('ALL');
          }}
        />
      ) : (
        /* State 7: Interactive Living Directory (Grid vs Table View) */
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredMembers.map((member, index) => (
                <MemberCard
                  key={member.userId || member.username || index}
                  member={member}
                  isCreator={isCreator}
                  index={index}
                  searchQuery={searchQuery}
                  workload={getWorkload(member.username)}
                  onSelect={(m) => setSelectedMember(m)}
                  onTransfer={handleTransferOwnership}
                  onRemove={handleRemoveMember}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <MemberTable
                members={filteredMembers}
                isCreator={isCreator}
                searchQuery={searchQuery}
                getWorkload={getWorkload}
                onSelect={(m) => setSelectedMember(m)}
                onTransfer={handleTransferOwnership}
                onRemove={handleRemoveMember}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Interactive Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        workload={selectedMember ? getWorkload(selectedMember.username) : { memberTasks: [] }}
        isCreator={isCreator}
        onTransfer={handleTransferOwnership}
        onRemove={handleRemoveMember}
      />

      {/* Email Invitation Modal */}
      <InviteMemberModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        email={inviteEmail}
        onEmailChange={setInviteEmail}
        isPending={inviteMutation.isPending}
        onSubmit={handleSendInvite}
      />

      {/* Global Confirmation Dialog */}
      {confirmDialog}
    </div>
  );
}

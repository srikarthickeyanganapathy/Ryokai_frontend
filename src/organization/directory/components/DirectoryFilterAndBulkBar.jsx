import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, IconButton } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/ui/Select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/Popover';
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/shared/ui/Modal';
import {
  Filter,
  Download,
  Shield,
  X,
  AlertTriangle,
  Users,
  CheckSquare,
  Bookmark,
  Search,
  Megaphone,
  ChevronDown,
  Star,
  User,
  Zap,
  Clock,
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import { SPRINGS, EASING } from '@/shared/lib/uxTokens';
import { toast } from 'sonner';

// --- Saved Filter Presets ---
const SAVED_VIEWS = [
  {
    id: 'all',
    label: 'All Members',
    icon: Users,
    description: 'Clear all filters',
    filters: { role: 'ALL', team: 'ALL' },
  },
  {
    id: 'management',
    label: 'Management Team',
    icon: Star,
    description: 'Admins & Directors only',
    filters: { role: 'MANAGEMENT', team: 'ALL' },
  },
  {
    id: 'unassigned',
    label: 'Unassigned Members',
    icon: User,
    description: 'No team membership',
    filters: { role: 'ALL', team: 'UNASSIGNED' },
  },
  {
    id: 'recently-active',
    label: 'Recently Active',
    icon: Zap,
    description: 'Task activity in 7 days',
    filters: { role: 'ALL', team: 'RECENTLY_ACTIVE' },
  },
];

// --- Search Suggestions Dropdown ---
function SearchSuggestions({ query, members, onSelect, visible }) {
  const suggestions = useMemo(() => {
    if (!query || query.trim().length < 1) return [];
    const q = query.toLowerCase();
    return members
      .filter((m) => (m.username || '').toLowerCase().includes(q))
      .slice(0, 5);
  }, [query, members]);

  if (!visible || suggestions.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={SPRINGS.fast}
      className="absolute top-full left-0 right-0 mt-1 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl z-30 overflow-hidden"
    >
      <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-subtle)]">
        Quick jump to member
      </div>
      {suggestions.map((member) => (
        <button
          key={member.userId}
          type="button"
          onClick={() => onSelect(member)}
          className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--bg-subtle)] transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] flex items-center justify-center text-xs font-bold text-[var(--accent)] shrink-0">
            {member.username?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors truncate">
              {member.username}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] truncate">
              {member.orgRole || 'Member'}
            </div>
          </div>
          <span className="text-[10px] text-[var(--text-muted)] opacity-0 group-hover:opacity-100 transition-opacity">
            Jump ->
          </span>
        </button>
      ))}
    </motion.div>
  );
}

export function DirectoryFilterBar({
  roles = [],
  teams = [],
  selectedRole,
  onRoleChange,
  selectedTeam,
  onTeamChange,
  onResetFilters,
  totalCount,
  filteredCount,
  members = [],
  onSelectMember,
  searchQuery = '',
  onSearchChange,
  onApplyPreset,
}) {
  const isFiltered = selectedRole !== 'ALL' || selectedTeam !== 'ALL';
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedViewOpen, setSavedViewOpen] = useState(false);

  const handlePresetSelect = useCallback(
    (preset) => {
      setSavedViewOpen(false);
      if (preset.id === 'all') {
        onResetFilters?.();
        return;
      }
      onApplyPreset?.(preset.filters);
      toast.success(`Applied "${preset.label}" view`);
    },
    [onResetFilters, onApplyPreset]
  );

  const handleSearchFocus = useCallback(() => {
    if (searchQuery && searchQuery.trim().length > 0) {
      setShowSuggestions(true);
    }
  }, [searchQuery]);

  const handleSearchBlur = useCallback(() => {
    // Delay to allow click on suggestion
    setTimeout(() => setShowSuggestions(false), 150);
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      onSearchChange?.(e.target.value);
      setShowSuggestions(true);
    },
    [onSearchChange]
  );

  const handleSuggestionSelect = useCallback(
    (member) => {
      setShowSuggestions(false);
      onSelectMember?.(member);
    },
    [onSelectMember]
  );

  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 py-3 px-4 rounded-lg border transition-colors',
        isFiltered
          ? 'bg-[var(--accent-soft)]/10 border-[var(--accent-border)]'
          : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
      )}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider pr-1">
          <Filter className="w-3.5 h-3.5 text-[var(--accent)]" />
          Filter Roster:
        </span>

        {/* Saved Views Dropdown */}
        <Popover open={savedViewOpen} onOpenChange={setSavedViewOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-medium bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] flex items-center gap-1.5 border-[var(--border-subtle)]"
            >
              <Bookmark className="w-3.5 h-3.5 text-[var(--accent)]" />
              Saved Views
              <ChevronDown className="w-3 h-3 text-[var(--text-muted)]" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-xl" align="start">
            <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Filter Presets
            </div>
            {SAVED_VIEWS.map((view) => {
              const Icon = view.icon;
              return (
                <button
                  key={view.id}
                  type="button"
                  onClick={() => handlePresetSelect(view)}
                  className="w-full flex items-center gap-3 px-2.5 py-2 rounded-lg hover:bg-[var(--bg-subtle)] transition-colors text-left group"
                >
                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)]/60 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                      {view.label}
                    </div>
                    <div className="text-[10px] text-[var(--text-muted)]">{view.description}</div>
                  </div>
                </button>
              );
            })}
          </PopoverContent>
        </Popover>

        {/* Role Filter */}
        <Select value={selectedRole || 'ALL'} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-[var(--bg-card)]">
            <SelectValue placeholder="All Roles" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Authority Roles</SelectItem>
            {roles.map((r) => (
              <SelectItem key={r.id} value={r.name}>
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Team Filter */}
        <Select value={selectedTeam || 'ALL'} onValueChange={onTeamChange}>
          <SelectTrigger className="w-[155px] h-8 text-xs bg-[var(--bg-card)]">
            <SelectValue placeholder="All Teams" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Organization Teams</SelectItem>
            {teams.map((t) => (
              <SelectItem key={t.id} value={t.id?.toString() ?? t.name}>
                {t.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear Filter Chip */}
        {isFiltered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={SPRINGS.fast}
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-8 px-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 bg-[var(--bg-card)] rounded-md border border-[var(--border-subtle)]"
            >
              <X className="w-3 h-3 text-[var(--text-muted)]" />
              Reset Filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Right side: Search + Count */}
      <div className="flex items-center gap-3">
        {/* Search with suggestions */}
        <div className="relative">
          <div className="flex items-center gap-1.5 bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2.5 h-8 min-w-[180px] focus-within:border-[var(--accent-border)] focus-within:ring-2 focus-within:ring-[var(--accent)]/20 transition-all">
            <Search className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
            <input
              type="text"
              value={searchQuery || ''}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search members..."
              className="bg-transparent border-none outline-none text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] w-full"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { onSearchChange?.(''); setShowSuggestions(false); }}
                className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
          <AnimatePresence>
            {showSuggestions && searchQuery && (
              <SearchSuggestions
                query={searchQuery}
                members={members}
                onSelect={handleSuggestionSelect}
                visible={showSuggestions}
              />
            )}
          </AnimatePresence>
        </div>

        <span className="text-xs text-[var(--text-muted)] flex items-center gap-2 whitespace-nowrap">
          <span>
            Showing <strong className="text-[var(--text-primary)]">{filteredCount}</strong> of{' '}
            <strong className="text-[var(--text-primary)]">{totalCount}</strong> members
          </span>
        </span>
      </div>
    </div>
  );
}

export function DirectoryBulkActionsBar({
  selectedIds = [],
  onClearSelection,
  allMembers = [],
  memberTeamsMap = {},
  memberTasksMap = {},
  roles = [],
  onBulkUpdateRole,
  onBulkRemove,
  canManageRoles,
  canRemoveMembers,
  currentUserId,
}) {
  const [roleSelectValue, setRoleSelectValue] = useState('');
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [typeInput, setTypeInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedMembers = allMembers.filter((m) => selectedIds.includes(m.userId));
  const hasSelected = selectedIds.length > 0;
  const requireTypeConfirm = selectedIds.length > 5;

  const handleExportCSV = useCallback(() => {
    try {
      const targetMembers = selectedMembers.length > 0 ? selectedMembers : allMembers;
      const headers = [
        'User ID',
        'Username',
        'Email',
        'Org Role',
        'Priority Rank',
        'Assigned Teams Count',
        'Active Tasks Count',
      ];

      const rows = targetMembers.map((m) => {
        const teamsCount = (memberTeamsMap[m.userId] || []).length;
        const tasksCount = (memberTasksMap[m.userId] || []).length;
        const cleanEmail = m.email || 'N/A';
        const priority = m.rolePriority ?? 99;
        return [
          `"${m.userId}"`,
          `"${(m.username || '').replace(/"/g, '""')}"`,
          `"${cleanEmail}"`,
          `"${m.orgRole || 'MEMBER'}"`,
          priority,
          teamsCount,
          tasksCount,
        ].join(',');
      });

      const csvContent = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `ryokai_selected_members_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${targetMembers.length} member records to CSV`);
    } catch (err) {
      toast.error('Failed to generate CSV file');
      console.error(err);
    }
  }, [selectedMembers, allMembers, memberTeamsMap, memberTasksMap]);

  const handleSendAnnouncement = useCallback(() => {
    toast('   Announcements coming soon!', {
      description: `Broadcasting to ${selectedIds.length} selected members will be available in a future update.`,
      duration: 3000,
    });
  }, [selectedIds]);

  const handleRoleSelect = async (roleIdStr) => {
    const roleId = parseInt(roleIdStr, 10);
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole || !onBulkUpdateRole) return;

    setIsProcessing(true);
    toast.loading(`Updating role to ${targetRole.name} for ${selectedIds.length} members...`, {
      id: 'bulk-role',
    });

    try {
      await onBulkUpdateRole(selectedIds, roleId, targetRole.name);
      toast.success(`Successfully updated ${selectedIds.length} member roles!`, { id: 'bulk-role' });
      setRoleSelectValue('');
      onClearSelection();
    } catch (err) {
      toast.error('Some role updates could not be completed.', { id: 'bulk-role' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInitiateRemove = () => {
    setTypeInput('');
    setConfirmModalOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (requireTypeConfirm && typeInput.trim().toUpperCase() !== 'CONFIRM') {
      toast.error('Please type CONFIRM to execute batch removal.');
      return;
    }

    setIsProcessing(true);
    toast.loading(`Removing ${selectedIds.length} members sequentially...`, { id: 'bulk-remove' });

    try {
      await onBulkRemove(selectedIds);
      toast.success(`Batch member removal process finalized!`, { id: 'bulk-remove' });
      setConfirmModalOpen(false);
      onClearSelection();
    } catch (err) {
      toast.error('Certain removals could not be processed.', { id: 'bulk-remove' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {hasSelected && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] sm:max-w-3xl bg-[var(--bg-elevated)] border-2 border-[var(--accent-border)] rounded-2xl p-3 sm:p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md"
          >
            <div className="flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-[var(--accent)] text-white font-bold text-xs shadow-sm">
                {selectedIds.length}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-[var(--text-primary)]">
                  {selectedIds.length} {selectedIds.length === 1 ? 'member' : 'members'} selected
                </p>
                <button
                  type="button"
                  onClick={onClearSelection}
                  disabled={isProcessing}
                  className="text-[11px] text-[var(--text-muted)] hover:text-[var(--danger)] underline underline-offset-2 transition-colors"
                >
                  Clear selection
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-wrap">
              {/* Send Announcement */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendAnnouncement}
                disabled={isProcessing}
                className="text-xs h-8 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5 shadow-2xs"
              >
                <Megaphone className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                Announce
              </Button>

              {/* CSV Export Selected */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isProcessing}
                className="text-xs h-8 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
                Export Selected
              </Button>

              {/* Bulk Role Change */}
              {canManageRoles && (
                <Select value={roleSelectValue} onValueChange={handleRoleSelect} disabled={isProcessing}>
                  <SelectTrigger className="w-[145px] h-8 text-xs font-semibold bg-[var(--bg-card)]">
                    <SelectValue placeholder="Change Role..." />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        Set {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* Bulk Remove Button */}
              {canRemoveMembers && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleInitiateRemove}
                  disabled={isProcessing}
                  className="text-xs h-8 px-3 flex items-center gap-1.5 font-semibold"
                >
                  <Icons.trash2 className="w-3.5 h-3.5" />
                  Remove ({selectedIds.length})
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Type-to-Confirm Modal for Destructive Removals */}
      <Modal
        open={confirmModalOpen}
        onOpenChange={(open) => {
          if (!isProcessing) setConfirmModalOpen(open);
        }}
      >
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-[var(--danger)]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Confirm Batch Member Removal
            </ModalTitle>
            <ModalDescription className="text-xs leading-relaxed pt-1">
              You are attempting to remove{' '}
              <strong className="text-[var(--text-primary)]">{selectedIds.length} members</strong>{' '}
              from the organization. Their active task assignments and team allocations will be
              unassigned or affected.
            </ModalDescription>
          </ModalHeader>

          <div className="py-3 space-y-3">
            <div className="p-3 rounded-lg bg-[var(--danger-soft)]/20 border border-[var(--danger-border)]/40 text-[11px] text-[var(--danger)] font-medium">
              [WARNING] This operation will sequentially revoke workspace access for all selected accounts.
            </div>

            {requireTypeConfirm && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                  Please type{' '}
                  <strong className="text-[var(--danger)] font-mono">CONFIRM</strong> in all caps to
                  authorize:
                </label>
                <input
                  type="text"
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  placeholder="CONFIRM"
                  disabled={isProcessing}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-sm tracking-widest font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--danger)] transition-all"
                />
              </div>
            )}
          </div>

          <ModalFooter className="gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmModalOpen(false)}
              disabled={isProcessing}
              className="text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmRemove}
              disabled={isProcessing || (requireTypeConfirm && typeInput.trim() !== 'CONFIRM')}
              className="text-xs px-5 font-semibold"
            >
              {isProcessing ? 'Processing Batch...' : `Confirm Remove (${selectedIds.length})`}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

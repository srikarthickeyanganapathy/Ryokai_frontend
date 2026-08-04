import React, { useState } from 'react';
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
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
} from '@/shared/ui/Modal';
import { Filter, Download, Shield, X, AlertTriangle, Users, CheckSquare } from 'lucide-react';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';

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
}) {
  const isFiltered = selectedRole !== 'ALL' || selectedTeam !== 'ALL';

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3 px-4 bg-[var(--bg-subtle)]/60 rounded-xl border border-[var(--border-subtle)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <span className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono pr-1">
          <Filter className="w-3.5 h-3.5 text-[var(--accent)]" />
          Filter Roster:
        </span>

        {/* Role Filter */}
        <Select value={selectedRole || 'ALL'} onValueChange={onRoleChange}>
          <SelectTrigger className="w-[140px] h-8 text-xs bg-[var(--bg-elevated)]">
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
          <SelectTrigger className="w-[155px] h-8 text-xs bg-[var(--bg-elevated)]">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={onResetFilters}
            className="h-8 px-2.5 text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] flex items-center gap-1 bg-[var(--bg-card)] rounded-md border border-[var(--border-subtle)]"
          >
            <X className="w-3 h-3 text-[var(--danger)]" />
            Reset Filters
          </Button>
        )}
      </div>

      <div className="text-xs font-mono text-[var(--text-muted)] flex items-center gap-2">
        <span>Showing <strong className="text-[var(--text-primary)]">{filteredCount}</strong> of <strong className="text-[var(--text-primary)]">{totalCount}</strong> members</span>
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

  const handleExportCSV = () => {
    try {
      const targetMembers = selectedMembers.length > 0 ? selectedMembers : allMembers;
      const headers = ['User ID', 'Username', 'Email', 'Org Role', 'Priority Rank', 'Assigned Teams Count', 'Active Tasks Count'];
      
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
      link.setAttribute('download', `ryokai_organization_roster_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Exported ${targetMembers.length} member records to CSV`);
    } catch (err) {
      toast.error('Failed to generate CSV file');
      console.error(err);
    }
  };

  const handleRoleSelect = async (roleIdStr) => {
    const roleId = parseInt(roleIdStr, 10);
    const targetRole = roles.find((r) => r.id === roleId);
    if (!targetRole || !onBulkUpdateRole) return;

    setIsProcessing(true);
    toast.loading(`Updating role to ${targetRole.name} for ${selectedIds.length} members...`, { id: 'bulk-role' });

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
              <span className="flex items-center justify-center w-8 h-8 rounded-xl bg-[var(--accent)] text-white font-bold text-xs shadow-sm">
                {selectedIds.length}
              </span>
              <div>
                <p className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
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
              {/* CSV Export Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isProcessing}
                className="text-xs h-8 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)] flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[var(--accent)]" />
                Export CSV
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
      <Modal open={confirmModalOpen} onOpenChange={(open) => { if (!isProcessing) setConfirmModalOpen(open); }}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle className="flex items-center gap-2 text-[var(--danger)]">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              Confirm Batch Member Removal
            </ModalTitle>
            <ModalDescription className="text-xs leading-relaxed pt-1">
              You are attempting to remove <strong className="text-[var(--text-primary)]">{selectedIds.length} members</strong> from the organization. Their active task assignments and team allocations will be unassigned or affected.
            </ModalDescription>
          </ModalHeader>

          <div className="py-3 space-y-3">
            <div className="p-3 rounded-lg bg-[var(--danger-soft)]/20 border border-[var(--danger-border)]/40 text-[11px] text-[var(--danger)] font-medium">
              ⚠️ This operation will sequentially revoke workspace access for all selected accounts.
            </div>

            {requireTypeConfirm && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-semibold text-[var(--text-secondary)] block">
                  Please type <strong className="text-[var(--danger)] font-mono">CONFIRM</strong> in all caps to authorize:
                </label>
                <input
                  type="text"
                  value={typeInput}
                  onChange={(e) => setTypeInput(e.target.value)}
                  placeholder="CONFIRM"
                  disabled={isProcessing}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-subtle)] text-sm font-mono tracking-widest font-bold text-[var(--text-primary)] outline-none focus:ring-2 focus:ring-[var(--danger)] transition-all"
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

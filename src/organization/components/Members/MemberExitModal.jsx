import React, { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { Button } from '@/shared/ui/Button';
import { Textarea } from '@/shared/ui/Textarea';
import { Text } from '@/shared/ui/Typography';
import { Label } from '@/shared/ui/Typography/Label';
import { Skeleton } from '@/shared/ui/Skeleton';
import { useExitBlockers, useRequestExit } from '@/organization/features/hooks/useOrganizations';
import { CheckCircle2, AlertCircle, ClipboardList, Folder, Users, ShieldAlert, ChevronRight } from '@/shared/ui/Icons';

export function MemberExitModal({ isOpen, onClose, orgId }) {
  const [reason, setReason] = useState('');
  const [desiredLastDay, setDesiredLastDay] = useState('');

  const { data: blockersData, isLoading: isLoadingBlockers } = useExitBlockers(orgId);
  const requestExitMut = useRequestExit(orgId);

  // Correctly extract 'details' from backend ExitBlockersDTO (fallback to blockers for compatibility)
  const blockers = blockersData?.details || blockersData?.blockers || [];
  const openTasksCount = blockersData?.openTasksCount || 0;
  const ownedProjectsCount = blockersData?.ownedProjectsCount || 0;
  const teamLeadCount = blockersData?.teamLeadCount || 0;
  const totalActiveItems = openTasksCount + ownedProjectsCount + teamLeadCount || blockers.length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    requestExitMut.mutate({
      reason,
      desiredLastDay: desiredLastDay || null,
    }, {
      onSuccess: () => {
        setReason('');
        setDesiredLastDay('');
        onClose();
      }
    });
  };

  const renderBlockerIcon = (text) => {
    if (text.toLowerCase().includes('task')) {
      return <ClipboardList className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
    }
    if (text.toLowerCase().includes('project')) {
      return <Folder className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />;
    }
    if (text.toLowerCase().includes('team') || text.toLowerCase().includes('lead')) {
      return <Users className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />;
    }
    return <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />;
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md bg-[var(--bg-elevated)] border border-[var(--border-subtle)] p-6">
        <ModalHeader className="pb-2 border-b border-[var(--border-subtle)]">
          <ModalTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            Request Organization Exit
          </ModalTitle>
        </ModalHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-3">
          <Text size="xs" variant="muted" className="leading-relaxed">
            Submitting an exit request initiates your membership departure. During your offboarding period, administrators will review and reassign your current active responsibilities.
          </Text>

          {/* Pre-exit Readiness & Active Tasks Check */}
          <div className="border border-[var(--border-subtle)] rounded-xl p-4 bg-[var(--bg-subtle)]/50 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-2.5">
              <span className="text-xs font-semibold text-[var(--text-primary)] tracking-tight">
                Pre-Exit Readiness & Roster Check
              </span>
              {!isLoadingBlockers && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  totalActiveItems === 0
                    ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                    : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                }`}>
                  {totalActiveItems === 0 ? 'Clear to Depart' : `${totalActiveItems} Active Responsibility${totalActiveItems > 1 ? 's' : ''}`}
                </span>
              )}
            </div>

            {isLoadingBlockers ? (
              <div className="space-y-2">
                <Skeleton className="h-6 w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4 rounded-lg" />
              </div>
            ) : blockers.length === 0 ? (
              <div className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-3 rounded-lg border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-medium text-[var(--text-primary)] block">Zero Pending Blockers</span>
                  <span className="text-[11px] text-[var(--text-muted)]">You have no active assigned tasks or team leadership roles. You are fully ready for smooth offboarding.</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2.5">
                {/* Summary Count Pills */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {openTasksCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      <ClipboardList className="w-3 h-3 text-amber-500" /> {openTasksCount} Assigned Task{openTasksCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {ownedProjectsCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      <Folder className="w-3 h-3 text-blue-400" /> {ownedProjectsCount} Owned Project{ownedProjectsCount > 1 ? 's' : ''}
                    </span>
                  )}
                  {teamLeadCount > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] px-2 py-0.5 rounded border border-[var(--border-subtle)]">
                      <Users className="w-3 h-3 text-indigo-400" /> {teamLeadCount} Team Lead Role{teamLeadCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                {/* Detailed Roster List */}
                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                  {blockers.map((blocker, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-[var(--text-secondary)] bg-[var(--bg-elevated)] p-2 rounded-lg border border-[var(--border-subtle)] transition-colors hover:border-[var(--border-default)]">
                      {renderBlockerIcon(blocker)}
                      <span className="leading-snug text-[11px] font-medium text-[var(--text-secondary)]">{blocker}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-1 border-t border-[var(--border-subtle)]">
                  <Text size="xs" variant="muted" className="text-[11px] flex items-center gap-1 text-amber-500/90">
                    <ShieldAlert className="w-3 h-3 shrink-0 text-amber-500" />
                    <span>These items will be highlighted for administrative handover during your offboarding period.</span>
                  </Text>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5 pt-1">
            <Label className="block text-xs font-medium text-[var(--text-secondary)]">
              Desired Last Active Date (Optional)
            </Label>
            <input
              type="date"
              value={desiredLastDay}
              onChange={e => setDesiredLastDay(e.target.value)}
              className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-medium text-[var(--text-secondary)]">
              Reason for Departure & Handover Notes
            </Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Provide context or instructions on your remaining tasks for team administrators..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <ModalFooter className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={requestExitMut.isPending}
              className="bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-base)] font-medium transition-opacity px-4"
            >
              Submit Exit Request
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

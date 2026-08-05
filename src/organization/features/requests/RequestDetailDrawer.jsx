import React from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/shared/ui/Drawer';
import { Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { useRequests } from './RequestsProvider';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import {
  Calendar,
  Clock,
  LogOut,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ShieldAlert,
  Sparkles,
  User,
  Info,
  ShieldCheck,
  FileText,
} from '@/shared/ui/Icons';
import { format } from 'date-fns';

export function RequestDetailDrawer({ request, isOpen, onClose }) {
  const { actions, canManageRequests, currentUserId } = useRequests();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  if (!request) return null;

  const isPending = request.status === 'PENDING' || request.status === 'OFFBOARDING';
  const isOwner = request.userId === currentUserId || request.user?.id === currentUserId;

  const handleApprove = async () => {
    if (request.requestType === 'EXIT') {
      const choice = await confirm({
        title: 'Approve Exit Request',
        description: 'Do you want to initiate an Offboarding period first, or immediately finalize membership termination?',
        confirmLabel: 'Move to Offboarding',
        cancelLabel: 'Immediate Exited status',
      });
      if (choice === true) {
        actions.approveRequest(request.id, 'EXIT', { offboarding: true }, { onSuccess: onClose });
      } else if (choice === false) {
        actions.approveRequest(request.id, 'EXIT', { offboarding: false }, { onSuccess: onClose });
      }
    } else {
      actions.approveRequest(request.id, request.requestType, null, { onSuccess: onClose });
    }
  };

  const handleReject = async () => {
    const reason = await confirm({
      title: 'Decline Request',
      description: 'Provide an optional explanation for declining this request.',
      requireInput: true,
      inputPlaceholder: 'Reason for declining...',
      confirmLabel: 'Decline',
      danger: true,
    });
    if (reason !== false) {
      actions.rejectRequest(request.id, request.requestType, reason || 'Declined', { onSuccess: onClose });
    }
  };

  const handleCancel = () => {
    actions.cancelRequest(request.id, request.requestType, null, { onSuccess: onClose });
  };

  const formatDateValue = (val) => {
    if (!val) return 'Not specified';
    try {
      return format(new Date(val), 'MMMM d, yyyy');
    } catch {
      return val;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
            <CheckCircle2 className="w-4 h-4" /> Approved & Locked
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="w-4 h-4" /> Rejected / Declined
          </span>
        );
      case 'OFFBOARDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-500 border border-amber-500/20">
            <ShieldAlert className="w-4 h-4" /> Offboarding Checklist Active
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-muted)] border border-[var(--border-subtle)]">
            Cancelled by Member
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--bg-subtle)] text-[var(--text-primary)] border border-[var(--border-default)]">
            <Clock className="w-4 h-4 text-[var(--text-secondary)]" /> Pending Admin Review
          </span>
        );
    }
  };

  return (
    <>
      {confirmDialog}
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="sm:max-w-lg overflow-y-auto flex flex-col justify-between h-full bg-[var(--bg-elevated)] border-l border-[var(--border-subtle)] p-6">
          <div className="space-y-6">
            <DrawerHeader className="border-b border-[var(--border-subtle)] pb-4 text-left">
              <div className="flex items-center gap-2 mb-2">
                {getStatusBadge(request.status)}
              </div>
              <DrawerTitle className="text-lg font-bold text-[var(--text-primary)] flex items-center gap-2">
                {request.requestType === 'EXIT' ? (
                  <>
                    <LogOut className="w-5 h-5 text-red-400" />
                    Organization Membership Exit
                  </>
                ) : (
                  <>
                    <Calendar className="w-5 h-5 text-[var(--text-primary)]" />
                    {request.leaveType || 'Workforce Time Off'} Request
                  </>
                )}
              </DrawerTitle>
              <DrawerDescription className="text-xs text-[var(--text-muted)] mt-1">
                Submitted on {formatDateValue(request.createdAt)}
              </DrawerDescription>
            </DrawerHeader>

            {/* Member Identity Details */}
            <div className="flex items-center gap-3 p-3 bg-[var(--bg-subtle)]/60 rounded-xl border border-[var(--border-subtle)]">
              <div className="w-11 h-11 rounded-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] flex items-center justify-center font-semibold text-base text-[var(--text-primary)] shadow-sm">
                {(request.username || 'U')[0].toUpperCase()}
              </div>
              <div>
                <Text className="font-semibold text-sm text-[var(--text-primary)]">
                  {request.username || request.user?.username || 'Team Member'}
                </Text>
                <Text size="xs" variant="muted">
                  Organization Member • Request ID #{request.id || 'N/A'}
                </Text>
              </div>
            </div>

            {/* Timeline & Duration Calculation Breakdown */}
            <div className="space-y-3">
              <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Timeline & Duration Analysis
              </Text>

              <div className="bg-[var(--bg-subtle)]/40 border border-[var(--border-subtle)] rounded-xl p-4 space-y-3 text-sm">
                {request.requestType === 'LEAVE' ? (
                  <>
                    {request.dateRange && (
                      <div className="flex items-center justify-between pb-2 border-b border-[var(--border-subtle)]">
                        <span className="text-[var(--text-secondary)] text-xs">Requested Period</span>
                        <span className="font-semibold text-[var(--text-primary)] text-xs">{request.dateRange}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1">
                        <span className="text-[11px] text-[var(--text-muted)]">Working Days Reserved</span>
                        <div className="text-lg font-bold text-[var(--text-primary)]">
                          {typeof request.workingDays === 'number' ? `${request.workingDays} days` : 'N/A'}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Excludes weekends & holidays</span>
                      </div>
                      <div className="space-y-1 border-l border-[var(--border-subtle)] pl-4">
                        <span className="text-[11px] text-[var(--text-muted)]">Calendar Duration</span>
                        <div className="text-lg font-semibold text-[var(--text-secondary)]">
                          {typeof request.calendarDays === 'number' ? `${request.calendarDays} days` : 'N/A'}
                        </div>
                        <span className="text-[10px] text-[var(--text-muted)] block">Total consecutive calendar dates</span>
                      </div>
                    </div>

                    {(request.isEmergency || request.isHalfDay) && (
                      <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)] mt-2">
                        {request.isEmergency && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Marked Emergency Absence
                          </span>
                        )}
                        {request.isHalfDay && (
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-subtle)] flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> Half Day Duration
                          </span>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)] text-xs">Desired Last Active Day</span>
                      <span className="font-semibold text-[var(--text-primary)]">
                        {request.desiredLastDay ? formatDateValue(request.desiredLastDay) : 'Immediate Departure'}
                      </span>
                    </div>
                    <Text size="xs" variant="muted" className="pt-1 block border-t border-[var(--border-subtle)]">
                      Initiates offboarding verification across active teams and tasks upon admin approval.
                    </Text>
                  </div>
                )}
              </div>
            </div>

            {/* Form Notes & Availability Reason */}
            <div className="space-y-2">
              <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" />
                Submitted Context & Reason
              </Text>
              <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-xl p-4 text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {request.reason || 'No detailed availability note or reason was supplied in the form.'}
              </div>
            </div>

            {/* Reviewer Comment History */}
            {request.adminComment && (
              <div className="space-y-1.5">
                <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-400" />
                  Reviewer Audit Note
                </Text>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {request.adminComment}
                </div>
              </div>
            )}

            {/* System Guardrail Impact Analysis */}
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-medium text-[var(--text-primary)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Assignment Validator Protection</span>
              </div>
              <Text size="xs" variant="muted" className="leading-relaxed">
                {request.status === 'APPROVED' || request.status === 'OFFBOARDING'
                  ? 'Active: Task assignment to this member is automatically blocked during this period by the centralized Task Hierarchy Validator.'
                  : 'Pending Activation: Once approved, the assignment validator will prevent new task distribution to this member during their absence or departure.'}
              </Text>
            </div>
          </div>

          {/* Bottom Action Bar */}
          <div className="pt-6 border-t border-[var(--border-subtle)] mt-auto flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close Panel
            </Button>

            {isPending && (
              <div className="flex items-center gap-2">
                {isOwner && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                    disabled={actions.isProcessing}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    Cancel Request
                  </Button>
                )}
                {canManageRequests && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleReject}
                      disabled={actions.isProcessing}
                      className="text-xs text-red-500 hover:bg-red-500/10 hover:text-red-600"
                    >
                      Decline
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleApprove}
                      disabled={actions.isProcessing}
                      className="text-xs bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent hover:opacity-90 font-medium px-4"
                    >
                      Approve Request
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}

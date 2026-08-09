import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRequests } from './RequestsProvider';
import { RequestDetailDrawer } from './RequestDetailDrawer';
import { Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Calendar, Clock, LogOut, AlertCircle, Sparkles, ChevronRight } from '@/shared/ui/Icons';
import { StatusBadge } from '@/shared/ui/StatusBadge';
import { formatRelative } from 'date-fns';

export function RequestCard({ request, index = 0 }) {
  const { actions, canManageRequests, currentUserId } = useRequests();
  const { confirm, dialog: confirmDialog } = useConfirmDialog();
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const isPending = request.status === 'PENDING' || request.status === 'OFFBOARDING';
  const isOwner = request.userId === currentUserId || request.user?.id === currentUserId;

  const handleApprove = async (e) => {
    e?.stopPropagation();
    if (request.requestType === 'EXIT') {
      const choice = await confirm({
        title: 'Approve Exit Request',
        description: 'Do you want to initiate an Offboarding period first, or immediately finalize membership termination?',
        confirmLabel: 'Move to Offboarding',
        cancelLabel: 'Immediate Exited status',
      });
      if (choice === true) {
        actions.approveRequest(request.id, 'EXIT', { offboarding: true });
      } else if (choice === false) {
        actions.approveRequest(request.id, 'EXIT', { offboarding: false });
      }
    } else {
      actions.approveRequest(request.id, request.requestType);
    }
  };

  const handleReject = async (e) => {
    e?.stopPropagation();
    const reason = await confirm({
      title: 'Decline Request',
      description: 'Provide an optional explanation for declining this request.',
      requireInput: true,
      inputPlaceholder: 'Reason for declining...',
      confirmLabel: 'Decline',
      danger: true,
    });
    if (reason !== false) {
      actions.rejectRequest(request.id, request.requestType, reason || 'Declined');
    }
  };

  const handleCancel = (e) => {
    e?.stopPropagation();
    actions.cancelRequest(request.id, request.requestType);
  };

  const getStatusIndicator = (status) => <StatusBadge status={status} variant="pill" />;

  const formatSubmittedDate = (val) => {
    try {
      if (!val) return '';
      return formatRelative(new Date(val), new Date());
    } catch {
      return 'Recently';
    }
  };

  return (
    <>
      {confirmDialog}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98 }}
        transition={{ duration: 0.15, delay: Math.min(index * 0.04, 0.3) }}
        onClick={() => setIsDetailOpen(true)}
        className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] hover:border-[var(--border-default)] rounded-xl p-5 transition-all duration-200 shadow-sm cursor-pointer hover:bg-[var(--bg-elevated)]/90"
      >
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[var(--bg-subtle)] border border-[var(--border-subtle)] flex items-center justify-center font-medium text-sm text-[var(--text-primary)] shrink-0">
              {(request.username || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <Text className="font-medium text-sm text-[var(--text-primary)]">
                  {request.username || request.user?.username || 'Team Member'}
                </Text>
                <span className="text-xs text-[var(--text-muted)]">•</span>
                <span className="text-xs text-[var(--text-muted)]">
                  {formatSubmittedDate(request.createdAt)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {request.requestType === 'EXIT' ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)]">
                <LogOut className="w-3 h-3 text-red-400" /> Membership Exit
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--text-secondary)] bg-[var(--bg-subtle)] px-2.5 py-0.5 rounded-md border border-[var(--border-subtle)]">
                <Calendar className="w-3 h-3 text-[var(--text-secondary)]" /> {request.leaveType || 'Time Off'}
              </span>
            )}
            {getStatusIndicator(request.status)}
          </div>
        </div>

        {/* Content Section */}
        <div className="py-3.5 space-y-3">
          <Text className="text-sm text-[var(--text-primary)] font-normal leading-relaxed line-clamp-2">
            {request.reason || 'No specific notes provided.'}
          </Text>

          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-2.5 text-xs text-[var(--text-secondary)]">
              {request.requestType === 'LEAVE' ? (
                <>
                  {request.dateRange && (
                    <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
                      <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>{request.dateRange}</span>
                    </div>
                  )}
                  {typeof request.workingDays === 'number' && (
                    <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
                      <Clock className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span className="font-medium text-[var(--text-primary)]">{request.workingDays} working days</span>
                    </div>
                  )}
                  {request.isEmergency && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--danger-soft)] text-red-400 border border-[var(--danger-border)] font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>Emergency</span>
                    </div>
                  )}
                  {request.isHalfDay && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[var(--bg-subtle)] text-[var(--text-secondary)] border border-[var(--border-subtle)] font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                      <span>Half Day</span>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-center gap-1.5 bg-[var(--bg-subtle)] px-2.5 py-1 rounded border border-[var(--border-subtle)]">
                    <LogOut className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                    <span>Desired departure: <strong className="text-[var(--text-primary)] font-medium">{request.desiredLastDay || 'Immediate'}</strong></span>
                  </div>
                </>
              )}
            </div>

            <span className="text-xs text-[var(--text-muted)] group-hover:text-[var(--text-primary)] flex items-center gap-1 transition-colors ml-auto font-medium">
              Inspect details <ChevronRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Action Bottom Bar */}
        {isPending && (
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--border-subtle)] mt-2" onClick={(e) => e.stopPropagation()}>
            {isOwner && request.status === 'PENDING' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancel}
                disabled={actions.isProcessing}
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                Cancel request
              </Button>
            )}
            {canManageRequests && request.status === 'PENDING' && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReject}
                  disabled={actions.isProcessing}
                  className="text-xs text-[var(--danger)] hover:bg-[var(--danger-soft)] hover:text-[var(--danger)]"
                >
                  Decline
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleApprove}
                  disabled={actions.isProcessing}
                  className="text-xs bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent hover:opacity-90 transition-opacity font-medium"
                >
                  Approve request
                </Button>
              </>
            )}
          </div>
        )}
      </motion.div>

      <RequestDetailDrawer
        request={request}
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
      />
    </>
  );
}

import React, { useState } from 'react';
import { useLeaveRequests, useApproveLeave, useRejectLeave, useRequestLeave } from '@/features/organizations/hooks/useOrganizations';
import { usePermissions } from '@/context/usePermissions';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Icons } from '@/shared/ui/Icons';
import { Modal, ModalContent } from '@/shared/ui/Modal';

export function LeaveRequestsTab({ orgId }) {
  const { data: requests = [], isLoading } = useLeaveRequests(orgId);
  const approveMutation = useApproveLeave(orgId);
  const rejectMutation = useRejectLeave(orgId);
  const { isSuperAdmin } = usePermissions();

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // We can loosely use isSuperAdmin here, but the backend requires ROLE_MANAGE
  // To keep it simple, we show admin actions if they have permission to manage members.
  // Actually, we'll assume admins will just see the buttons, and backend enforces it.
  
  const handleApprove = (id) => {
    approveMutation.mutate(id);
  };

  const handleReject = (id) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason !== null) {
      rejectMutation.mutate({ requestId: id, comment: reason || 'Declined' });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4 mt-6">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}
      </div>
    );
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <Heading level={3}>Leave Requests</Heading>
        <Button size="sm" onClick={() => setIsRequestModalOpen(true)}>
          <Icons.plus className="w-4 h-4 mr-1.5" />
          Request Leave
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-xl">
          <Text variant="muted">No leave requests pending.</Text>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <div key={req.id} className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Text className="font-medium text-[var(--text-primary)]">{req.username}</Text>
                  <Badge variant={req.status === 'APPROVED' ? 'success' : req.status === 'REJECTED' ? 'error' : 'outline'}>
                    {req.status}
                  </Badge>
                </div>
                <Text variant="muted" size="sm">
                  Reason: {req.reason || 'N/A'} 
                </Text>
                {req.adminComment && (
                  <Text variant="muted" size="sm" className="mt-1 text-[var(--accent-red)]">
                    Admin Comment: {req.adminComment}
                  </Text>
                )}
              </div>
              
              {req.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReject(req.id)}>Reject</Button>
                  <Button size="sm" onClick={() => handleApprove(req.id)}>Approve</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <RequestLeaveModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        orgId={orgId}
      />
    </div>
  );
}

function RequestLeaveModal({ isOpen, onClose, orgId }) {
  const [reason, setReason] = useState('');
  const requestMutation = useRequestLeave(orgId);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    requestMutation.mutate(reason, {
      onSuccess: () => {
        setReason('');
        onClose();
      }
    });
  };

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <Heading level={3} className="mb-4">Request Leave</Heading>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Reason</label>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="E.g., Vacation, Sick leave..."
              className="w-full bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] rounded-lg p-3 text-sm focus:outline-none focus:border-[var(--accent-cyan)]"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={requestMutation.isPending}>Submit Request</Button>
          </div>
        </form>
      </ModalContent>
    </Modal>
  );
}

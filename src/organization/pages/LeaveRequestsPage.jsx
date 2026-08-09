import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { PageHeader } from '@/shared/ui/PageHeader';
import { RequestsProvider, useRequests, RequestCard } from '@/organization';
import { Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '@/shared/ui/Modal';
import { Textarea } from '@/shared/ui/Textarea';
import { Label } from '@/shared/ui/Typography/Label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Plus, Inbox, Calendar, Clock, Sparkles, AlertCircle } from '@/shared/ui/Icons';
import {
  ModularToolbar,
} from '@/shared/workspace-framework';
import { SearchPlugin } from '@/shared/workspace-framework';
import { PageShell, PageHero, PageContent, PageToolbar } from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';

export function LeaveRequestsPage() {
  const { activeOrganization } = useWorkspace();
  const orgId = activeOrganization?.id;

  if (!orgId) return null;

  return (
    <PageShell maxWidth="default">
      <RequestsProvider orgId={orgId}>
        <RequestsInboxContent />
      </RequestsProvider>
    </PageShell>
  );
}

function RequestsInboxContent() {
  const {
    requests,
    isLoading,
    activeTypeFilter,
    setActiveTypeFilter,
    activeStatusFilter,
    setActiveStatusFilter,
    pendingCount,
    allRequestsCount,
  } = useRequests();

  const [searchQuery, setSearchQuery] = useState('');
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Apply responsive local search filtering
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return requests;
    const q = searchQuery.toLowerCase();
    return requests.filter((req) => {
      const nameMatch = (req.username || req.user?.username || '').toLowerCase().includes(q);
      const typeMatch = (req.leaveType || req.requestType || '').toLowerCase().includes(q);
      const reasonMatch = (req.reason || '').toLowerCase().includes(q);
      return nameMatch || typeMatch || reasonMatch;
    });
  }, [requests, searchQuery]);

  const pageState = isLoading ? 'loading' : filteredRequests.length === 0 ? 'empty' : 'ready';

  return (
    <>
      <PageHero
        eyebrow="Workforce & Membership"
        meta={`${allRequestsCount} request${allRequestsCount !== 1 ? 's' : ''} recorded`}
        title="Requests Inbox"
        subtitle="Review employee time-off availability schedules and organization membership exit workflows."
        actions={
          <Button variant="primary" onClick={() => setIsRequestModalOpen(true)} className="shrink-0 font-medium">
            <Plus className="w-4 h-4 mr-1.5" />
            Request Time Off
          </Button>
        }
      />
      <PageToolbar>
        <ModularToolbar
          left={
            <SearchPlugin
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search requests by name, type or reason..."
            />
          }
          right={
            <div className="flex items-center gap-4 flex-wrap text-xs">
              {/* Type Filter Pills */}
              <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)]">
                <ToolbarTab active={activeTypeFilter === 'ALL'} onClick={() => setActiveTypeFilter('ALL')}>
                  All ({allRequestsCount})
                </ToolbarTab>
                <ToolbarTab active={activeTypeFilter === 'LEAVE'} onClick={() => setActiveTypeFilter('LEAVE')}>
                  Time Off
                </ToolbarTab>
                <ToolbarTab active={activeTypeFilter === 'EXIT'} onClick={() => setActiveTypeFilter('EXIT')}>
                  Exits
                </ToolbarTab>
              </div>

              {/* Status Selector Pills */}
              <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)]">
                <ToolbarTab active={activeStatusFilter === 'PENDING'} onClick={() => setActiveStatusFilter('PENDING')}>
                  Pending ({pendingCount})
                </ToolbarTab>
                <ToolbarTab active={activeStatusFilter === 'APPROVED'} onClick={() => setActiveStatusFilter('APPROVED')}>
                  Approved
                </ToolbarTab>
                <ToolbarTab active={activeStatusFilter === 'REJECTED'} onClick={() => setActiveStatusFilter('REJECTED')}>
                  Rejected
                </ToolbarTab>
                <ToolbarTab active={activeStatusFilter === 'ALL'} onClick={() => setActiveStatusFilter('ALL')}>
                  Any Status
                </ToolbarTab>
              </div>
            </div>
          }
        />
      </PageToolbar>
      <PageContent>
        <PageState
          state={pageState}
          stateProps={{
            loading: { variant: 'cards' },
            empty: {
              icon: Inbox,
              title: 'No requests found',
              description: searchQuery.trim()
                ? 'No requests match your search criteria. Try clarifying your query.'
                : 'You are caught up! There are currently no active requests in this queue.',
            },
          }}
        >
          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {filteredRequests.map((req, idx) => (
                <RequestCard key={`${req.requestType}-${req.id}`} request={req} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        </PageState>

        <RequestLeaveModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
        />
      </PageContent>
    </>
  );
}

function ToolbarTab({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
        active
          ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm border border-[var(--border-subtle)]'
          : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]/50'
      }`}
    >
      {children}
    </button>
  );
}

function RequestLeaveModal({ isOpen, onClose }) {
  const { actions } = useRequests();
  const [reason, setReason] = useState('');
  const [leaveType, setLeaveType] = useState('VACATION');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isHalfDay, setIsHalfDay] = useState(false);
  const [isEmergency, setIsEmergency] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    actions.submitLeaveRequest({
      leaveType,
      reason,
      startDate: startDate || null,
      endDate: endDate || null,
      isHalfDay,
      isEmergency,
    }, {
      onSuccess: () => {
        setReason('');
        setStartDate('');
        setEndDate('');
        setIsHalfDay(false);
        setIsEmergency(false);
        onClose();
      }
    });
  };

  const leaveTypes = [
    { value: 'VACATION', label: 'Vacation & Holiday' },
    { value: 'SICK', label: 'Sick Leave & Health' },
    { value: 'EMERGENCY', label: 'Emergency Absence' },
    { value: 'WFH', label: 'Work From Home / Remote' },
    { value: 'COMP_OFF', label: 'Compensatory Off' },
    { value: 'MATERNITY', label: 'Maternity Leave' },
    { value: 'PATERNITY', label: 'Paternity Leave' },
    { value: 'BEREAVEMENT', label: 'Bereavement' },
  ];

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalContent className="sm:max-w-md">
        <ModalHeader>
          <ModalTitle className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
            Request Workforce Time Off
          </ModalTitle>
        </ModalHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-1">
          <div className="space-y-1.5">
            <Label className="block text-xs font-medium text-[var(--text-secondary)]">Category</Label>
            <Select
              value={leaveType}
              onValueChange={(val) => {
                setLeaveType(val);
                if (val === 'EMERGENCY') setIsEmergency(true);
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select time off category..." />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map(lt => (
                  <SelectItem key={lt.value} value={lt.value}>{lt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="block text-xs font-medium text-[var(--text-secondary)]">Start Date</Label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label className="block text-xs font-medium text-[var(--text-secondary)]">End Date</Label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-lg px-3 py-2 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--text-primary)] transition-colors"
                required
              />
            </div>
          </div>

          {/* Interactive Option Toggles */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => setIsHalfDay(!isHalfDay)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isHalfDay
                  ? 'bg-[var(--text-primary)] text-[var(--bg-base)] border-transparent'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Half Day</span>
            </button>

            <button
              type="button"
              onClick={() => setIsEmergency(!isEmergency)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                isEmergency
                  ? 'bg-red-500 text-white border-red-500'
                  : 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)] hover:text-red-400 hover:border-red-500/30'
              }`}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Emergency</span>
            </button>
          </div>

          <div className="space-y-1.5">
            <Label className="block text-xs font-medium text-[var(--text-secondary)]">Reason & Notes</Label>
            <Textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              placeholder="Add availability context or notes for your team lead..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <ModalFooter className="pt-2">
            <Button variant="ghost" size="sm" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={actions.isSubmittingLeave}
              className="bg-[var(--text-primary)] hover:opacity-90 text-[var(--bg-base)] font-medium transition-opacity"
            >
              Submit Time Off
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}

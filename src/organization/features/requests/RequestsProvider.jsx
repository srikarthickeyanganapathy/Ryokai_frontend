import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  useLeaveRequests,
  useApproveLeave,
  useRejectLeave,
  useCancelLeave,
  useRequestLeave,
  useExitRequests,
  useApproveExit,
  useRejectExit,
  useCancelExit,
  useRequestExit,
} from '@/organization';
import { usePermissions } from '@/identity';
import { useAuth } from '@/identity';

const RequestsContext = createContext(null);

export function RequestsProvider({ orgId, children }) {
  const [activeTypeFilter, setActiveTypeFilter] = useState('ALL'); // 'ALL', 'LEAVE', 'EXIT'
  const [activeStatusFilter, setActiveStatusFilter] = useState('PENDING'); // 'ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'

  const { data: leaveData = [], isLoading: leaveLoading, error: leaveError } = useLeaveRequests(orgId);
  const { data: exitData = [], isLoading: exitLoading, error: exitError } = useExitRequests(orgId);

  const approveLeaveMut = useApproveLeave(orgId);
  const rejectLeaveMut = useRejectLeave(orgId);
  const cancelLeaveMut = useCancelLeave(orgId);
  const requestLeaveMut = useRequestLeave(orgId);

  const approveExitMut = useApproveExit(orgId);
  const rejectExitMut = useRejectExit(orgId);
  const cancelExitMut = useCancelExit(orgId);
  const requestExitMut = useRequestExit(orgId);

  const { canManageLeaveRequests } = usePermissions();
  const { user } = useAuth();

  const isLoading = leaveLoading || exitLoading;
  const isError = Boolean(leaveError || exitError);

  const allRequests = useMemo(() => {
    const leaves = (Array.isArray(leaveData) ? leaveData : []).map(item => ({
      ...item,
      requestType: 'LEAVE',
      categoryTitle: item.leaveType ? `Time Off (${item.leaveType})` : 'Time Off Request',
      dateRange: item.startDate && item.endDate ? `${item.startDate} to ${item.endDate}` : null,
      workingDays: item.workingDays,
      calendarDays: item.calendarDays,
      isEmergency: item.isEmergency,
      isHalfDay: item.isHalfDay,
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    const exits = (Array.isArray(exitData) ? exitData : []).map(item => ({
      ...item,
      requestType: 'EXIT',
      categoryTitle: 'Membership Exit Request',
      dateRange: item.desiredLastDay ? `Last Day: ${item.desiredLastDay}` : null,
      createdAt: item.createdAt || new Date().toISOString(),
    }));

    const merged = [...leaves, ...exits];
    // Sort PENDING to top, then by recent creation
    return merged.sort((a, b) => {
      if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
      if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [leaveData, exitData]);

  const filteredRequests = useMemo(() => {
    return allRequests.filter(req => {
      if (activeTypeFilter !== 'ALL' && req.requestType !== activeTypeFilter) return false;
      if (activeStatusFilter !== 'ALL' && req.status !== activeStatusFilter) return false;
      return true;
    });
  }, [allRequests, activeTypeFilter, activeStatusFilter]);

  const approveRequest = (id, type, options = {}) => {
    if (type === 'LEAVE') {
      approveLeaveMut.mutate(id);
    } else if (type === 'EXIT') {
      approveExitMut.mutate({ requestId: id, offboarding: options.offboarding || false });
    }
  };

  const rejectRequest = (id, type, comment = 'Request declined by Admin') => {
    if (type === 'LEAVE') {
      rejectLeaveMut.mutate({ requestId: id, comment });
    } else if (type === 'EXIT') {
      rejectExitMut.mutate({ requestId: id, comment });
    }
  };

  const cancelRequest = (id, type) => {
    if (type === 'LEAVE') {
      cancelLeaveMut.mutate(id);
    } else if (type === 'EXIT') {
      cancelExitMut.mutate(id);
    }
  };

  const submitLeaveRequest = (payload, options = {}) => {
    requestLeaveMut.mutate(payload, options);
  };

  const submitExitRequest = (payload, options = {}) => {
    requestExitMut.mutate(payload, options);
  };

  const value = useMemo(() => ({
    orgId,
    requests: filteredRequests,
    allRequestsCount: allRequests.length,
    pendingCount: allRequests.filter(r => r.status === 'PENDING').length,
    isLoading,
    isError,
    activeTypeFilter,
    setActiveTypeFilter,
    activeStatusFilter,
    setActiveStatusFilter,
    canManageRequests: canManageLeaveRequests || user?.isSuperAdmin,
    currentUserId: user?.id,
    actions: {
      approveRequest,
      rejectRequest,
      cancelRequest,
      submitLeaveRequest,
      submitExitRequest,
      isSubmittingLeave: requestLeaveMut.isPending,
      isSubmittingExit: requestExitMut.isPending,
      isProcessing: approveLeaveMut.isPending || rejectLeaveMut.isPending || approveExitMut.isPending || rejectExitMut.isPending || cancelLeaveMut.isPending || cancelExitMut.isPending,
    }
  }), [
    orgId, filteredRequests, allRequests, isLoading, isError,
    activeTypeFilter, activeStatusFilter, canManageLeaveRequests, user,
    approveRequest, rejectRequest, cancelRequest, submitLeaveRequest, submitExitRequest,
    requestLeaveMut.isPending, requestExitMut.isPending,
    approveLeaveMut.isPending, rejectLeaveMut.isPending, approveExitMut.isPending, rejectExitMut.isPending, cancelLeaveMut.isPending, cancelExitMut.isPending
  ]);

  return (
    <RequestsContext.Provider value={value}>
      {children}
    </RequestsContext.Provider>
  );
}

export function useRequests() {
  const context = useContext(RequestsContext);
  if (!context) {
    throw new Error('useRequests must be used within a RequestsProvider');
  }
  return context;
}

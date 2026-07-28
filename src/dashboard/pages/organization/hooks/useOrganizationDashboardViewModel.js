import { useMemo } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useDashboardStats, useDashboardActivity } from '@/analytics';
import { useTaskList } from '@/task';
import { useAuth } from '@/identity';

export function useOrganizationDashboardViewModel() {
  const { activeOrganization } = useWorkspace();
  const { user } = useAuth();
  const orgId = activeOrganization?.id;

  const { data: rawStats, isLoading: isStatsLoading } = useDashboardStats({ scope: 'ORG', orgId });
  const { data: activityList = [], isLoading: isActivityLoading } = useDashboardActivity({ page: 0, size: 10 });
  const { data: rawTasks = [], isLoading: isTasksLoading } = useTaskList();

  const isLoading = isStatsLoading || isActivityLoading || isTasksLoading;

  // Filter tasks strictly for the active Organization - memoized
  const orgTasks = useMemo(() => {
    return rawTasks.filter(t => 
      t.mode === 'ORG' || 
      t.taskMode === 'ORG' || 
      t.organizationId === orgId || 
      t.orgId === orgId
    );
  }, [rawTasks, orgId]);

  // User's own contributions in this organization - memoized
  const myOrgTasks = useMemo(() => {
    return orgTasks.filter(t => 
      t.assigneeId === user?.id || 
      t.assignedTo === user?.username || 
      (typeof t.assignee === 'object' && t.assignee?.id === user?.id)
    );
  }, [orgTasks, user?.id, user?.username]);

  const totalTasks = rawStats?.totalTasks ?? orgTasks.length;
  const doneCount = rawStats?.doneCount ?? orgTasks.filter(t => t.status === 'Done' || t.currentStatus === 'COMPLETED' || t.currentStatus === 'APPROVED').length;
  const inReviewCount = rawStats?.inReviewCount ?? orgTasks.filter(t => t.status === 'SUBMITTED' || t.currentStatus === 'SUBMITTED' || t.status === 'In Review').length;
  const revisionsCount = rawStats?.revisionsCount ?? orgTasks.filter(t => t.status === 'REJECTED' || t.currentStatus === 'REJECTED' || t.status === 'Needs Work').length;

  const completionRate = rawStats?.myCompletionRate ?? (totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : 0);

  const health = useMemo(() => ({
    status: revisionsCount > 0 ? 'Needs Attention' : 'Healthy',
    totalTasks,
    activeTasks: (rawStats?.todoCount ?? 0) + inReviewCount,
    completedTasks: doneCount,
    atRisk: revisionsCount,
    velocity: `${completionRate}%`,
    myTaskCount: myOrgTasks.length
  }), [revisionsCount, totalTasks, rawStats?.todoCount, inReviewCount, doneCount, completionRate, myOrgTasks.length]);

  const kpis = useMemo(() => {
    return (rawStats?.statusBreakdown || []).map(sb => ({
      label: sb.status || 'Status',
      value: sb.count || 0,
      trend: sb.count > 0 ? 'up' : 'neutral'
    }));
  }, [rawStats?.statusBreakdown]);

  const pendingApprovals = useMemo(() => {
    return orgTasks
      .filter(t => t.status === 'SUBMITTED' || t.currentStatus === 'SUBMITTED' || t.status === 'In Review')
      .map(t => ({
        id: t.id,
        type: 'Task Review',
        requester: typeof t.assignee === 'object' ? (t.assignee?.username || 'Member') : (t.assignee || t.assignedTo || 'Member'),
        amount: t.title,
        date: t.dueDate || 'Pending'
      }));
  }, [orgTasks]);

  const activityStream = useMemo(() => {
    return (activityList || []).map((act, i) => ({
      id: act.id || i,
      user: typeof act.actor === 'object' ? (act.actor?.username || 'User') : (act.actor || 'User'),
      action: act.eventType ? act.eventType.toLowerCase().replace(/_/g, ' ') : 'updated',
      target: act.taskTitle || (act.taskId ? `Task #${act.taskId}` : ''),
      time: act.relativeTime || 'Recently'
    }));
  }, [activityList]);

  const riskCenter = useMemo(() => {
    return orgTasks
      .filter(t => t.status === 'REJECTED' || t.currentStatus === 'REJECTED' || t.status === 'Needs Work')
      .map(t => ({
        id: t.id,
        severity: 'High',
        issue: `Task "${t.title}" rejected: ${t.rejectionReason || 'Requires assignor reassignment'}`
      }));
  }, [orgTasks]);

  return {
    isLoading,
    organization: activeOrganization,
    health,
    kpis,
    pendingApprovals,
    activityStream,
    riskCenter,
    stats: rawStats,
    myOrgTasks
  };
}

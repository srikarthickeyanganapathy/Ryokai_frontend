import { useState, useMemo } from 'react';
import { useTaskList } from '@/task';
import { useDashboardStats, useDashboardActivity } from '@/analytics';
import { useCrews } from '@/crew';
import { useAuth } from '@/identity';

export function useCrewDashboardViewModel() {
  const { user } = useAuth();
  const { data: crews = [], isLoading: isCrewsLoading } = useCrews();
  const [selectedCrewId, setSelectedCrewId] = useState(null);

  const activeCrew = useMemo(() => {
    return selectedCrewId 
      ? (crews.find(c => c.id === selectedCrewId) || crews[0]) 
      : (crews[0] || null);
  }, [crews, selectedCrewId]);

  const crewId = activeCrew?.id;

  const { data: rawStats, isLoading: isStatsLoading } = useDashboardStats({ scope: 'CREWS', crewId });
  const { data: activityList = [], isLoading: isActivityLoading } = useDashboardActivity({ page: 0, size: 10 });
  const { data: rawTasks = [], isLoading: isTasksLoading } = useTaskList();

  // Filter tasks strictly for Crews - memoized
  const crewTasks = useMemo(() => {
    return rawTasks.filter(t => 
      t.mode === 'CREW' || 
      t.taskMode === 'CREW' || 
      !!t.crewId
    );
  }, [rawTasks]);

  // Active crew tasks filtered for currently selected crew - memoized
  const selectedCrewTasks = useMemo(() => {
    return crewId 
      ? crewTasks.filter(t => t.crewId === crewId)
      : crewTasks;
  }, [crewTasks, crewId]);

  // Work done by current user across crews - memoized
  const myCrewTasks = useMemo(() => {
    return crewTasks.filter(t => 
      t.assigneeId === user?.id || 
      t.assignedTo === user?.username || 
      (typeof t.assignee === 'object' && t.assignee?.id === user?.id)
    );
  }, [crewTasks, user?.id, user?.username]);

  const totalTasks = rawStats?.totalTasks ?? selectedCrewTasks.length;
  const doneCount = rawStats?.doneCount ?? selectedCrewTasks.filter(t => t.status === 'Done' || t.currentStatus === 'COMPLETED' || t.currentStatus === 'APPROVED').length;
  
  const progressPercent = totalTasks > 0 ? Math.round((doneCount / totalTasks) * 100) : (rawStats?.myCompletionRate ?? 0);

  const sprintStatus = useMemo(() => ({
    name: activeCrew?.name || 'All Crews Workspace',
    daysLeft: rawStats?.overdueCount ?? 0,
    totalPoints: totalTasks,
    completedPoints: doneCount,
    progress: progressPercent,
    status: (rawStats?.revisionsCount ?? 0) > 0 ? 'Needs Attention' : 'On Track',
    myTaskCount: myCrewTasks.length
  }), [activeCrew?.name, rawStats?.overdueCount, totalTasks, doneCount, progressPercent, rawStats?.revisionsCount, myCrewTasks.length]);

  const members = useMemo(() => {
    return (activeCrew?.members || []).map(m => ({
      id: m.id || m.userId,
      name: m.username || m.name || 'Member',
      role: m.role || 'Contributor',
      status: 'Active'
    }));
  }, [activeCrew?.members]);

  const recentActivity = useMemo(() => {
    return (activityList || []).map((act, i) => ({
      id: act.id || i,
      text: `${act.actor?.username || act.actor || 'User'} ${act.eventType ? act.eventType.toLowerCase().replace(/_/g, ' ') : 'updated'} "${act.taskTitle || 'task'}"`
    }));
  }, [activityList]);

  const activeTasks = useMemo(() => {
    return selectedCrewTasks
      .filter(t => t.status !== 'Done' && t.currentStatus !== 'APPROVED' && t.currentStatus !== 'COMPLETED')
      .slice(0, 5)
      .map(t => ({
        id: t.id,
        title: t.title,
        assignee: typeof t.assignee === 'object' ? (t.assignee?.username || 'Unassigned') : (t.assignee || t.assignedTo || 'Unassigned'),
        priority: t.priority || 'MEDIUM'
      }));
  }, [selectedCrewTasks]);

  return {
    isLoading: isStatsLoading || isActivityLoading || isTasksLoading || isCrewsLoading,
    crews,
    activeCrew,
    selectedCrewId,
    setSelectedCrewId,
    sprintStatus,
    members,
    recentActivity,
    activeTasks,
    myCrewTasks,
    stats: rawStats
  };
}

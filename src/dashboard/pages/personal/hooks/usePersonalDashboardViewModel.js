import { useState, useEffect, useMemo } from 'react';
import { useTaskList } from '@/task';
import { useDashboardStats } from '@/analytics';
import { recommendationRegistry } from '../../../entities/recommendation';
import { ExecutionEngine } from '../../../features/execution/ExecutionEngine';

const EMPTY_ARRAY = [];

export function usePersonalDashboardViewModel() {
  const { data: rawTasksData, isLoading: isTasksLoading } = useTaskList();
  const { data: stats, isLoading: isStatsLoading } = useDashboardStats({ scope: 'PERSONAL' });
  const [recommendations, setRecommendations] = useState(EMPTY_ARRAY);
  
  const rawTasks = rawTasksData || EMPTY_ARRAY;

  // Isolated to Personal workspace tasks ONLY - memoized to prevent re-render loops
  const personalTasks = useMemo(() => {
    if (rawTasks.length === 0) return EMPTY_ARRAY;
    return rawTasks.filter(t => 
      t.mode === 'PERSONAL' || 
      t.taskMode === 'PERSONAL' || 
      (!t.organizationId && !t.orgId && !t.crewId)
    );
  }, [rawTasks]);

  useEffect(() => {
    let isMounted = true;
    async function fetchRecommendations() {
      if (isTasksLoading || personalTasks.length === 0) {
        if (isMounted) {
          setRecommendations(prev => (prev.length === 0 ? prev : EMPTY_ARRAY));
        }
        return;
      }
      const context = { tasks: personalTasks };
      const recs = await recommendationRegistry.getRecommendations(context);
      if (isMounted) {
        setRecommendations(recs || EMPTY_ARRAY);
      }
    }
    fetchRecommendations();
    return () => { isMounted = false; };
  }, [personalTasks, isTasksLoading]);

  const topRecommendation = useMemo(() => {
    return recommendations.length > 0 ? recommendations[0] : null;
  }, [recommendations]);

  // Evaluate execution queue for personal tasks
  const executionQueueGroups = useMemo(() => {
    const evaluatedTasks = ExecutionEngine.evaluateTasks(personalTasks);
    return ExecutionEngine.groupTasksByState(evaluatedTasks);
  }, [personalTasks]);

  const completedCount = useMemo(() => {
    return stats?.doneCount ?? personalTasks.filter(t => t.status === 'Done' || t.currentStatus === 'APPROVED' || t.currentStatus === 'COMPLETED').length;
  }, [stats?.doneCount, personalTasks]);

  const remainingCount = useMemo(() => {
    return stats?.todoCount ?? personalTasks.filter(t => t.status !== 'Done' && t.currentStatus !== 'APPROVED' && t.currentStatus !== 'COMPLETED').length;
  }, [stats?.todoCount, personalTasks]);

  const overdueCount = stats?.overdueCount ?? 0;

  const todaySummary = useMemo(() => ({
    completed: completedCount,
    remaining: remainingCount,
    overdue: overdueCount,
    estimatedFinish: remainingCount > 0 ? `${remainingCount} personal tasks pending` : 'All personal tasks completed',
    focusScore: stats?.myCompletionRate != null ? `${stats.myCompletionRate}%` : (personalTasks.length > 0 ? `${Math.round((completedCount / personalTasks.length) * 100)}%` : '100%')
  }), [completedCount, remainingCount, overdueCount, stats?.myCompletionRate, personalTasks.length]);

  const projectOverview = useMemo(() => ({
    progress: stats?.myCompletionRate ?? (personalTasks.length > 0 ? Math.round((completedCount / personalTasks.length) * 100) : 0),
    health: overdueCount > 0 ? 'Needs Attention' : 'Healthy',
    timeLeft: 'Personal Workspace',
    nextMilestone: `${personalTasks.filter(t => t.currentStatus === 'SUBMITTED' || t.status === 'Review').length} In Review`,
    blocked: personalTasks.filter(t => t.currentStatus === 'REJECTED' || t.status === 'Blocked').length,
    recentActivity: `${personalTasks.length} Total Personal Tasks`
  }), [stats?.myCompletionRate, personalTasks, completedCount, overdueCount]);

  const myWorkGroups = useMemo(() => ({
    inProgress: personalTasks.filter(t => t.status === 'In Progress' || t.currentStatus === 'IN_PROGRESS' || t.status === 'To Do' || t.currentStatus === 'TODO'),
    waiting: personalTasks.filter(t => t.status === 'Waiting' || t.currentStatus === 'ASSIGNED'),
    review: personalTasks.filter(t => t.status === 'Review' || t.currentStatus === 'SUBMITTED'),
    blocked: personalTasks.filter(t => t.status === 'Blocked' || t.currentStatus === 'REJECTED')
  }), [personalTasks]);

  const agenda = useMemo(() => personalTasks.map((t, idx) => ({
    id: t.id || String(idx),
    time: t.dueDate || `Task #${idx + 1}`,
    title: t.title,
    type: t.currentStatus || t.status || 'PERSONAL'
  })), [personalTasks]);

  return {
    isLoading: isTasksLoading || isStatsLoading,
    recommendation: topRecommendation,
    executionQueueGroups,
    todaySummary,
    projectOverview,
    myWorkGroups,
    agenda,
    stats
  };
}

import { useState, useEffect } from 'react';
import { useTaskList } from '@/task';
import { recommendationRegistry } from '../../../entities/recommendation';
import { ExecutionEngine } from '../../../features/execution/ExecutionEngine';

export function usePersonalDashboardViewModel() {
  const { data: rawTasks = [], isLoading: isTasksLoading } = useTaskList();
  const [recommendations, setRecommendations] = useState([]);
  
  // Tasks specifically for the personal workspace (omitting logic for brevity, assuming rawTasks covers it)
  const personalTasks = rawTasks; 

  useEffect(() => {
    async function fetchRecommendations() {
      if (isTasksLoading) return;
      const context = { tasks: personalTasks };
      const recs = await recommendationRegistry.getRecommendations(context);
      setRecommendations(recs);
    }
    fetchRecommendations();
  }, [personalTasks, isTasksLoading]);

  const topRecommendation = recommendations.length > 0 ? recommendations[0] : null;

  // Process data for presentation components
  const evaluatedTasks = ExecutionEngine.evaluateTasks(personalTasks);
  const executionQueueGroups = ExecutionEngine.groupTasksByState(evaluatedTasks);

  const todaySummary = {
    completed: personalTasks.filter(t => t.status === 'Done').length,
    remaining: personalTasks.filter(t => t.status !== 'Done' && t.status !== 'Canceled').length,
    overdue: 0, // Mock implementation
    estimatedFinish: '5:40 PM',
    focusScore: 'High'
  };

  const projectOverview = {
    progress: 72,
    health: 'Good',
    timeLeft: '3 Days',
    nextMilestone: 'Beta Launch',
    blocked: 1,
    recentActivity: 'Design updated'
  };

  const myWorkGroups = {
    inProgress: personalTasks.filter(t => t.status === 'In Progress'),
    waiting: personalTasks.filter(t => t.status === 'Waiting'),
    review: personalTasks.filter(t => t.status === 'Review'),
    blocked: personalTasks.filter(t => t.status === 'Blocked')
  };

  const agenda = [
    { id: '1', time: '09:00', title: 'Design Review', type: 'meeting' },
    { id: '2', time: '10:30', title: 'Deep Work', type: 'focus' },
    { id: '3', time: '12:00', title: 'Submit PR', type: 'task' },
    { id: '4', time: '15:00', title: 'Client Call', type: 'meeting' }
  ];

  return {
    isLoading: isTasksLoading,
    recommendation: topRecommendation,
    executionQueueGroups,
    todaySummary,
    projectOverview,
    myWorkGroups,
    agenda
  };
}

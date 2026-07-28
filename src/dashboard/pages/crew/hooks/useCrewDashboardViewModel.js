import { useState, useEffect } from 'react';

export function useCrewDashboardViewModel() {
  const [isLoading, setIsLoading] = useState(true);

  const sprintStatus = {
    name: 'Sprint 14',
    daysLeft: 4,
    totalPoints: 42,
    completedPoints: 28,
    progress: 66,
    status: 'On Track'
  };

  const members = [
    { id: 1, name: 'Alice M.', role: 'Lead', status: 'Online' },
    { id: 2, name: 'John D.', role: 'Developer', status: 'In a meeting' },
    { id: 3, name: 'Sarah K.', role: 'Designer', status: 'Offline' }
  ];

  const recentActivity = [
    { id: 1, text: 'Sarah uploaded new assets for the landing page.' },
    { id: 2, text: 'John moved "API Integration" to In Progress.' },
    { id: 3, text: 'Alice created a new PR.' }
  ];

  const activeTasks = [
    { id: 1, title: 'Build recommendation engine', assignee: 'John', priority: 'High' },
    { id: 2, title: 'Design new marketing site', assignee: 'Sarah', priority: 'Medium' }
  ];

  useEffect(() => {
    // Simulate API fetch for crew data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return {
    isLoading,
    sprintStatus,
    members,
    recentActivity,
    activeTasks
  };
}

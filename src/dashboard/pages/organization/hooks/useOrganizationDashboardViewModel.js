import { useState, useEffect } from 'react';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export function useOrganizationDashboardViewModel() {
  const { activeOrganization } = useWorkspace();
  const [isLoading, setIsLoading] = useState(true);

  // Mocking the data for the view model
  const health = {
    status: 'Healthy',
    activeProjects: 12,
    atRisk: 2,
    velocity: '+14%'
  };

  const kpis = [
    { label: 'Engineering', value: 92, trend: 'up' },
    { label: 'Design', value: 88, trend: 'up' },
    { label: 'Marketing', value: 76, trend: 'down' }
  ];

  const pendingApprovals = [
    { id: 1, type: 'Expense', requester: 'Alice M.', amount: '$450', date: 'Today' },
    { id: 2, type: 'Leave', requester: 'John D.', amount: '3 Days', date: 'Yesterday' }
  ];

  const activityStream = [
    { id: 1, user: 'Sarah K.', action: 'merged PR', target: '#452 to core-api', time: '10m ago' },
    { id: 2, user: 'Mike R.', action: 'completed milestone', target: 'Q3 Planning', time: '1h ago' },
    { id: 3, user: 'Design Team', action: 'published', target: 'new design system', time: '3h ago' }
  ];

  const riskCenter = [
    { id: 1, severity: 'High', issue: 'Project Alpha is 2 weeks behind schedule.' },
    { id: 2, severity: 'Medium', issue: 'Engineering capacity at 95% utilization.' }
  ];

  useEffect(() => {
    // Simulate API fetch for org data
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeOrganization]);

  return {
    isLoading,
    organization: activeOrganization,
    health,
    kpis,
    pendingApprovals,
    activityStream,
    riskCenter
  };
}

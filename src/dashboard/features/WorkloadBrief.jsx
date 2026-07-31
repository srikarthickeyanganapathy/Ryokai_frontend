import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export function WorkloadBrief() {
  const { activeOrganization } = useWorkspace();

  const { data: workloadMatrix, isLoading } = useQuery({
    queryKey: ['workload', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const res = await api.get(`/organizations/${activeOrganization.id}/workload`);
      return res.data;
    },
    enabled: !!activeOrganization
  });

  if (isLoading) {
    return <Card><CardContent className="p-6">Loading workload...</CardContent></Card>;
  }

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle>Workload Brief</CardTitle>
      </CardHeader>
      <CardContent>
        {workloadMatrix?.length === 0 ? (
          <div className="text-sm text-ui-text-muted">No workload data available.</div>
        ) : (
          <div className="space-y-4">
            {workloadMatrix?.slice(0, 5).map(member => (
              <div key={member.user.id} className="flex justify-between items-center text-sm">
                <span>{member.user.username}</span>
                <span className="text-ui-text-muted">{member.totalActiveCount} tasks</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
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
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
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

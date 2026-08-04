import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissions } from '@/identity/features/authentication/hooks/usePermissions';

export function OrganizationGoals() {
  const { activeOrganization } = useWorkspace();
  const { canViewGoals } = usePermissions();

  const { data: goals, isLoading } = useQuery({
    queryKey: ['org_goals', activeOrganization?.id],
    queryFn: async () => {
      if (!activeOrganization) return [];
      const res = await api.get(`/organizations/${activeOrganization.id}/goals`);
      return res.data;
    },
    enabled: !!activeOrganization && canViewGoals
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle>Organization Goals</CardTitle>
      </CardHeader>
      <CardContent>
        {goals?.length === 0 ? (
          <div className="text-sm text-ui-text-muted">No goals set for this organization.</div>
        ) : (
          <div className="space-y-4">
            {goals?.slice(0, 3).map(goal => (
              <div key={goal.id} className="text-sm">
                <div className="font-medium text-ui-text">{goal.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-ui-border rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-ui-primary" 
                      style={{ width: `${goal.progress || 0}%` }} 
                    />
                  </div>
                  <span className="text-xs text-ui-text-muted w-8">{Math.round(goal.progress || 0)}%</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

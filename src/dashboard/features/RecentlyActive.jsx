import React from 'react';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export function RecentlyActive() {
  const { activeCrew } = useWorkspace();

  const { data: members, isLoading } = useQuery({
    queryKey: ['crew_members', activeCrew?.id],
    queryFn: async () => {
      if (!activeCrew) return [];
      const res = await api.get(`/crews/${activeCrew.id}/members`);
      return res.data;
    },
    enabled: !!activeCrew
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  // Sort by lastLoginAt descending
  const sortedMembers = [...(members || [])].sort((a, b) => {
    if (!a.lastLoginAt) return 1;
    if (!b.lastLoginAt) return -1;
    return new Date(b.lastLoginAt).getTime() - new Date(a.lastLoginAt).getTime();
  });

  return (
    <Card variant="interactive">
      <CardHeader>
        <CardTitle>Recently Active</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedMembers.slice(0, 5).map(member => (
            <div key={member.userId} className="flex justify-between items-center text-sm">
              <span className="text-ui-text">{member.username}</span>
              <span className="text-xs text-ui-text-muted">
                {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

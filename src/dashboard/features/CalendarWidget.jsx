import React, { useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { queryKeys } from '@/shared/api/queryKeys';
import { Calendar, ArrowRight } from '@/shared/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export function CalendarWidget() {
  const navigate = useNavigate();
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace();

  // Scope follows the active workspace lens so the Dashboard never mixes
  // personal events into org/crew views (or vice versa).
  const scopeParams = useMemo(() => {
    if (workspaceMode === 'ORG' && activeOrganization?.id) return { orgId: activeOrganization.id };
    if (workspaceMode === 'CREWS' && activeCrew?.id) return { crewId: activeCrew.id };
    return {};
  }, [workspaceMode, activeOrganization?.id, activeCrew?.id]);

  const { today, nextWeek } = useMemo(() => {
    const now = new Date();
    const t = now.toISOString().split('T')[0];
    const nw = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return { today: t, nextWeek: nw };
  }, []);

  const scopeKey = scopeParams.orgId
    ? `org:${scopeParams.orgId}`
    : scopeParams.crewId
      ? `crew:${scopeParams.crewId}`
      : 'personal';

  const { data: events = [], isLoading, isError, error } = useQuery({
    queryKey: queryKeys.calendarEvents.range(today, nextWeek, scopeKey),
    queryFn: async () => {
      const startDateTime = `${today}T00:00:00`;
      const endDateTime = `${nextWeek}T23:59:59`;
      const res = await api.get('/calendar-events', {
        params: { start: startDateTime, end: endDateTime, ...scopeParams }
      });
      return Array.isArray(res.data) ? res.data : res.data?.content || [];
    },
    retry: false, // Calendar events are non-critical; don't hammer on failure
    staleTime: 30000,
  });

  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4 text-[var(--accent)]" />
            Upcoming Events
          </CardTitle>
          <button
            onClick={() => navigate('/app/calendar')}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="py-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">Could not load events</p>
          </div>
        ) : events.length === 0 ? (
          <div className="py-4 text-center">
            <p className="text-xs text-[var(--text-tertiary)]">No events in the next 7 days</p>
            <button
              onClick={() => navigate('/app/calendar')}
              className="mt-1 text-xs text-[var(--accent)] hover:underline"
            >
              Plan something
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            {events.slice(0, 4).map((event) => (
              <button
                key={event.id}
                onClick={() => navigate('/app/calendar')}
                className="w-full text-left flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors"
              >
                <div className="shrink-0 w-1.5 h-8 rounded-full bg-[var(--accent)]/60" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">
                    {event.title}
                  </p>
                  <p className="text-[11px] text-[var(--text-tertiary)]">
                    {new Date(event.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {' · '}
                    {new Date(event.startTime).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

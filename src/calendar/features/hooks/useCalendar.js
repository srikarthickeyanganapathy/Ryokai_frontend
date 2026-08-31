import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as calendarApi from '../api/calendar.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { normalizeCalendarEvent } from '../../entities/model/normalizer';
import { toast } from 'sonner';

/**
 * Derive a stable scope key from workspace scope for query key partitioning.
 */
const scopeKey = (scope) => {
  if (scope?.orgId) return `org:${scope.orgId}`;
  if (scope?.crewId) return `crew:${scope.crewId}`;
  return 'personal';
};

export { scopeKey };

/**
 * Fetch events for a date range + workspace scope.
 */
export function useCalendarEvents(start, end, scope = {}) {
  const sk = scopeKey(scope);
  const isPendingScope = scope?.orgId === 'pending' || scope?.crewId === 'pending';
  
  return useQuery({
    queryKey: queryKeys.calendarEvents.range(start, end, sk),
    queryFn: async () => {
      const events = await calendarApi.getCalendarEvents(start, end, scope);
      return Array.isArray(events) ? events.map(normalizeCalendarEvent) : events;
    },
    enabled: !!start && !!end && !isPendingScope,
  });
}

export function useCreateEvent(scope = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => calendarApi.createCalendarEvent(payload, scope),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
    onError: () => toast.error('Could not create event'),
  });
}

/**
 * Update event with optimistic UI -- patches all cached calendar event
 * query arrays in-place, rolls back on error.
 */
export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => calendarApi.updateCalendarEvent(id, payload),
    onMutate: async ({ id, payload }) => {
      await queryClient.cancelQueries({ queryKey: ['calendarEvents'] });
      const snapshots = {};
      queryClient.getQueriesData({ queryKey: ['calendarEvents'] }).forEach(([k, data]) => {
        snapshots[k] = data;
        if (Array.isArray(data)) {
          queryClient.setQueryData(k, data.map(ev =>
            ev.id === id ? { ...ev, ...payload, id } : ev
          ));
        }
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.snapshots) {
        Object.entries(ctx.snapshots).forEach(([k, data]) => {
          queryClient.setQueryData(k, data);
        });
      }
      toast.error('Could not update event');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calendarApi.deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['calendarEvents'] });
    },
    onError: () => toast.error('Could not delete event'),
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as calendarApi from '../api/calendar.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export function useCalendarEvents(start, end) {
  return useQuery({
    queryKey: queryKeys.calendarEvents.range(start, end),
    queryFn: () => calendarApi.getCalendarEvents(start, end),
    enabled: !!start && !!end,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calendarApi.createCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents.all });
    },
    onError: () => toast.error('Could not create event'),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => calendarApi.updateCalendarEvent(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents.all });
    },
    onError: () => toast.error('Could not update event'),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: calendarApi.deleteCalendarEvent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.calendarEvents.all });
    },
    onError: () => toast.error('Could not delete event'),
  });
}

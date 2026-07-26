import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as focusApi from '../api/focus.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export function useActiveFocus() {
  return useQuery({
    queryKey: queryKeys.focus.active,
    queryFn: focusApi.getActiveFocusSession,
    staleTime: 0, // always revalidate on mount so page-refresh resumes accurately
  });
}

export function useFocusHistory(params = {}) {
  return useQuery({
    queryKey: queryKeys.focus.history(params),
    queryFn: () => focusApi.getFocusHistory(params),
  });
}

export function useStartFocus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => focusApi.startFocusSession(taskId),
    onSuccess: (session) => {
      queryClient.setQueryData(queryKeys.focus.active, session);
    },
    onError: () => toast.error('Could not start focus session'),
  });
}

export function useStopFocus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (sessionId) => focusApi.stopFocusSession(sessionId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.focus.active, null);
      queryClient.invalidateQueries({ queryKey: queryKeys.focus.history({}) });
    },
    onError: () => toast.error('Could not save focus session'),
  });
}

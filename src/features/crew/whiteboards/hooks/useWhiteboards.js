import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as whiteboardApi from '../api/whiteboard.api';
import { queryKeys } from '@/shared/api/queryKeys';

export const useWhiteboards = (crewId) => useQuery({
  queryKey: queryKeys.crews.whiteboards(crewId),
  queryFn: () => whiteboardApi.getWhiteboards(crewId),
  enabled: !!crewId,
});

export const useCreateWhiteboard = (crewId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title) => whiteboardApi.createWhiteboard(crewId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.crews.whiteboards(crewId) }),
  });
};

export const useDeleteWhiteboard = (crewId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId) => whiteboardApi.deleteWhiteboard(crewId, boardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.crews.whiteboards(crewId) }),
  });
};


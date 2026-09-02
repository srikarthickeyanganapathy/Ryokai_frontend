import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as whiteboardApi from '../api/whiteboard.api';
import { queryKeys } from '@/shared/api/queryKeys';

// ── Crew whiteboards ──────────────────────────────────────────────────────

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

// ── Organization whiteboards (isolated scope) ────────────────────────────

export const useOrgWhiteboards = (orgId) => useQuery({
  queryKey: queryKeys.organizations.whiteboards(orgId),
  queryFn: () => whiteboardApi.getOrgWhiteboards(orgId),
  enabled: !!orgId,
});

export const useCreateOrgWhiteboard = (orgId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title) => whiteboardApi.createOrgWhiteboard(orgId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.whiteboards(orgId) }),
  });
};

export const useDeleteOrgWhiteboard = (orgId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId) => whiteboardApi.deleteOrgWhiteboard(orgId, boardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.whiteboards(orgId) }),
  });
};

// ── Team whiteboards (organization mode, team-scoped) ────────────────────

export const useTeamWhiteboards = (orgId, teamId) => useQuery({
  queryKey: queryKeys.organizations.teamWhiteboards(orgId, teamId),
  queryFn: () => whiteboardApi.getTeamWhiteboards(orgId, teamId),
  enabled: !!orgId && !!teamId,
});

export const useCreateTeamWhiteboard = (orgId, teamId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (title) => whiteboardApi.createTeamWhiteboard(orgId, teamId, title),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.teamWhiteboards(orgId, teamId) }),
  });
};

export const useDeleteTeamWhiteboard = (orgId, teamId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId) => whiteboardApi.deleteTeamWhiteboard(orgId, teamId, boardId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.organizations.teamWhiteboards(orgId, teamId) }),
  });
};

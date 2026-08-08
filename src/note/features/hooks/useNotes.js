import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notesApi from '../api/notes.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { normalizeNote } from '../../entities/model/normalizer';
import { toast } from 'sonner';

/**
 * Derive a stable scope key from workspace scope for query key partitioning.
 * Empty object = personal (no suffix needed, matches unscoped).
 */
export const scopeKey = (scope) => {
  if (scope?.orgId) return `org:${scope.orgId}`;
  if (scope?.crewId) return `crew:${scope.crewId}`;
  return 'personal';
};

/**
 * Hook: fetch notes for a given workspace scope.
 * @param {{ orgId?: number, crewId?: number }} scope
 */
export const useNotes = (scope = {}) => useQuery({
  queryKey: queryKeys.notes.scoped(scopeKey(scope)),
  queryFn: async () => {
    const notes = await notesApi.getNotes(scope);
    return Array.isArray(notes) ? notes.map(normalizeNote) : notes;
  },
});

export const useCreateNote = (scope = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => notesApi.createNote(payload, scope),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    onError: () => toast.error('Could not create note'),
  });
};

export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => notesApi.updateNote(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    onError: () => toast.error('Could not update note'),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notes'] }),
    onError: () => toast.error('Could not delete note'),
  });
};

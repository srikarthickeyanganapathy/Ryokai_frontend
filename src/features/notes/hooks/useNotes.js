import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as notesApi from '../api/notes.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export const useNotes = () => useQuery({
  queryKey: queryKeys.notes.all,
  queryFn: notesApi.getNotes,
});

export const useCreateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesApi.createNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: () => toast.error('Could not create note'),
  });
};

export const useUpdateNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => notesApi.updateNote(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: () => toast.error('Could not update note'),
  });
};

export const useDeleteNote = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.notes.all }),
    onError: () => toast.error('Could not delete note'),
  });
};

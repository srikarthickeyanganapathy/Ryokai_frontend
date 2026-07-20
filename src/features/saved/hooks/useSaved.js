import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savedApi from '../api/saved.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export const useSavedItems = () => useQuery({
  queryKey: queryKeys.saved.all,
  queryFn: savedApi.getSavedItems,
});

export const useToggleSave = () => {
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: ({ entityType, entityId }) => savedApi.saveItem(entityType, entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.saved.all }),
    onError: () => toast.error('Could not save item'),
  });
  const unsave = useMutation({
    mutationFn: ({ entityType, entityId }) => savedApi.unsaveItem(entityType, entityId),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.saved.all }),
    onError: () => toast.error('Could not remove item'),
  });
  return { save, unsave };
};

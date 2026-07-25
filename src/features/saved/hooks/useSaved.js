import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as savedApi from '../api/saved.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';
import { useMemo } from 'react';

export const useSavedItems = () => useQuery({
  queryKey: queryKeys.saved.all,
  queryFn: savedApi.getSavedItems,
});

/**
 * Hook to manage local optimistic save state.
 * Uses a memoized selector to keep lookups fast.
 */
export const useSaveState = (entityType, entityId) => {
  const queryClient = useQueryClient();

  const { data: items = [] } = useQuery({
    queryKey: queryKeys.saved.all,
    queryFn: savedApi.getSavedItems,
  });

  // O(1) lookup map for fast checks
  const savedMap = useMemo(() => {
    const map = new Map();
    items.forEach(item => {
      map.set(`${item.entityType}:${item.entityId}`, true);
    });
    return map;
  }, [items]);

  const isSaved = savedMap.has(`${entityType}:${entityId}`);

  const toggle = useMutation({
    mutationFn: async () => {
      if (isSaved) {
        return savedApi.unsaveItem(entityType, entityId);
      } else {
        return savedApi.saveItem(entityType, entityId);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.saved.all });
      const previousItems = queryClient.getQueryData(queryKeys.saved.all);

      if (previousItems) {
        queryClient.setQueryData(queryKeys.saved.all, old => {
          if (isSaved) {
            return old.filter(item => !(item.entityType === entityType && String(item.entityId) === String(entityId)));
          } else {
            return [...old, { entityType, entityId, id: `optimistic-${Date.now()}` }];
          }
        });
      }
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(queryKeys.saved.all, context.previousItems);
      }
      toast.error(`Could not ${isSaved ? 'remove bookmark' : 'bookmark item'}`);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.saved.all });
    },
  });

  return {
    isSaved,
    toggle: toggle.mutate,
    isPending: toggle.isPending
  };
};

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

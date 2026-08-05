import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';

export const useEntityInspector = (entityType, entityId) => {
  return useQuery({
    queryKey: ['inspector', entityType, entityId],
    queryFn: async () => {
      if (!entityId || !entityType) return null;
      const response = await api.get(`/inspector/${entityType}/${entityId}`);
      return response.data;
    },
    enabled: !!entityId && !!entityType,
  });
};

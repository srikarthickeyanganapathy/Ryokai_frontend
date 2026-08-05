import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/api';
import { queryKeys } from '@/shared/api/queryKeys';

export const useActiveFocus = () => {
  return useQuery({
    queryKey: queryKeys.focus.active,
    queryFn: async () => {
      const response = await api.get('/focus/active');
      return response.data; // Expecting { isActive: boolean, timeRemaining: string, etc }
    }
  });
};

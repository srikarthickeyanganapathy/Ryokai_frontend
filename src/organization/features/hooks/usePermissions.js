import { useQuery } from '@tanstack/react-query';
import * as permissionApi from '../api/permission.api';

export const usePermissionCatalog = (options = {}) => {
  return useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionApi.getPermissionCatalog(),
    staleTime: 1000 * 60 * 60, // 1 hour caching
    ...options,
  });
};

import { useQuery } from '@tanstack/react-query';
import * as permissionApi from '../api/permission.api';

export const usePermissionCatalog = (options = {}) => {
  return useQuery({
    queryKey: ['permissions', 'catalog'],
    queryFn: () => permissionApi.getPermissionCatalog(),
    staleTime: 0, // Disable long caching during active development
    ...options,
  });
};

import api from '@/shared/api/api';

export const getPermissionCatalog = async () => {
  const response = await api.get('/permissions/catalog?v=2');
  return response.data;
};

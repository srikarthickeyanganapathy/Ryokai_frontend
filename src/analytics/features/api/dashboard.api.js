import api from '@/shared/api/api';

export const getDashboardStats = async (params = {}) => {
  const { data } = await api.get('/dashboard/stats', { params });
  return data;
};



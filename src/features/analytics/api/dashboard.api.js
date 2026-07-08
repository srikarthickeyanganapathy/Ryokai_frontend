import api from '@/lib/api';

export const getDashboardStats = async () => {
  const { data } = await api.get('/dashboard/stats');
  return data;
};

export const getDashboardActivity = async (params) => {
  const { data } = await api.get('/dashboard/activity', { params });
  return data;
};

export const exportActivity = async (format = 'csv') => {
  // Correct path per DashboardController — NOT /admin/export/activity
  const { data } = await api.get('/dashboard/activity/export', {
    params: { format },
    responseType: 'blob',
  });
  return data;
};

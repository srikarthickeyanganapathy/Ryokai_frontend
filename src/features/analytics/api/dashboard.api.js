import api from '@/shared/api/api';

export const getDashboardStats = async (params = {}) => {
  const { data } = await api.get('/dashboard/stats', { params });
  return data;
};

export const getDashboardActivity = async (params) => {
  const { data } = await api.get('/dashboard/activity', { params });
  return data;
};

export const getTaskActivity = async (taskId, params) => {
  const { data } = await api.get(`/dashboard/activity/task/${taskId}`, { params });
  return data;
};

export const exportActivity = async (params = {}) => {
  // params: { format: 'csv' | 'pdf', from, to }
  // Correct path per DashboardController — NOT /admin/export/activity
  const { data } = await api.get('/dashboard/activity/export', {
    params,
    responseType: 'blob',
  });
  return data;
};


import api from '@/lib/api';

/** Normalize backend read → isRead; drop the raw read field to avoid confusion */
const normalizeNotification = (n) => {
  const { read, ...rest } = n;
  return { ...rest, isRead: !!read };
};

export const getNotifications = async (params) => {
  const { data } = await api.get('/notifications', { params });
  if (Array.isArray(data)) return data.map(normalizeNotification);
  if (data?.content) return { ...data, content: data.content.map(normalizeNotification) };
  return data;
};

export const getUnreadCount = async () => {
  const { data } = await api.get('/notifications/unread/count');
  return data.count;
};

export const markAsRead = async (id) => {
  await api.put(`/notifications/${id}/read`);
};

export const markAllRead = async () => {
  await api.put('/notifications/read-all');
};

export const deleteNotification = async (id) => {
  await api.delete(`/notifications/${id}`);
};

import api from '@/lib/api';

export const getAnnouncements = async (orgId, params) => {
  const response = await api.get(`/organizations/${orgId}/announcements`, { params });
  return response.data;
};

export const createAnnouncement = async (orgId, payload) => {
  const response = await api.post(`/organizations/${orgId}/announcements`, payload);
  return response.data;
};

export const deleteAnnouncement = async (orgId, announcementId) => {
  const response = await api.delete(`/organizations/${orgId}/announcements/${announcementId}`);
  return response.data;
};

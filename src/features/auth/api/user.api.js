import api from '@/lib/api';

export const getMe = async () => {
  const { data } = await api.get('/users/me');
  return data;
};

export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return data;
};

export const updateProfile = async (profileData) => {
  // profileData: { email, fullName, bio, emailNotificationsEnabled }
  const { data } = await api.put('/users/me', profileData);
  return data;
};

export const changePassword = async (currentPassword, newPassword) => {
  // Backend returns 200 with empty body — don't read response data
  await api.post('/users/me/password', { currentPassword, newPassword });
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/users/me/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const getSessions = async () => {
  const { data } = await api.get('/users/me/sessions');
  return data;
};

export const revokeSession = async (tokenId) => {
  // Returns 204 No Content
  await api.delete(`/users/me/sessions/${tokenId}`);
};

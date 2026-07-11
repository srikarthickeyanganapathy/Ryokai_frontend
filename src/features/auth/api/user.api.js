import api from '@/lib/api';

export const normalizeUser = (user) => {
  if (user && user.fullName && !user.name) {
    user.name = user.fullName;
  }
  return user;
};

export const getMe = async () => {
  const { data } = await api.get('/users/me');
  return normalizeUser(data);
};

export const getAllUsers = async () => {
  const { data } = await api.get('/users');
  return Array.isArray(data) ? data.map(normalizeUser) : data;
};

export const updateProfile = async (profileData) => {
  // profileData: { email, fullName, bio, emailNotificationsEnabled }
  const { data } = await api.put('/users/me', profileData);
  return normalizeUser(data);
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
  // Backend returns { avatarUrl: '...' }, not a UserResponseDTO
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

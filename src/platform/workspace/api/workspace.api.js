import api from '@/shared/api/api';

export const getWorkspaceMode = async () => {
  const { data } = await api.get('/workspace/mode');
  return data.mode;
};

export const updateWorkspaceMode = async (mode) => {
  await api.put('/workspace/mode', { mode });
};

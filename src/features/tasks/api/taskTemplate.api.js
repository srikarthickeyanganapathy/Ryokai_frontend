import api from '@/lib/api';

export const getTemplates = async () => {
  const { data } = await api.get('/task-templates');
  return data;
};

export const createTemplate = async (templateData) => {
  const { data } = await api.post('/task-templates', templateData);
  return data;
};

export const updateTemplate = async (id, templateData) => {
  const { data } = await api.put(`/task-templates/${id}`, templateData);
  return data;
};

export const deleteTemplate = async (id) => {
  await api.delete(`/task-templates/${id}`);
};

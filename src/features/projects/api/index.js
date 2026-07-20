import api from '@/shared/api/api';

export const projectsApi = {
  getProjects: async (filters = {}) => {
    const { data } = await api.get('/projects', {
      params: filters,
    });
    return Array.isArray(data) ? data : data?.content || [];
  },

  getProjectById: async (id) => {
    const { data } = await api.get(`/projects/${id}`);
    return data;
  },

  createProject: async (payload) => {
    const { data } = await api.post('/projects', payload);
    return data;
  },

  updateProject: async (id, updates) => {
    const { data } = await api.put(`/projects/${id}`, updates);
    return data;
  },

  deleteProject: async (id) => {
    await api.delete(`/projects/${id}`);
  },

  shareToCrew: async (id, payload) => {
    const { data } = await api.post(`/projects/${id}/share/crew`, payload);
    return data;
  },
};

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

  linkGithubRepo: async (id, repoFullName) => {
    const { data } = await api.put(`/projects/${id}/github-repos`, { repoFullName });
    return data;
  },

  unlinkGithubRepo: async (id, repoFullName) => {
    // Split owner/repo into separate path segments - matches the backend mapping
    // {owner}/{repo} and survives any URL encoding of the slash.
    const [owner, repo] = String(repoFullName).split('/');
    const { data } = await api.delete(`/projects/${id}/github-repos/${owner}/${repo}`);
    return data;
  },

  shareToCrew: async (id, payload) => {
    const { data } = await api.post(`/projects/${id}/share/crew`, payload);
    return data;
  },

  unshareFromCrew: async (projectId, crewId) => {
    if (crewId) {
      await api.delete(`/crews/${crewId}/projects/${projectId}`);
    } else {
      await api.delete(`/projects/${projectId}/share/crew`);
    }
  },

  getProjectActivities: async (id, params = {}) => {
    const { data } = await api.get(`/projects/${id}/activities`, { params });
    return Array.isArray(data) ? data : data?.content || [];
  },
};

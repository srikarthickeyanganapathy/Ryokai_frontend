import api from '@/shared/api/api';

export const crewApi = {
  // --- Crew CRUD ---
  getCrews: async () => {
    const { data } = await api.get('/crews');
    return data;
  },

  discoverCrews: async () => {
    const { data } = await api.get('/crews/discover');
    return data;
  },

  joinPublicCrew: async (crewId) => {
    const { data } = await api.post(`/crews/${crewId}/join`);
    return data;
  },

  getCrew: async (crewId) => {
    const { data } = await api.get(`/crews/${crewId}`);
    return data;
  },

  createCrew: async (payload) => {
    // CrewRequestDTO: { name, description, avatarUrl, visibility, memberCap }
    const { data } = await api.post('/crews', payload);
    return data;
  },

  updateCrew: async (crewId, payload) => {
    const { data } = await api.put(`/crews/${crewId}`, payload);
    return data;
  },

  deleteCrew: async (crewId) => {
    await api.delete(`/crews/${crewId}`);
  },

  // --- Members & Invites ---
  getCrewMembers: async (crewId) => {
    const { data } = await api.get(`/crews/${crewId}/members`);
    return data;
  },

  inviteMember: async (crewId, email) => {
    const { data } = await api.post(`/crews/${crewId}/invite`, { email });
    return data;
  },

  createInviteLink: async (crewId) => {
    const { data } = await api.post(`/crews/${crewId}/invite/link`);
    return data;
  },

  acceptInvite: async (inviteId) => {
    const { data } = await api.post(`/crews/invites/${inviteId}/accept`);
    return data;
  },

  removeMember: async (crewId, userId) => {
    await api.delete(`/crews/${crewId}/members/${userId}`);
  },

  leaveCrew: async (crewId) => {
    await api.post(`/crews/${crewId}/leave`);
  },

  transferCrewOwnership: async (crewId, newOwnerId) => {
    const { data } = await api.put(`/crews/${crewId}/transfer-ownership/${newOwnerId}`);
    return data;
  },

  // --- Projects ---
  getCrewProjects: async (crewId) => {
    const { data } = await api.get(`/crews/${crewId}/projects`);
    return data;
  },

  shareProject: async (crewId, projectId) => {
    const { data } = await api.post(`/crews/${crewId}/projects/${projectId}`);
    return data;
  },

  unshareProject: async (crewId, projectId) => {
    await api.delete(`/crews/${crewId}/projects/${projectId}`);
  },

  // --- Channels ---
  getChannels: async (crewId) => {
    const { data } = await api.get(`/crews/${crewId}/channels`);
    return data;
  },

  createChannel: async (crewId, payload) => {
    // CrewChannelRequestDTO: { name, type: 'TEXT' | 'VOICE' }
    const { data } = await api.post(`/crews/${crewId}/channels`, payload);
    return data;
  },

  deleteChannel: async (crewId, channelId) => {
    await api.delete(`/crews/${crewId}/channels/${channelId}`);
  },

  // --- Messages ---
  getChannelMessages: async (crewId, channelId) => {
    const { data } = await api.get(`/crews/${crewId}/channels/${channelId}/messages`);
    return data;
  },

  sendMessage: async (crewId, channelId, content) => {
    const { data } = await api.post(`/crews/${crewId}/channels/${channelId}/messages`, { content });
    return data;
  },

  updateMessage: async (crewId, channelId, messageId, content) => {
    const { data } = await api.put(`/crews/${crewId}/channels/${channelId}/messages/${messageId}`, { content });
    return data;
  },

  deleteMessage: async (crewId, channelId, messageId) => {
    await api.delete(`/crews/${crewId}/channels/${channelId}/messages/${messageId}`);
  },

  convertMessageToTask: async (crewId, channelId, messageId, payload) => {
    // ConvertToTaskRequestDTO: { title, priority, dueDate }
    const { data } = await api.post(`/crews/${crewId}/channels/${channelId}/messages/${messageId}/convert-to-task`, payload);
    return data;
  },

  // --- Crew Tasks ---
  createCrewTask: async (crewId, payload) => {
    // CrewTaskRequestDTO: { title, description, priority, dueDate, tags, projectId }
    const { data } = await api.post(`/crews/${crewId}/tasks`, payload);
    return data;
  }
};

import api from '@/lib/api';

export const getUserOrganizations = async () => {
  const { data } = await api.get('/organizations');
  return data;
};

export const getOrganization = async (id) => {
  const { data } = await api.get(`/organizations/${id}`);
  return data;
};

export const createOrganization = async (payload) => {
  const { data } = await api.post('/organizations', payload);
  return data;
};

export const getOrgMembers = async (orgId) => {
  const { data } = await api.get(`/organizations/${orgId}/members`);
  return data;
};

export const inviteMember = async (orgId, { username, orgRole }) => {
  const { data } = await api.post(`/organizations/${orgId}/invites`, { username, orgRole });
  return data;
};

export const getMyInvites = async () => {
  const { data } = await api.get('/invites');
  return data;
};

export const acceptInvite = async (inviteId) => {
  const { data } = await api.post(`/invites/${inviteId}/accept`);
  return data;
};

export const declineInvite = async (inviteId) => {
  const { data } = await api.post(`/invites/${inviteId}/decline`);
  return data;
};

export const removeMember = async (orgId, userId) => {
  await api.delete(`/organizations/${orgId}/members/${userId}`);
};

export const getOrgTeams = async (orgId) => {
  const { data } = await api.get(`/organizations/${orgId}/teams`);
  return data;
};

export const createTeam = async (orgId, payload) => {
  const { data } = await api.post(`/organizations/${orgId}/teams`, payload);
  return data;
};

export const requestLeave = async (orgId, reason) => {
  const { data } = await api.post(`/organizations/${orgId}/leave`, { reason });
  return data;
};

export const approveLeave = async (orgId, requestId) => {
  const { data } = await api.post(`/organizations/${orgId}/leave/${requestId}/approve`);
  return data;
};

export const rejectLeave = async (orgId, requestId, comment) => {
  const { data } = await api.post(`/organizations/${orgId}/leave/${requestId}/reject`, { comment });
  return data;
};

export const getLeaveRequests = async (orgId) => {
  const { data } = await api.get(`/organizations/${orgId}/leave`);
  return data;
};

export const getLeaveRequestStatus = async (orgId) => {
  const { data } = await api.get(`/organizations/${orgId}/leave/status`);
  return data;
};

export const updateMemberRole = async (orgId, userId, payload) => {
  const { data } = await api.put(`/organizations/${orgId}/members/${userId}/role`, payload);
  return data;
};

export const addTeamMember = async (teamId, userId) => {
  const { data } = await api.post(`/organizations/teams/${teamId}/members`, { userId });
  return data;
};

export const removeTeamMember = async (teamId, userId) => {
  await api.delete(`/organizations/teams/${teamId}/members/${userId}`);
};

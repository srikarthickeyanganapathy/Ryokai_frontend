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

export const inviteMember = async (orgId, { username, roleId }) => {
  const { data } = await api.post(`/organizations/${orgId}/invites`, { username, roleId });
  return data;
};

export const getOrgRoles = async (orgId) => {
  const { data } = await api.get(`/organizations/${orgId}/roles`);
  return data;
};

export const createOrgRole = async (orgId, payload) => {
  const { data } = await api.post(`/organizations/${orgId}/roles`, payload);
  return data;
};

export const updateOrgRolePermissions = async (orgId, roleId, payload) => {
  const { data } = await api.put(`/organizations/${orgId}/roles/${roleId}/permissions`, payload);
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

// --- Invite Links & Tokens ---
export const createInviteLink = async (orgId, roleId) => {
  const { data } = await api.post(`/organizations/${orgId}/invites/link`, { roleId });
  return data;
};

export const acceptInviteByToken = async (token) => {
  const { data } = await api.post(`/invites/token/${token}/accept`);
  return data;
};

// --- Org Roles ---
export const updateOrgRole = async (orgId, roleId, payload) => {
  const { data } = await api.put(`/organizations/${orgId}/roles/${roleId}`, payload);
  return data;
};

export const deleteOrgRole = async (orgId, roleId) => {
  await api.delete(`/organizations/${orgId}/roles/${roleId}`);
};

// --- Teams ---
export const getTeam = async (teamId) => {
  const { data } = await api.get(`/organizations/teams/${teamId}`);
  return data;
};

export const updateTeam = async (teamId, payload) => {
  const { data } = await api.put(`/organizations/teams/${teamId}`, payload);
  return data;
};

export const deleteTeam = async (teamId) => {
  await api.delete(`/organizations/teams/${teamId}`);
};


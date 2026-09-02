import api from '@/shared/api/api';

// ── Crew whiteboards ──────────────────────────────────────────────────────
export const getWhiteboards = (crewId) => api.get(`/crews/${crewId}/whiteboards`).then(r => r.data);
export const createWhiteboard = (crewId, title) => api.post(`/crews/${crewId}/whiteboards`, { title }).then(r => r.data);
export const saveSnapshot = (crewId, boardId, dataUrl) =>
  api.put(`/crews/${crewId}/whiteboards/${boardId}/snapshot`, { dataUrl }).then(r => r.data);
export const deleteWhiteboard = (crewId, boardId) =>
  api.delete(`/crews/${crewId}/whiteboards/${boardId}`).then(r => r.data);

// ── Organization whiteboards (isolated scope) ────────────────────────────
export const getOrgWhiteboards = (orgId) => api.get(`/organizations/${orgId}/whiteboards`).then(r => r.data);
export const createOrgWhiteboard = (orgId, title) => api.post(`/organizations/${orgId}/whiteboards`, { title }).then(r => r.data);
export const saveOrgSnapshot = (orgId, boardId, dataUrl) =>
  api.put(`/organizations/${orgId}/whiteboards/${boardId}/snapshot`, { dataUrl }).then(r => r.data);
export const deleteOrgWhiteboard = (orgId, boardId) =>
  api.delete(`/organizations/${orgId}/whiteboards/${boardId}`).then(r => r.data);

// ── Team whiteboards inside an organization (isolated scope) ─────────────
export const getTeamWhiteboards = (orgId, teamId) => api.get(`/organizations/${orgId}/teams/${teamId}/whiteboards`).then(r => r.data);
export const createTeamWhiteboard = (orgId, teamId, title) => api.post(`/organizations/${orgId}/teams/${teamId}/whiteboards`, { title }).then(r => r.data);
export const saveTeamSnapshot = (orgId, teamId, boardId, dataUrl) =>
  api.put(`/organizations/${orgId}/teams/${teamId}/whiteboards/${boardId}/snapshot`, { dataUrl }).then(r => r.data);
export const deleteTeamWhiteboard = (orgId, teamId, boardId) =>
  api.delete(`/organizations/${orgId}/teams/${teamId}/whiteboards/${boardId}`).then(r => r.data);

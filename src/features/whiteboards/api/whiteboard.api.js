import api from '@/shared/api/api';

export const getWhiteboards = (crewId) => api.get(`/crews/${crewId}/whiteboards`).then(r => r.data);
export const createWhiteboard = (crewId, title) => api.post(`/crews/${crewId}/whiteboards`, { title }).then(r => r.data);
export const saveSnapshot = (crewId, boardId, dataUrl) =>
  api.put(`/crews/${crewId}/whiteboards/${boardId}/snapshot`, { dataUrl }).then(r => r.data);
export const deleteWhiteboard = (crewId, boardId) =>
  api.delete(`/crews/${crewId}/whiteboards/${boardId}`).then(r => r.data);

import api from '@/shared/api/api';

export const getNotes = (scope) => {
  const params = {};
  if (scope?.crewId) params.crewId = scope.crewId;
  else if (scope?.orgId) params.orgId = scope.orgId;
  return api.get('/notes', { params }).then(r => r.data);
};

export const createNote = (payload, scope) => {
  const params = {};
  if (scope?.crewId) params.crewId = scope.crewId;
  else if (scope?.orgId) params.orgId = scope.orgId;
  return api.post('/notes', payload, { params }).then(r => r.data);
};

export const updateNote = (id, payload) =>
  api.put(`/notes/${id}`, payload).then(r => r.data);

export const deleteNote = (id) =>
  api.delete(`/notes/${id}`).then(r => r.data);
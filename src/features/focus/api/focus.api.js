import api from '@/shared/api/api';

export const startFocusSession = (taskId) =>
  api.post('/focus/start', taskId ? { taskId } : {}).then(r => r.data);

export const stopFocusSession = (sessionId) =>
  api.post(`/focus/${sessionId}/stop`).then(r => r.data);

export const getActiveFocusSession = () =>
  api.get('/focus/active').then(r => (r.status === 204 ? null : r.data));

export const getFocusHistory = (params = {}) =>
  api.get('/focus/history', { params }).then(r => r.data);

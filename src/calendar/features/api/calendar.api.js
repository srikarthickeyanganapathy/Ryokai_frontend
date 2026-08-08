import api from '@/shared/api/api';

export const getCalendarEvents = (start, end, scope) => {
  const params = { start, end };
  if (scope?.orgId) params.orgId = scope.orgId;
  if (scope?.crewId) params.crewId = scope.crewId;
  return api.get('/calendar-events', { params }).then(r => r.data);
};

export const createCalendarEvent = (payload, scope) => {
  const params = {};
  if (scope?.orgId) params.orgId = scope.orgId;
  if (scope?.crewId) params.crewId = scope.crewId;
  return api.post('/calendar-events', payload, { params }).then(r => r.data);
};

export const updateCalendarEvent = (id, payload) =>
  api.put(`/calendar-events/${id}`, payload).then(r => r.data);

export const deleteCalendarEvent = (id) =>
  api.delete(`/calendar-events/${id}`).then(r => r.data);

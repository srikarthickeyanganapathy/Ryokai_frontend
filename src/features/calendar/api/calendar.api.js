import api from '@/shared/api/api';

export const getCalendarEvents = (start, end) =>
  api.get('/calendar-events', { params: { start, end } }).then(r => r.data);

export const createCalendarEvent = (payload) =>
  api.post('/calendar-events', payload).then(r => r.data);

export const updateCalendarEvent = (id, payload) =>
  api.put(`/calendar-events/${id}`, payload).then(r => r.data);

export const deleteCalendarEvent = (id) =>
  api.delete(`/calendar-events/${id}`).then(r => r.data);

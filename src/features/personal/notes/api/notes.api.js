import api from '@/shared/api/api';

export const getNotes = () => api.get('/notes').then(r => r.data);
export const createNote = (payload) => api.post('/notes', payload).then(r => r.data);
export const updateNote = (id, payload) => api.put(`/notes/${id}`, payload).then(r => r.data);
export const deleteNote = (id) => api.delete(`/notes/${id}`).then(r => r.data);

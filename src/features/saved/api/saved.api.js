import api from '@/shared/api/api';

export const getSavedItems = () => api.get('/saved-items').then(r => r.data);
export const saveItem = (entityType, entityId) =>
  api.post('/saved-items', { entityType, entityId }).then(r => r.data);
export const unsaveItem = (entityType, entityId) =>
  api.delete('/saved-items', { params: { entityType, entityId } }).then(r => r.data);

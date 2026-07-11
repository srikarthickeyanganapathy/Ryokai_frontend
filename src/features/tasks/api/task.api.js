import api from '@/lib/api';
import { normalizeStatus } from '@/shared/lib/status';

/** Normalize checklist item: backend uses isCompleted, frontend expects completed */
const normalizeChecklistItem = (item) => ({
  ...item,
  completed: item.completed ?? item.isCompleted ?? false,
})

/** Normalize backend task: split comma-separated tags into array */
const normalizeTask = (t) => ({
  ...t,
  assignee: t.assignedTo,
  status: normalizeStatus(t.currentStatus),
  tags: t.tags ? t.tags.split(',').map(s => s.trim()).filter(Boolean) : [],
  checklists: Array.isArray(t.checklists) ? t.checklists.map(normalizeChecklistItem) : t.checklists,
})

/** Convert tags array back to comma-separated string for backend */
const toBackendTags = (tags) =>
  Array.isArray(tags) ? tags.join(',') : String(tags || '')

export const getTasks = async (params) => {
  const { data } = await api.get('/tasks', { params });
  if (Array.isArray(data)) return data.map(normalizeTask);
  if (data?.content) return { ...data, content: data.content.map(normalizeTask) };
  return data;
};

export const assignTask = async (payload) => {
  const { data } = await api.post('/tasks/assign', { ...payload, tags: toBackendTags(payload.tags) });
  return normalizeTask(data);
};

export const createPersonalTask = async (payload) => {
  const { data } = await api.post('/tasks/personal', { ...payload, tags: toBackendTags(payload.tags) });
  return normalizeTask(data);
};

export const bulkAssign = async (payload) => {
  const { data } = await api.post('/tasks/bulk-assign', payload);
  return Array.isArray(data) ? data.map(normalizeTask) : normalizeTask(data);
};

export const completePersonalTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/complete`);
  return normalizeTask(data);
};

export const submitTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/submit`);
  return normalizeTask(data);
};

export const approveTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/approve`);
  return normalizeTask(data);
};

export const rejectTask = async (id, reason) => {
  const { data } = await api.post(`/tasks/${id}/reject`, { reason });
  return normalizeTask(data);
};

export const getComments = async (id, params) => {
  const { data } = await api.get(`/tasks/${id}/comments`, { params });
  return data;
};

export const addComment = async (id, text) => {
  const { data } = await api.post(`/tasks/${id}/comments`, { text });
  return data;
};


export const addChecklistItem = async (taskId, text) => {
  const { data } = await api.post(`/tasks/${taskId}/checklists`, { text });
  return normalizeChecklistItem(data);
};

export const toggleChecklistItem = async (taskId, itemId) => {
  const { data } = await api.post(`/tasks/${taskId}/checklists/${itemId}/toggle`);
  return normalizeChecklistItem(data);
};

export const deleteChecklistItem = async (taskId, itemId) => {
  await api.delete(`/tasks/${taskId}/checklists/${itemId}`);
};

export const reorderChecklistItems = async (taskId, itemIds) => {
  await api.put(`/tasks/${taskId}/checklists/order`, itemIds);
};

export const getTaskHistory = async (id, params) => {
  const { data } = await api.get(`/tasks/${id}/history`, { params });
  return data;
};

export const addDependency = async (taskId, blocksTaskId) => {
  // Returns 201 with empty body — don't read response data
  await api.post(`/tasks/${taskId}/dependencies`, { blocksTaskId });
};

export const updateTask = async (taskId, payload) => {
  const { data } = await api.put(`/tasks/${taskId}`, payload);
  return normalizeTask(data);
};

export const deleteTask = async (taskId) => {
  // Returns 204 No Content
  await api.delete(`/tasks/${taskId}`);
};

export const archiveTask = async (taskId) => {
  const { data } = await api.put(`/tasks/${taskId}/archive`);
  return normalizeTask(data);
};

export const removeDependency = async (taskId, depId) => {
  // Returns 204 No Content
  await api.delete(`/tasks/${taskId}/dependencies/${depId}`);
};

export const reassignTask = async (taskId, newAssigneeId) => {
  const { data } = await api.put(`/tasks/${taskId}/reassign`, { assigneeId: newAssigneeId });
  return normalizeTask(data);
};

// --- Attachments ---

/** Normalize attachment: backend uses originalFilename/fileSize/uploadedBy, frontend expects fileName/size/uploader */
const normalizeAttachment = (att) => ({
  ...att,
  fileName: att.fileName ?? att.originalFilename ?? 'unknown',
  size: att.size ?? att.fileSize ?? 0,
  uploader: att.uploader ?? att.uploadedBy ?? 'unknown',
})

const normalizeAttachmentList = (data) => {
  if (Array.isArray(data)) return data.map(normalizeAttachment);
  if (data?.content) return { ...data, content: data.content.map(normalizeAttachment) };
  return data;
}

export const getAttachments = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/attachments`);
  return normalizeAttachmentList(data);
};

export const uploadAttachment = async (taskId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return normalizeAttachment(data);
};

export const downloadAttachment = async (taskId, attachmentId) => {
  const { data } = await api.get(`/tasks/${taskId}/attachments/${attachmentId}`, {
    responseType: 'blob',
  });
  return data;
};

export const deleteAttachment = async (taskId, attachmentId) => {
  // Returns 204 No Content
  await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`);
};

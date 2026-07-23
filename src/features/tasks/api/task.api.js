import api from '@/shared/api/api';
import { normalizeStatus } from '@/shared/lib/status';

/** Normalize checklist item: backend uses isCompleted, frontend expects completed */
const normalizeChecklistItem = (item) => ({
  ...item,
  completed: item.completed ?? item.isCompleted ?? false,
})

/** Normalize backend task: split comma-separated tags into array */
// FIX: backend TaskResponseDTO field is `assignee` (String username), not `assignedTo`.
//      The old code mapped t.assignedTo which was always undefined — assignee was lost.
//      Backend also returns `archived` (not `isArchived`), `isPersonal` (via @JsonProperty).
const normalizeTask = (t) => ({
  ...t,
  // Backend field is `assignee` (username string). Keep it as-is and also alias to assignedTo
  // for any component that still reads the old shape.
  assignedTo: t.assignee ?? t.assignedTo,
  assignee: t.assignee ?? t.assignedTo,
  status: normalizeStatus(t.currentStatus),
  currentStatus: t.currentStatus,
  isLocked: t.isLocked ?? t.locked ?? false,
  version: t.version ?? 0,
  tags: t.tags ? String(t.tags).split(',').map(s => s.trim()).filter(Boolean) : [],
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
  const { crewId, ...rest } = payload;
  const { data } = await api.post('/tasks/assign', { ...rest, tags: toBackendTags(rest.tags) });
  return normalizeTask(data);
};

export const createCrewTask = async (payload) => {
  const { crewId, ...rest } = payload;
  const { data } = await api.post('/tasks/crew', { ...rest, tags: toBackendTags(rest.tags) }, {
    params: { crewId }
  });
  return normalizeTask(data);
};

export const createPersonalTask = async (payload) => {
  const { data } = await api.post('/tasks/personal', { ...payload, tags: toBackendTags(payload.tags) });
  return normalizeTask(data);
};

export const bulkAssign = async (payload) => {
  const { data } = await api.post('/tasks/bulk-assign', payload);
  if (Array.isArray(data)) return data.map(normalizeTask);
  return {
    ...data,
    successfulTasks: Array.isArray(data.successfulTasks) ? data.successfulTasks.map(normalizeTask) : []
  };
};

export const completePersonalTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/complete`);
  return normalizeTask(data);
};

// FIX (SM-C01): new endpoint for completing CREW tasks (ASSIGNED -> COMPLETED).
// Crew tasks follow the no-review pipeline per the spec state machine.
export const completeCrewTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/complete-crew`);
  return normalizeTask(data);
};

export const submitTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/submit`);
  return normalizeTask(data);
};

// FIX (SM-M03): new endpoint for recalling a submitted task (SUBMITTED -> ASSIGNED).
export const recallTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/recall`);
  return normalizeTask(data);
};

export const approveTask = async (id) => {
  const { data } = await api.post(`/tasks/${id}/approve`);
  return normalizeTask(data);
};

// FIX (SM-M01): backend now REQUIRES a non-blank reason (@NotBlank on RejectReasonDTO).
// The body is mandatory — backend returns 400 if reason is missing or blank.
export const rejectTask = async (id, reason) => {
  if (!reason || reason.trim() === '') {
    throw new Error('Reason is required to reject a task');
  }
  const { data } = await api.post(`/tasks/${id}/reject`, { reason });
  return normalizeTask(data);
};

export const getComments = async (id, params) => {
  const { data } = await api.get(`/tasks/${id}/comments`, { params });
  return data;
};

export const addComment = async (id, text, parentId = null) => {
  // FIX: backend CommentRequestDTO accepts { text, parentId } for threaded comments (V34).
  const { data } = await api.post(`/tasks/${id}/comments`, { text, parentId });
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

// FIX: backend TaskDependencyRequestDTO field is `dependsOnId`, NOT `blocksTaskId`.
// The old code sent { blocksTaskId } which caused a 400 validation error on every dependency add.
export const addDependency = async (taskId, dependsOnId) => {
  // Returns 201 with empty body — don't read response data
  await api.post(`/tasks/${taskId}/dependencies`, { dependsOnId });
};

export const updateTask = async (taskId, payload) => {
  const { data } = await api.put(`/tasks/${taskId}`, payload);
  return normalizeTask(data);
};

export const deleteTask = async (taskId) => {
  // Returns 204 No Content
  await api.delete(`/tasks/${taskId}`);
};

// FIX (RB-M04): backend now uses ARCHIVE permission (was EDIT). The endpoint path is unchanged.
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
// FIX: backend has NO /tasks/{taskId}/attachments endpoints (no AttachmentController exists).
// The old code called these endpoints and would get 404 on every attachment operation.
// These are stubbed out with clear errors until a backend attachment feature is implemented.
// If you need file attachments, use the TaskEvidence feature instead (POST /tasks/{taskId}/evidence
// with type=SCREENSHOT for images, or type=LINK for URLs).

export const getAttachments = async (_taskId) => {
  console.warn('[task.api] getAttachments: backend has no attachment endpoints. Use TaskEvidence instead.');
  return [];
};

export const uploadAttachment = async (_taskId, _file) => {
  throw new Error('Attachments are not supported by the backend. Use TaskEvidence (POST /tasks/{taskId}/evidence) instead.');
};

export const downloadAttachment = async (_taskId, _attachmentId) => {
  throw new Error('Attachments are not supported by the backend. Use TaskEvidence instead.');
};

export const deleteAttachment = async (_taskId, _attachmentId) => {
  throw new Error('Attachments are not supported by the backend. Use TaskEvidence instead.');
};

// --- Task Evidence ---
export const getEvidence = async (taskId) => {
  const { data } = await api.get(`/tasks/${taskId}/evidence`);
  return data;
};

export const addEvidence = async (taskId, payload) => {
  // payload: { type, url, description }
  // EvidenceType: LINK | GITHUB | SCREENSHOT | RECORDING | SNIPPET | NOTE
  const { data } = await api.post(`/tasks/${taskId}/evidence`, payload);
  return data;
};

export const deleteEvidence = async (taskId, evidenceId) => {
  await api.delete(`/tasks/${taskId}/evidence/${evidenceId}`);
};

// --- Task Claim (Crew Tasks) ---
export const claimTask = async (taskId) => {
  const { data } = await api.post(`/tasks/${taskId}/claim`);
  return normalizeTask(data);
};

// --- Task Activity Log ---
export const getTaskActivities = async (taskId, params) => {
  const { data } = await api.get(`/tasks/${taskId}/activities`, { params });
  return data;
};



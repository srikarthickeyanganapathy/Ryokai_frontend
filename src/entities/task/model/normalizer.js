import { normalizeStatus } from '@/shared/lib/status';

/**
 * Normalize checklist item: backend uses isCompleted, frontend expects completed
 * @param {Object} item - Raw backend checklist item
 * @returns {import('./types').ChecklistItem} Normalized item
 */
export const normalizeChecklistItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    completed: item.completed ?? item.isCompleted ?? false,
  };
};

/**
 * Normalize backend task: split comma-separated tags into array, resolve assignee field,
 * normalize status strings, and format checklist items.
 * @param {Object} t - Raw backend task DTO
 * @returns {import('./types').Task} Normalized UI task object
 */
export const normalizeTask = (t) => {
  if (!t || typeof t !== 'object') return t;
  return {
    ...t,
    assignedTo: t.assignee ?? t.assignedTo,
    assignee: t.assignee ?? t.assignedTo,
    status: normalizeStatus(t.currentStatus),
    currentStatus: t.currentStatus,
    isLocked: t.isLocked ?? t.locked ?? false,
    version: t.version ?? 0,
    tags: t.tags ? String(t.tags).split(',').map(s => s.trim()).filter(Boolean) : [],
    checklists: Array.isArray(t.checklists) ? t.checklists.map(normalizeChecklistItem) : t.checklists,
  };
};

/**
 * Convert tags array back to comma-separated string for backend requests
 * @param {string[]|string} tags - Tags array or string
 * @returns {string} Comma-separated tags string
 */
export const toBackendTags = (tags) =>
  Array.isArray(tags) ? tags.join(',') : String(tags || '');

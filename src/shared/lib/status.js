/**
 * Status normalization between frontend display values and backend enum values.
 * Backend TaskStatus enum: TODO, ASSIGNED, SUBMITTED, APPROVED, REJECTED, COMPLETED.
 * Canonical status definitions in statusregistry.js — this module provides
 * normalization/conversion utilities only.
 * 
 * - TODO / COMPLETED are used for personal tasks (isPersonal = true)
 * - ASSIGNED / SUBMITTED / APPROVED / REJECTED are used for org tasks
 * 
 * Frontend display: To Do, In Progress, In Review, Approved, Rejected, Done
 */

// Backend enum -> Frontend display (labels aligned with statusregistry.js)
const BACKEND_TO_FRONTEND = {
  TODO:        'To Do',        // personal task, not yet started
  IN_PROGRESS: 'In Progress',   // task is sitting with the assignee
  SUBMITTED:   'In Review',    // assignee submitted for review
  APPROVED:    'Approved',      // reviewer approved
  REJECTED:    'Rejected',      // reviewer rejected, assignee must redo
  COMPLETED:   'Done',         // personal task, marked complete
};

// Frontend display -> Backend enum
const FRONTEND_TO_BACKEND = {
  'To Do':       'IN_PROGRESS',
  'In Progress': 'IN_PROGRESS',
  'In Review':   'SUBMITTED',
  'Approved':    'APPROVED',
  'Done':        'APPROVED',
  'Rejected':    'REJECTED',
  'Needs Work':  'REJECTED',
  'Completed':   'COMPLETED',
};

/** Normalize a backend status to frontend display value */
export const normalizeStatus = (status) => {
  if (!status) return 'To Do';
  // Try uppercase match first (backend enum)
  const upper = String(status).toUpperCase().replace(/\s+/g, '_');
  if (BACKEND_TO_FRONTEND[upper]) return BACKEND_TO_FRONTEND[upper];
  if (BACKEND_TO_FRONTEND[status]) return BACKEND_TO_FRONTEND[status];
  // Try frontend match
  if (FRONTEND_TO_BACKEND[status]) return status;
  // Try partial match
  for (const [key, val] of Object.entries(BACKEND_TO_FRONTEND)) {
    if (upper.includes(key) || key.includes(upper)) return val;
  }
  return status;
};

/** Convert frontend status to backend enum value */
export const toBackendStatus = (status) => {
  if (!status) return 'IN_PROGRESS';
  const upper = String(status).toUpperCase().replace(/\s+/g, '_');
  if (BACKEND_TO_FRONTEND[upper]) return upper;
  if (FRONTEND_TO_BACKEND[status]) return FRONTEND_TO_BACKEND[status];
  return upper;
};

/** Check if a status represents a "done/completed" state */
export const isDoneStatus = (status) => {
  const upper = String(status || '').toUpperCase();
  return upper === 'APPROVED' || upper === 'COMPLETED' || upper === 'DONE';
};

/** Check if a status represents an "active/in progress" state */
export const isActiveStatus = (status) => {
  const upper = String(status || '').toUpperCase();
  return upper === 'TODO' || upper === 'IN_PROGRESS' || upper === 'SUBMITTED' || upper === 'REJECTED' || upper === 'TO DO' || upper === 'IN REVIEW' || upper === 'NEEDS WORK';
};

/** Kanban column IDs mapped to backend status enums */
export const KANBAN_COLUMNS = [
  { id: 'To Do',       title: 'In Progress',    backendStatus: ['TODO', 'IN_PROGRESS'] },
  { id: 'In Review',   title: 'In Review',   backendStatus: ['SUBMITTED'] },
  { id: 'Needs Work',  title: 'Needs Work',  backendStatus: ['REJECTED'] },
  { id: 'Done',        title: 'Done',        backendStatus: ['APPROVED', 'COMPLETED'] },
];

export const PROJECT_STATUS_COLORS = {
  ACTIVE: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20',
  COMPLETED: 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/20',
  ARCHIVED: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20',
};

/** Given a task's backend status, return which kanban column it belongs to */
export const getKanbanColumnForTask = (task) => {
  const rawStatus = String(task.currentStatus || '').toUpperCase().replace(/\s+/g, '_');
  // Check backendStatus arrays for a match
  for (const col of KANBAN_COLUMNS) {
    if (Array.isArray(col.backendStatus) && col.backendStatus.includes(rawStatus)) {
      return col.id;
    }
  }
  // Fallback: normalize and match by display name
  const display = normalizeStatus(task.currentStatus);
  const colById = KANBAN_COLUMNS.find(c => c.id === display);
  return colById ? colById.id : 'To Do';
};

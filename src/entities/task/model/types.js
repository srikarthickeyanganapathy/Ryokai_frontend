/**
 * @typedef {Object} ChecklistItem
 * @property {number|string} id - Item identifier
 * @property {string} text - Checklist item description text
 * @property {boolean} completed - Whether item is completed (normalized from backend isCompleted)
 * @property {number} [order] - Display order index
 */

/**
 * @typedef {Object} TaskEvidence
 * @property {number|string} id - Evidence identifier
 * @property {('LINK'|'GITHUB'|'SCREENSHOT'|'RECORDING'|'SNIPPET'|'NOTE')} type - Type of evidence submitted
 * @property {string} url - URL or data URI of the evidence
 * @property {string} [description] - Description of the evidence
 * @property {string} [createdAt] - Creation timestamp
 */

/**
 * @typedef {Object} Task
 * @property {number|string} id - Task ID
 * @property {string} title - Task title
 * @property {string} [description] - Task description markdown or plain text
 * @property {string} currentStatus - Raw backend status string (e.g. 'TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED')
 * @property {string} status - Normalized UI status string
 * @property {string} [assignee] - Username of assigned user (backend field)
 * @property {string} [assignedTo] - Alias for assignee (legacy UI compatibility)
 * @property {string} [creator] - Username of task creator
 * @property {string} [priority] - Task priority ('LOW'|'MEDIUM'|'HIGH'|'URGENT')
 * @property {string} [dueDate] - Due date ISO string
 * @property {boolean} isLocked - Whether task is locked for editing
 * @property {boolean} [isPersonal] - Whether task belongs to personal workspace
 * @property {boolean} [archived] - Whether task is archived
 * @property {number} version - Optimistic locking version
 * @property {string[]} tags - Array of tag strings (normalized from comma-separated string)
 * @property {ChecklistItem[]} [checklists] - Array of checklist items
 * @property {number|string} [organizationId] - Organization ID if task is scoped to an org
 * @property {number|string} [crewId] - Crew ID if task is scoped to a crew
 * @property {number|string} [teamId] - Team ID if task is assigned to a team
 * @property {string} [createdAt] - Creation timestamp ISO
 * @property {string} [updatedAt] - Last update timestamp ISO
 */

export const TaskTypes = {};

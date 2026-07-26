/**
 * @typedef {Object} Organization
 * @property {number|string} id - Organization identifier
 * @property {string} name - Organization display name
 * @property {string} [description] - Organization description
 * @property {string} [createdAt] - Creation ISO timestamp
 * @property {string} [updatedAt] - Last update ISO timestamp
 */

/**
 * @typedef {Object} OrgMember
 * @property {number|string} id - Membership or User ID
 * @property {number|string} [userId] - User identifier
 * @property {string} username - Member's username
 * @property {string} [email] - Member's email
 * @property {string} orgRole - Role name string (e.g. 'ADMIN', 'DIRECTOR', 'MANAGER', 'MEMBER')
 * @property {string[]} [permissions] - Array of permission strings (e.g. 'TASK_VIEW', 'ROLE_MANAGE')
 * @property {number} [rolePriority] - Numerical rank priority (smaller number = higher rank)
 */

/**
 * @typedef {Object} OrgTeam
 * @property {number|string} id - Team ID
 * @property {string} name - Team name
 * @property {string} [description] - Team description
 * @property {number|string} [leadId] - User ID of team lead
 * @property {string} [leadName] - Username of team lead
 * @property {OrgMember[]} [members] - List of team members
 * @property {OrgMember[]} [observers] - List of team observers
 */

/**
 * @typedef {Object} OrgRole
 * @property {number|string} id - Role identifier
 * @property {string} name - Role name
 * @property {string} [description] - Role description
 * @property {string[]} permissions - Assigned permissions
 * @property {number} priority - Rank priority
 */

/**
 * @typedef {Object} LeaveRequest
 * @property {number|string} id - Request ID
 * @property {number|string} userId - Requesting user ID
 * @property {string} username - Requesting username
 * @property {string} reason - Leave request reason
 * @property {string} status - Request status ('PENDING'|'APPROVED'|'REJECTED')
 * @property {string} [adminComment] - Comment from reviewing admin
 * @property {string} [createdAt] - Request timestamp
 */

export const OrganizationTypes = {};

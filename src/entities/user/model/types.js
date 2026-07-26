/**
 * @typedef {Object} User
 * @property {number|string} id - User ID
 * @property {string} username - Unique username
 * @property {string} [email] - Email address
 * @property {string[]} roles - Global system roles (e.g. 'ROLE_USER', 'ROLE_SUPER_ADMIN')
 * @property {string} [createdAt] - Account creation ISO timestamp
 */

/**
 * @typedef {Object} UserSession
 * @property {string} id - Session identifier
 * @property {string} [ipAddress] - Client IP address
 * @property {string} [userAgent] - Browser / device agent string
 * @property {string} [lastActive] - Last active timestamp
 */

export const UserTypes = {};

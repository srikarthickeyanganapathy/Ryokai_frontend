/**
 * @typedef {Object} Crew
 * @property {number|string} id - Crew identifier
 * @property {string} name - Crew name
 * @property {string} [description] - Crew description
 * @property {string} [avatarUrl] - Avatar image URL
 * @property {string} [visibility] - Visibility ('PUBLIC'|'PRIVATE')
 * @property {number} [memberCap] - Maximum member limit
 * @property {number|string} [ownerId] - Owner user ID
 * @property {string} [ownerName] - Owner username
 * @property {string} [createdAt] - Creation ISO timestamp
 */

/**
 * @typedef {Object} CrewMember
 * @property {number|string} id - Member record ID
 * @property {number|string} userId - User identifier
 * @property {string} username - Username
 * @property {string} [email] - Member email
 * @property {string} [role] - Member role ('OWNER'|'ADMIN'|'MEMBER')
 * @property {string} [joinedAt] - Join timestamp
 */

/**
 * @typedef {Object} CrewChannel
 * @property {number|string} id - Channel identifier
 * @property {number|string} crewId - Parent Crew ID
 * @property {string} name - Channel name
 * @property {('TEXT'|'VOICE')} type - Channel type
 */

/**
 * @typedef {Object} CrewMessage
 * @property {number|string} id - Message ID
 * @property {number|string} channelId - Channel ID
 * @property {number|string} senderId - Sender User ID
 * @property {string} senderName - Sender Username
 * @property {string} content - Message content text
 * @property {string} [createdAt] - Creation timestamp
 */


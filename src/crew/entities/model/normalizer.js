/**
 * Normalize crew DTO
 * @param {Object} crew - Raw backend crew
 * @returns {import('./types').Crew} Normalized crew object
 */
export const normalizeCrew = (crew) => {
  if (!crew || typeof crew !== 'object') return crew;
  return {
    ...crew,
    id: crew.id ?? crew.crewId,
  };
};

/**
 * Normalize crew member DTO
 * @param {Object} member - Raw backend member
 * @returns {import('./types').CrewMember} Normalized member object
 */
export const normalizeCrewMember = (member) => {
  if (!member || typeof member !== 'object') return member;
  return {
    ...member,
    role: member.role || 'MEMBER',
  };
};

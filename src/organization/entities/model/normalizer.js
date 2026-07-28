/**
 * Normalize organization DTO
 * @param {Object} org - Raw backend organization
 * @returns {import('./types').Organization} Normalized organization object
 */
export const normalizeOrganization = (org) => {
  if (!org || typeof org !== 'object') return org;
  return {
    ...org,
    id: org.id ?? org.organizationId,
  };
};

/**
 * Normalize org member DTO: strip ROLE_ prefix from orgRole, ensure permissions array
 * @param {Object} member - Raw backend member
 * @returns {import('./types').OrgMember} Normalized member object
 */
export const normalizeOrgMember = (member) => {
  if (!member || typeof member !== 'object') return member;
  const rawRole = member.orgRole || member.role || '';
  const orgRole = typeof rawRole === 'string' ? rawRole.replace(/^ROLE_/, '').toUpperCase() : '';
  return {
    ...member,
    orgRole,
    permissions: Array.isArray(member.permissions) ? member.permissions : [],
  };
};

/**
 * Normalize org team DTO
 * @param {Object} team - Raw backend team
 * @returns {import('./types').OrgTeam} Normalized team object
 */
export const normalizeOrgTeam = (team) => {
  if (!team || typeof team !== 'object') return team;
  return {
    ...team,
    members: Array.isArray(team.members) ? team.members.map(normalizeOrgMember) : [],
    observers: Array.isArray(team.observers) ? team.observers.map(normalizeOrgMember) : [],
  };
};

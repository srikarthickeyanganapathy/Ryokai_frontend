/**
 * Normalize user DTO: ensure roles is an array
 * @param {Object} user - Raw backend user
 * @returns {import('./types').User} Normalized user object
 */
export const normalizeUser = (user) => {
  if (!user || typeof user !== 'object') return user;
  return {
    ...user,
    roles: Array.isArray(user.roles) ? user.roles : [],
  };
};

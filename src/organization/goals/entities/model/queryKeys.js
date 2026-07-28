/**
 * Canonical query keys for Goal entity in TanStack Query
 */
export const goalQueryKeys = {
  all: ['goals'],
  list: (orgId) => ['goals', 'list', orgId],
};

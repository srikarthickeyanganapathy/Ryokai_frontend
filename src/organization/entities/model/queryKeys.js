/**
 * Canonical query keys for Organization entity in TanStack Query
 */
export const orgQueryKeys = {
  all: ['organizations'],
  detail: (id) => ['organizations', id],
  members: (id) => ['organizations', id, 'members'],
  teams: (id) => ['organizations', id, 'teams'],
  roles: (id) => ['organizations', id, 'roles'],
  leaveRequests: (id) => ['organizations', id, 'leave-requests'],
  exitRequests: (id) => ['organizations', id, 'exit-requests'],
  invites: () => ['organizations', 'invites'],
};

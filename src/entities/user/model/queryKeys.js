/**
 * Canonical query keys for User entity in TanStack Query
 */
export const userQueryKeys = {
  all: ['users'],
  me: () => [...userQueryKeys.all, 'me'],
  sessions: () => [...userQueryKeys.me(), 'sessions'],
};

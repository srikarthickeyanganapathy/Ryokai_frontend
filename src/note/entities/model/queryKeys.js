/**
 * Canonical query keys for Note entity in TanStack Query
 */
export const noteQueryKeys = {
  all: ['notes'],
  detail: (id) => ['notes', id],
};

/**
 * Canonical query keys for Task entity in TanStack Query
 */
export const taskQueryKeys = {
  all: ['tasks'],
  lists: () => [...taskQueryKeys.all, 'list'],
  list: (filters) => [...taskQueryKeys.lists(), { filters }],
  details: () => [...taskQueryKeys.all, 'detail'],
  detail: (id) => [...taskQueryKeys.details(), id],
  comments: (id) => [...taskQueryKeys.detail(id), 'comments'],
  history: (id, params) => [...taskQueryKeys.detail(id), 'history', { params }],
  attachments: (id) => [...taskQueryKeys.detail(id), 'attachments'],
  evidence: (id) => [...taskQueryKeys.detail(id), 'evidence'],
};

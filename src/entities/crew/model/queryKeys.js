/**
 * Canonical query keys for Crew entity in TanStack Query
 */
export const crewQueryKeys = {
  all: ['crews'],
  list: (filters) => [...crewQueryKeys.all, 'list', { filters }],
  detail: (id) => [...crewQueryKeys.all, 'detail', id],
  members: (id) => [...crewQueryKeys.detail(id), 'members'],
  channels: (id) => [...crewQueryKeys.detail(id), 'channels'],
  messages: (crewId, channelId) => [...crewQueryKeys.detail(crewId), 'channels', channelId, 'messages'],
  projects: (id) => [...crewQueryKeys.detail(id), 'projects'],
  whiteboards: (id) => [...crewQueryKeys.detail(id), 'whiteboards'],
};

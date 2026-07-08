// Centralized query keys for TanStack Query
export const queryKeys = {
  tasks: {
    all: ['tasks'],
    lists: () => [...queryKeys.tasks.all, 'list'],
    list: (filters) => [...queryKeys.tasks.lists(), { filters }],
    details: () => [...queryKeys.tasks.all, 'detail'],
    detail: (id) => [...queryKeys.tasks.details(), id],
    comments: (id) => [...queryKeys.tasks.detail(id), 'comments'],
    history: (id) => [...queryKeys.tasks.detail(id), 'history'],
    attachments: (id) => [...queryKeys.tasks.detail(id), 'attachments'],
  },
  users: {
    all: ['users'],
    me: () => [...queryKeys.users.all, 'me'],
    sessions: () => [...queryKeys.users.me(), 'sessions'],
  },
  notifications: {
    all: ['notifications'],
    list: (filters) => [...queryKeys.notifications.all, 'list', { filters }],
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'],
  },
  admin: {
    roles: {
      all: ['admin', 'roles'],
      list: () => [...queryKeys.admin.roles.all, 'list'],
      detail: (id) => [...queryKeys.admin.roles.all, id],
      permissions: (id) => [...queryKeys.admin.roles.detail(id), 'permissions'],
    },
    permissions: {
      all: ['admin', 'permissions'],
      list: () => [...queryKeys.admin.permissions.all, 'list'],
    },
  },
  dashboard: {
    all: ['dashboard'],
    stats: () => [...queryKeys.dashboard.all, 'stats'],
    activity: (params) => [...queryKeys.dashboard.all, 'activity', { params }],
  },
  projects: {
    all: ['projects'],
    list: (f) => ['projects', 'list', { filters: f }],
    detail: (id) => ['projects', 'detail', id],
  },
  organizations: {
    all: ['organizations'],
    detail: (id) => ['organizations', id],
    members: (id) => ['organizations', id, 'members'],
    teams: (id) => ['organizations', id, 'teams'],
    leaveRequests: (id) => ['organizations', id, 'leave-requests'],
    invites: () => [...queryKeys.organizations.all, 'invites'],
  },
};

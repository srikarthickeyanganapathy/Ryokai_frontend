export const ROUTES = {
  PUBLIC: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
  },
  PRIVATE: {
    DASHBOARD: '/app/dashboard',
    TASKS: '/app/tasks',
    PROJECTS: '/app/projects',
    ORGANIZATIONS: '/app/organizations',
    SETTINGS: '/app/settings',
  }
}

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
  },
  USER: {
    ME: '/users/me',
  }
}

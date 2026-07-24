import { create } from 'zustand';

/**
 * Zustand store for managing the frontend snapshot of the user's permissions.
 * React Query remains the authoritative source of truth for the server state.
 * This store merely caches a synchronized snapshot to allow fast, synchronous
 * access to permission checks across the UI without triggering React Query reads.
 */
export const usePermissionStore = create((set, get) => ({
  permissions: [],
  roles: [],
  isLoaded: false,

  /**
   * Synchronize the store with the latest server state fetched by React Query.
   * This should be called in a useEffect where the useQuery for permissions resides.
   */
  syncPermissions: (permissionList, roleList) => {
    set({
      permissions: permissionList || [],
      roles: roleList || [],
      isLoaded: true,
    });
  },

  /**
   * Clear the permission store snapshot on logout or 401/403.
   */
  clearPermissions: () => {
    set({
      permissions: [],
      roles: [],
      isLoaded: false,
    });
  },

  /**
   * Helper to check if the current snapshot contains a specific permission.
   */
  hasPermission: (permissionName) => {
    const { permissions, isLoaded } = get();
    if (!isLoaded) return false;
    return permissions.some(p => p.name === permissionName);
  },

  /**
   * Helper to check if the current snapshot contains a specific role.
   */
  hasRole: (roleName) => {
    const { roles, isLoaded } = get();
    if (!isLoaded) return false;
    return roles.some(r => r.name === roleName);
  }
}));

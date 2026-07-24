import { usePermissionStore } from '../store/permissionStore';

/**
 * Custom hook to safely and synchronously access the permission snapshot.
 * Ensures that UI components don't need to know about the Zustand implementation.
 */
export const usePermissions = () => {
  const hasPermission = usePermissionStore((state) => state.hasPermission);
  const hasRole = usePermissionStore((state) => state.hasRole);
  const isLoaded = usePermissionStore((state) => state.isLoaded);

  /**
   * Check if the user has a specific permission.
   * @param {string} permissionName e.g., 'task:edit'
   * @returns {boolean}
   */
  const can = (permissionName) => {
    return hasPermission(permissionName);
  };

  /**
   * Check if the user has a specific role.
   * Note: The Hybrid Authorization Model dictates using permissions where possible,
   * but role checks are kept for coarse-grained layout decisions.
   * @param {string} roleName e.g., 'ADMIN'
   * @returns {boolean}
   */
  const isRole = (roleName) => {
    return hasRole(roleName);
  };

  return {
    can,
    isRole,
    isLoaded,
  };
};

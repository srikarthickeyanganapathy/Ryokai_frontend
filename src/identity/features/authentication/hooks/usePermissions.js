import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useOrganizations, useOrgMembers } from '@/organization';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { usePermissionStore, resolvePermission } from '../store/permissionStore';
import { useEffect } from 'react';

const EMPTY_PERMISSIONS = [];

/**
 * Custom hook providing comprehensive permission checks.
 * Combines role/membership derivation with synchronous permission store lookups.
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const { data: orgsData } = useOrganizations();
  const organizations = useMemo(() => orgsData?.content || orgsData || [], [orgsData]);

  const hasPermission = usePermissionStore((state) => state.hasPermission);
  const hasRole = usePermissionStore((state) => state.hasRole);
  const isLoaded = usePermissionStore((state) => state.isLoaded);

  // SUPER_ADMIN is the only global role
  const normalizedRoles = useMemo(
    () => (user?.roles || []).map(r => (typeof r === 'string' ? r.replace(/^ROLE_/, '') : '')).filter(Boolean),
    [user?.roles]
  );
  const isSuperAdmin = normalizedRoles.includes('SUPER_ADMIN');

  // User's org
  const { activeOrganization } = useWorkspace();
  const userOrg = activeOrganization || null;

  // Fetch actual member list for the user's org to find their orgRole
  const { data: membersData } = useOrgMembers(userOrg?.id);
  const membersList = useMemo(() => membersData?.content || membersData || [], [membersData]);

  // Find the current user's membership to get their actual orgRole.
  const myMembership = useMemo(() => {
    if (!user) return null;
    return (
      membersList.find(m => m.userId != null && user.id != null && m.userId === user.id) ||
      membersList.find(m => m.username === user?.username) ||
      null
    );
  }, [membersList, user]);

  const rawOrgRole = myMembership?.orgRole || null;
  const permissions = myMembership?.permissions || EMPTY_PERMISSIONS;

  // Normalize orgRole
  const orgRole = typeof rawOrgRole === 'string'
    ? rawOrgRole.replace(/^ROLE_/, '').toUpperCase()
    : null;

  const isAdminOrAbove = isSuperAdmin || orgRole === 'ADMIN';

  // Computed permission flags -- canonical source: resolvePermission() pure fn
  const canManage = isAdminOrAbove || resolvePermission('ROLE_UPDATE', permissions);
  const canAssign = isAdminOrAbove || resolvePermission('TASK_ASSIGN', permissions);
  const canReview = isAdminOrAbove || resolvePermission('TASK_APPROVE', permissions) || resolvePermission('TASK_REJECT', permissions);
  const canCreateTeam = isAdminOrAbove || resolvePermission('TEAM_CREATE', permissions);
  const canManageTeam = isAdminOrAbove || resolvePermission('TEAM_UPDATE', permissions);
  const canCreateProject = isAdminOrAbove || resolvePermission('PROJECT_CREATE', permissions);
  const canManageProject = isAdminOrAbove || resolvePermission('PROJECT_UPDATE', permissions);
  const canInviteMembers = isAdminOrAbove || resolvePermission('MEMBER_INVITE', permissions);
  const canRemoveMembers = isAdminOrAbove || resolvePermission('MEMBER_REMOVE', permissions);
  const canManageLeaveRequests = isAdminOrAbove || resolvePermission('LEAVE_APPROVE', permissions);
  const canManageRoles = isAdminOrAbove || resolvePermission('ROLE_UPDATE', permissions);
  const canManageUsers = isSuperAdmin;
  const canManageAnnouncements = isAdminOrAbove || resolvePermission('ANNOUNCEMENT_UPDATE', permissions);
  const canViewAnnouncements = isAdminOrAbove || resolvePermission('ANNOUNCEMENT_VIEW', permissions);
  const canCreateAnnouncements = isAdminOrAbove || resolvePermission('ANNOUNCEMENT_CREATE', permissions);
  const canDeleteAnnouncements = isAdminOrAbove || resolvePermission('ANNOUNCEMENT_DELETE', permissions);
  const canManageGoals = isAdminOrAbove || resolvePermission('GOAL_UPDATE', permissions);
  const canViewGoals = isAdminOrAbove || resolvePermission('GOAL_VIEW', permissions);
  const canCreateGoals = isAdminOrAbove || resolvePermission('GOAL_CREATE', permissions);
  const canDeleteGoals = isAdminOrAbove || resolvePermission('GOAL_DELETE', permissions);
  const canManageOrganization = isAdminOrAbove || resolvePermission('ORG_PROFILE_UPDATE', permissions);
  const canViewOrganization = isAdminOrAbove || resolvePermission('ORG_VIEW', permissions);
  const canViewOrgWideDashboard = isAdminOrAbove || resolvePermission('DASHBOARD_VIEW', permissions);
  const canOverrideTask = isAdminOrAbove || resolvePermission('TASK_OVERRIDE', permissions);
  const canViewAnalytics = isAdminOrAbove || resolvePermission('DASHBOARD_VIEW', permissions);

  // Task-scoped permissions
  const canViewTask = isAdminOrAbove || resolvePermission('TASK_VIEW', permissions);
  const canCreateTask = isAdminOrAbove || resolvePermission('TASK_CREATE', permissions);
  const canAssignTask = isAdminOrAbove || resolvePermission('TASK_ASSIGN', permissions);
  const canEditTask = isAdminOrAbove || resolvePermission('TASK_UPDATE', permissions);
  const canDeleteTask = isAdminOrAbove || resolvePermission('TASK_DELETE', permissions);
  const canReviewTask = isAdminOrAbove || resolvePermission('TASK_APPROVE', permissions) || resolvePermission('TASK_REJECT', permissions);
  const canCommentTask = canViewTask;
  const canChecklistEdit = canEditTask;
  const canDependencyEdit = isAdminOrAbove || resolvePermission('TASK_DEPENDENCY_UPDATE', permissions);
  const canReassignTask = isAdminOrAbove || resolvePermission('TASK_REASSIGN', permissions);
  const canArchiveTask = isAdminOrAbove || resolvePermission('TASK_ARCHIVE', permissions);

  // Helper to enforce rank-based power dynamics in UI
  const canAlter = (targetUsername) => {
    if (isSuperAdmin) return true;
    if (!targetUsername) return false; // fail-closed if target is unknown
    if (user?.username === targetUsername) return true;
    
    const myPriority = myMembership?.rolePriority ?? 999;
    const targetMember = membersList.find(m => m.username === targetUsername);
    if (!targetMember) return false; // fail-closed
    
    const targetPriority = targetMember.rolePriority ?? 999;
    return myPriority <= targetPriority;
  };

  /**
   * Check if the user has a specific permission via Zustand snapshot.
   */
  const can = (permissionName) => {
    return hasPermission(permissionName);
  };

  /**
   * Check if the user has a specific role via Zustand snapshot.
   */
  const isRole = (roleName) => {
    return hasRole(roleName);
  };

  const syncPermissions = usePermissionStore((state) => state.syncPermissions);

  useEffect(() => {
    if (permissions && normalizedRoles) {
      if (typeof syncPermissions === 'function') {
        syncPermissions(permissions, normalizedRoles);
      }
    }
  }, [permissions, normalizedRoles, syncPermissions]);

  return {
    // Actual role
    orgRole,
    myMembership,

    // Role booleans
    isSuperAdmin,
    isOrgAdmin: orgRole === 'ADMIN',

    // Permission flags
    canManage,
    canAssign,
    canReview,
    canCreateTeam,
    canManageTeam,
    canCreateProject,
    canManageProject,
    canInviteMembers,
    canRemoveMembers,
    canManageLeaveRequests,
    canManageRoles,
    canManageUsers,
    canManageAnnouncements,
    canViewAnnouncements,
    canCreateAnnouncements,
    canDeleteAnnouncements,
    canManageGoals,
    canViewGoals,
    canCreateGoals,
    canDeleteGoals,
    canManageOrganization,
    canViewOrganization,
    canViewOrgWideDashboard,
    canOverrideTask,
    canViewAnalytics,
    
    // Task permissions
    canViewTask,
    canCreateTask,
    canAssignTask,
    canEditTask,
    canDeleteTask,
    canReviewTask,
    canCommentTask,
    canChecklistEdit,
    canDependencyEdit,
    canReassignTask,
    canArchiveTask,
    canAlter,

    permissions, // Raw permissions array

    // Org context
    isOrgMember: organizations.length > 0,
    userOrg,

    // Zustand snapshot helpers
    can,
    isRole,
    isLoaded,
  };
};

/** Quick check -- whether user has an org, without full membership fetch */
export const useHasOrganization = () => {
  const { data: orgsData } = useOrganizations();
  const organizations = orgsData?.content || orgsData || [];
  return {
    hasOrg: organizations.length > 0,
    isLoading: false,
  };
};

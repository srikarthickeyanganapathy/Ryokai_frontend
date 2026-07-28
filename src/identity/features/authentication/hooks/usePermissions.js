import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { useOrganizations, useOrgMembers } from '@/organization';
import { usePermissionStore } from '../store/permissionStore';

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
    () => (user?.roles || []).map(r => (typeof r === 'string' ? r.replace(/^ROLE_/, '') : '')),
    [user?.roles]
  );
  const isSuperAdmin = normalizedRoles.includes('SUPER_ADMIN');

  // User's org (at most one due to one-org rule)
  const hasOrg = organizations.length > 0;
  const userOrg = hasOrg ? organizations[0] : null;

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
  const permissions = myMembership?.permissions || [];

  // Normalize orgRole
  const orgRole = typeof rawOrgRole === 'string'
    ? rawOrgRole.replace(/^ROLE_/, '').toUpperCase()
    : null;

  const isAdminOrAbove = isSuperAdmin || orgRole === 'ADMIN';

  // Computed permission flags dynamically from DB permissions
  const canManage = isAdminOrAbove || permissions.includes('ROLE_MANAGE');
  const canAssign = isAdminOrAbove || permissions.includes('TASK_ASSIGN');
  const canReview = isAdminOrAbove || permissions.includes('TASK_REVIEW');
  const canCreateTeam = isAdminOrAbove || permissions.includes('TEAM_CREATE');
  const canManageTeam = isAdminOrAbove || permissions.includes('TEAM_MANAGE');
  const canCreateProject = isAdminOrAbove || permissions.includes('PROJECT_CREATE');
  const canManageProject = isAdminOrAbove || permissions.includes('PROJECT_MANAGE');
  const canInviteMembers = isAdminOrAbove || permissions.includes('ORG_MEMBER_INVITE');
  const canRemoveMembers = isAdminOrAbove || permissions.includes('ORG_MEMBER_REMOVE');
  const canManageLeaveRequests = isAdminOrAbove || permissions.includes('LEAVE_REQUEST_MANAGE');
  const canManageRoles = isAdminOrAbove || permissions.includes('ROLE_MANAGE');
  const canManageUsers = isSuperAdmin;
  const canManageAnnouncements = isAdminOrAbove || permissions.includes('ANNOUNCEMENT_MANAGE');
  const canManageGoals = isAdminOrAbove || permissions.includes('GOAL_MANAGE');
  const canViewOrgWideDashboard = isAdminOrAbove || permissions.includes('DASHBOARD_ORG_WIDE_VIEW');
  const canOverrideTask = isAdminOrAbove || permissions.includes('TASK_OVERRIDE');
  const canViewAnalytics = true;

  // Task-scoped permissions
  const canViewTask = isAdminOrAbove || permissions.includes('TASK_VIEW');
  const canCreateTask = true;
  const canAssignTask = isAdminOrAbove || permissions.includes('TASK_ASSIGN');
  const canEditTask = isAdminOrAbove || permissions.includes('TASK_EDIT');
  const canDeleteTask = isAdminOrAbove || permissions.includes('TASK_DELETE');
  const canReviewTask = isAdminOrAbove || permissions.includes('TASK_REVIEW');
  const canCommentTask = canViewTask;
  const canChecklistEdit = canEditTask;
  const canDependencyEdit = isAdminOrAbove || permissions.includes('TASK_DEPENDENCY_EDIT');
  const canReassignTask = isAdminOrAbove || permissions.includes('TASK_REASSIGN');
  const canArchiveTask = isAdminOrAbove || permissions.includes('TASK_ARCHIVE');

  // Helper to enforce rank-based power dynamics in UI
  const canAlter = (targetUsername) => {
    if (isSuperAdmin) return true;
    if (!targetUsername) return true;
    if (user?.username === targetUsername) return true;
    
    const myPriority = myMembership?.rolePriority ?? 999;
    const targetMember = membersList.find(m => m.username === targetUsername);
    if (!targetMember) return true;
    
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
    canManageGoals,
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
    isOrgMember: hasOrg,
    userOrg,

    // Zustand snapshot helpers
    can,
    isRole,
    isLoaded,
  };
};

/** Quick check â€” whether user has an org, without full membership fetch */
export const useHasOrganization = () => {
  const { data: orgsData } = useOrganizations();
  const organizations = orgsData?.content || orgsData || [];
  return {
    hasOrg: organizations.length > 0,
    isLoading: false,
  };
};

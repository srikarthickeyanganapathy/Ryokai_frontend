import { useMemo } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useOrganizations, useOrgMembers } from '@/features/organizations/hooks/useOrganizations';

/**
 * Fix C4: Derives the user's ACTUAL org role from the membership list,
 * not from a heuristic createdBy check.
 */
export const usePermissions = () => {
  const { user } = useAuth();
  const { data: orgsData } = useOrganizations();
  const organizations = useMemo(() => orgsData?.content || orgsData || [], [orgsData]);

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
  // Prefer userId match (more reliable than username string formatting).
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

  // Normalize orgRole (backend typically returns ADMIN/DIRECTOR/... but be defensive)
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
  const canManageUsers = isSuperAdmin; // USER_MANAGE is for super admin only now
  const canManageAnnouncements = isAdminOrAbove || permissions.includes('ANNOUNCEMENT_MANAGE');
  const canManageGoals = isAdminOrAbove || permissions.includes('GOAL_MANAGE');
  const canViewAnalytics = true; // Analytics page is for the user, not for the org

  // Task-scoped permissions
  const canViewTask = isAdminOrAbove || permissions.includes('TASK_VIEW');
  const canCreateTask = true; // Anyone can create personal tasks
  const canAssignTask = isAdminOrAbove || permissions.includes('TASK_ASSIGN');
  const canEditTask = isAdminOrAbove || permissions.includes('TASK_EDIT');
  const canDeleteTask = isAdminOrAbove || permissions.includes('TASK_DELETE');
  const canReviewTask = isAdminOrAbove || permissions.includes('TASK_REVIEW');
  const canCommentTask = canViewTask; // Replaced by TASK_VIEW
  const canChecklistEdit = canEditTask; // Replaced by TASK_EDIT
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

  return {
    // Actual role
    orgRole,
    myMembership,

    // Role booleans (Kept for compatibility, but prefer permissions)
    isSuperAdmin,
    isOrgAdmin: orgRole === 'ADMIN',
    isAdmin: isSuperAdmin,

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

    permissions, // Export raw permissions array for complex components

    // Org context
    isOrgMember: hasOrg,
    userOrg,
  };
};

/** Quick check — just whether user has an org, no full membership fetch */
export const useHasOrganization = () => {
  const { data: orgsData } = useOrganizations();
  const organizations = orgsData?.content || orgsData || [];
  return {
    hasOrg: organizations.length > 0,
    isLoading: false,
  };
};

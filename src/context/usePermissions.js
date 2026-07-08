import { useMemo } from 'react';
import { useAuth } from '@/features/auth/model/AuthContext';
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

  // Find the current user's membership to get their actual orgRole
  const myMembership = useMemo(
    () => membersList.find(m => m.username === user?.username),
    [membersList, user?.username]
  );

  const orgRole = myMembership?.orgRole || null;

  // Derived role checks based on ACTUAL org role
  const isOrgAdmin = orgRole === 'ADMIN';
  const isDirector = orgRole === 'DIRECTOR';
  const isManager = orgRole === 'MANAGER';
  const isEmployee = orgRole === 'EMPLOYEE';

  // Computed permission flags
  const canManage = isSuperAdmin || isOrgAdmin;
  const canAssign = isSuperAdmin || isOrgAdmin || isDirector || isManager;
  const canReview = isSuperAdmin || isOrgAdmin || isDirector || isManager;
  const canCreateTeam = isSuperAdmin || isOrgAdmin || isDirector || isManager;

  return {
    // Actual role
    orgRole,
    myMembership,

    // Role booleans
    isSuperAdmin,
    isOrgAdmin,
    isDirector,
    isManager,
    isEmployee,
    isAdmin: isSuperAdmin, // Legacy: "isAdmin" means platform super admin

    // Permission flags
    canManage,
    canAssign,
    canReview,
    canCreateTeam,

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

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as orgApi from '../api/organization.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';

export const useOrganizations = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.organizations.all,
    queryFn: () => orgApi.getUserOrganizations(),
    ...options,
  });
};

export const useOrganization = (orgId) => {
  return useQuery({
    queryKey: queryKeys.organizations.detail(orgId),
    queryFn: () => orgApi.getOrganization(orgId),
    enabled: !!orgId,
  });
};

export const useCreateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orgApi.createOrganization(payload),
    onSuccess: () => {
      toast.success('Organization created');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create organization');
    },
  });
};

export const useOrgMembers = (orgId) => {
  return useQuery({
    queryKey: queryKeys.organizations.members(orgId),
    queryFn: () => orgApi.getOrgMembers(orgId),
    select: (data) => data?.content || data || [],
    enabled: !!orgId,
  });
};

export const useInviteMember = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orgApi.inviteMember(orgId, payload),
    onSuccess: () => {
      toast.success('Member invited');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to invite member');
    },
  });
};

export const useMyInvites = () => {
  return useQuery({
    queryKey: queryKeys.organizations.invites(),
    queryFn: () => orgApi.getMyInvites(),
  });
};

export const useAcceptInvite = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (inviteId) => orgApi.acceptInvite(inviteId),
    onSuccess: async () => {
      toast.success('Organization joined');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invites() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    },
  });
};

export const useDeclineInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId) => orgApi.declineInvite(inviteId),
    onSuccess: () => {
      toast.success('Invite declined');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.invites() });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to decline invite');
    },
  });
};

export const useRemoveMember = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => orgApi.removeMember(orgId, userId),
    onSuccess: () => {
      toast.success('Member removed');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.teams(orgId) });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });
};

export const useOrgTeams = (orgId) => {
  return useQuery({
    queryKey: queryKeys.organizations.teams(orgId),
    queryFn: () => orgApi.getOrgTeams(orgId),
    select: (data) => data?.content || data || [],
    enabled: !!orgId,
  });
};

export const useCreateTeam = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orgApi.createTeam(orgId, payload),
    onSuccess: () => {
      toast.success('Team created');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.teams(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create team');
    },
  });
};

// Leave Requests
export const useRequestLeave = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reason) => orgApi.requestLeave(orgId, reason),
    onSuccess: () => {
      toast.success('Leave requested. Waiting for admin approval.');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.leaveRequests(orgId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to request leave');
    },
  });
};

export const useApproveLeave = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (requestId) => orgApi.approveLeave(orgId, requestId),
    onSuccess: () => {
      toast.success('Leave request approved');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.leaveRequests(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to approve leave');
    },
  });
};

export const useRejectLeave = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ requestId, comment }) => orgApi.rejectLeave(orgId, requestId, comment),
    onSuccess: () => {
      toast.success('Leave request rejected');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.leaveRequests(orgId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to reject leave');
    },
  });
};

export const useLeaveRequests = (orgId) => {
  return useQuery({
    queryKey: queryKeys.organizations.leaveRequests(orgId),
    queryFn: () => orgApi.getLeaveRequests(orgId),
    enabled: !!orgId,
  });
};

export const useLeaveRequestStatus = (orgId) => {
  return useQuery({
    queryKey: [...queryKeys.organizations.leaveRequests(orgId), 'status'],
    queryFn: () => orgApi.getLeaveRequestStatus(orgId),
    enabled: !!orgId,
  });
};

// --- C1 Fix: Member Role Update ---

export const useUpdateMemberRole = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleId }) => orgApi.updateMemberRole(orgId, userId, { roleId }),
    onSuccess: () => {
      toast.success('Member role updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.members(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId) });
      queryClient.invalidateQueries({ queryKey: ['teams'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });
};

// --- M4 Fix: Team Member Management ---

export const useAddTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => orgApi.addTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      toast.success('Member added to team');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.teams(undefined) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to add team member');
    },
  });
};

export const useRemoveTeamMember = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => orgApi.removeTeamMember(teamId, userId),
    onSuccess: (_, { teamId }) => {
      toast.success('Member removed from team');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove team member');
    },
  });
};

// --- Org Roles Management ---

export const useOrgRoles = (orgId) => {
  return useQuery({
    queryKey: ['organizations', orgId, 'roles'],
    queryFn: () => orgApi.getOrgRoles(orgId),
    enabled: !!orgId,
  });
};

export const useCreateOrgRole = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orgApi.createOrgRole(orgId, payload),
    onSuccess: () => {
      toast.success('Role created');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'roles'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create role');
    },
  });
};

export const useUpdateOrgRolePermissions = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, permissionNames }) => orgApi.updateOrgRolePermissions(orgId, roleId, { permissionNames }),
    onSuccess: () => {
      toast.success('Permissions updated');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'roles'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    },
  });
};

// --- Invite Link Hooks ---
export const useCreateInviteLink = (orgId) => {
  return useMutation({
    mutationFn: (roleId) => orgApi.createInviteLink(orgId, roleId),
    onSuccess: () => {
      toast.success('Shareable invite link created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invite link');
    },
  });
};

export const useAcceptInviteByToken = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (token) => orgApi.acceptInviteByToken(token),
    onSuccess: async () => {
      toast.success('Joined organization successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    },
  });
};

// --- Org Role Hooks ---
export const useUpdateOrgRole = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, payload }) => orgApi.updateOrgRole(orgId, roleId, payload),
    onSuccess: () => {
      toast.success('Org role updated');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'roles'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update role');
    },
  });
};

export const useDeleteOrgRole = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId) => orgApi.deleteOrgRole(orgId, roleId),
    onSuccess: () => {
      toast.success('Org role deleted');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'roles'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    },
  });
};

// --- Team Hooks ---
export const useTeam = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId],
    queryFn: () => orgApi.getTeam(teamId),
    enabled: !!teamId,
    refetchInterval: 5000,
  });
};

export const useUpdateTeam = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, payload }) => orgApi.updateTeam(teamId, payload),
    onSuccess: (_, { teamId }) => {
      toast.success('Team updated successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'teams'] });
      queryClient.invalidateQueries({ queryKey: ['teams', teamId] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update team');
    },
  });
};

export const useDeleteTeam = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (teamId) => orgApi.deleteTeam(teamId),
    onSuccess: () => {
      toast.success('Team deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['organizations', orgId, 'teams'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete team');
    },
  });
};

export const useAdminLeave = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => orgApi.adminLeave(orgId, payload),
    onSuccess: () => {
      toast.success('Left organization successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to leave organization');
    },
  });
};

// --- Team Messages ---
export const useTeamMessages = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId, 'messages'],
    queryFn: () => orgApi.getTeamMessages(teamId),
    enabled: !!teamId,
    refetchInterval: 5000,
  });
};

export const useSendTeamMessage = (teamId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => orgApi.sendTeamMessage(teamId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'messages'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useDeleteTeamMessage = (teamId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => orgApi.deleteTeamMessage(teamId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'messages'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });
};



// --- Team Observers ---
export const useTeamObservers = (teamId) => {
  return useQuery({
    queryKey: ['teams', teamId, 'observers'],
    queryFn: () => orgApi.getTeamObservers(teamId),
    enabled: !!teamId,
  });
};

export const useAddTeamObserver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => orgApi.addTeamObserver(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'observers'] });
    },
  });
};

export const useRemoveTeamObserver = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ teamId, userId }) => orgApi.removeTeamObserver(teamId, userId),
    onSuccess: (_, { teamId }) => {
      queryClient.invalidateQueries({ queryKey: ['teams', teamId, 'observers'] });
    },
  });
};

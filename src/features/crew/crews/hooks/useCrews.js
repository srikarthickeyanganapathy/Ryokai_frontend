import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { crewApi } from '../api/crew.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export const useCrews = () => {
  return useQuery({
    queryKey: queryKeys.crews.all,
    queryFn: () => crewApi.getCrews(),
  });
};

export const useDiscoverCrews = () => {
  return useQuery({
    queryKey: [...queryKeys.crews.all, 'discover'],
    queryFn: () => crewApi.discoverCrews(),
  });
};

export const useJoinPublicCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crewId) => crewApi.joinPublicCrew(crewId),
    onSuccess: () => {
      toast.success('Joined crew');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to join crew');
    },
  });
};

export const useCrew = (crewId) => {
  return useQuery({
    queryKey: queryKeys.crews.detail(crewId),
    queryFn: () => crewApi.getCrew(crewId),
    enabled: !!crewId,
    refetchInterval: 5000,
  });
};

export const useCreateCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => crewApi.createCrew(payload),
    onSuccess: () => {
      toast.success('Crew created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create crew');
    },
  });
};

export const useUpdateCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ crewId, payload }) => crewApi.updateCrew(crewId, payload),
    onSuccess: (_, { crewId }) => {
      toast.success('Crew updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update crew');
    },
  });
};

export const useDeleteCrew = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (crewId) => crewApi.deleteCrew(crewId),
    onSuccess: () => {
      toast.success('Crew deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete crew');
    },
  });
};

export const useCrewMembers = (crewId) => {
  return useQuery({
    queryKey: queryKeys.crews.members(crewId),
    queryFn: () => crewApi.getCrewMembers(crewId),
    enabled: !!crewId,
    refetchInterval: 5000,
  });
};

export const useInviteCrewMember = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (email) => crewApi.inviteMember(crewId, email),
    onSuccess: () => {
      toast.success('Crew invitation sent');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.members(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send invitation');
    },
  });
};

export const useCreateCrewInviteLink = (crewId) => {
  return useMutation({
    mutationFn: () => crewApi.createInviteLink(crewId),
    onSuccess: () => {
      toast.success('Invite link created');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create invite link');
    },
  });
};

export const useAcceptCrewInvite = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (inviteId) => crewApi.acceptInvite(inviteId),
    onSuccess: () => {
      toast.success('Joined crew successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to accept invite');
    },
  });
};

export const useRemoveCrewMember = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId) => crewApi.removeMember(crewId, userId),
    onSuccess: () => {
      toast.success('Crew member removed');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.members(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to remove member');
    },
  });
};

export const useLeaveCrew = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => crewApi.leaveCrew(crewId),
    onSuccess: () => {
      toast.success('Left crew successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to leave crew');
    },
  });
};

export const useTransferCrewOwnership = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newOwnerId) => crewApi.transferCrewOwnership(crewId, newOwnerId),
    onSuccess: () => {
      toast.success('Ownership transferred successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.members(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to transfer ownership');
    },
  });
};

export const useCrewProjects = (crewId) => {
  return useQuery({
    queryKey: queryKeys.crews.projects(crewId),
    queryFn: () => crewApi.getCrewProjects(crewId),
    enabled: !!crewId,
  });
};

export const useShareProjectWithCrew = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => crewApi.shareProject(crewId, projectId),
    onSuccess: () => {
      toast.success('Project shared with crew');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.projects(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to share project');
    },
  });
};

export const useUnshareProjectFromCrew = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (projectId) => crewApi.unshareProject(crewId, projectId),
    onSuccess: () => {
      toast.success('Project unshared from crew');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.projects(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to unshare project');
    },
  });
};

export const useCrewChannels = (crewId) => {
  return useQuery({
    queryKey: queryKeys.crews.channels(crewId),
    queryFn: () => crewApi.getChannels(crewId),
    enabled: !!crewId,
  });
};

export const useCreateCrewChannel = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => crewApi.createChannel(crewId, payload),
    onSuccess: () => {
      toast.success('Channel created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.channels(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create channel');
    },
  });
};

export const useDeleteCrewChannel = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (channelId) => crewApi.deleteChannel(crewId, channelId),
    onSuccess: () => {
      toast.success('Channel deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.channels(crewId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.detail(crewId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete channel');
    },
  });
};

export const useChannelMessages = (crewId, channelId) => {
  return useQuery({
    queryKey: queryKeys.crews.messages(crewId, channelId),
    queryFn: () => crewApi.getChannelMessages(crewId, channelId),
    enabled: !!crewId && !!channelId,
    refetchInterval: 5000, // simple polling fallback to STOMP/WS for instant messages
  });
};

export const useSendChannelMessage = (crewId, channelId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content) => crewApi.sendMessage(crewId, channelId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.messages(crewId, channelId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to send message');
    },
  });
};

export const useUpdateChannelMessage = (crewId, channelId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, content }) => crewApi.updateMessage(crewId, channelId, messageId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.messages(crewId, channelId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update message');
    },
  });
};

export const useDeleteChannelMessage = (crewId, channelId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (messageId) => crewApi.deleteMessage(crewId, channelId, messageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.crews.messages(crewId, channelId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete message');
    },
  });
};

export const useConvertMessageToTask = (crewId, channelId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ messageId, payload }) => crewApi.convertMessageToTask(crewId, channelId, messageId, payload),
    onSuccess: () => {
      toast.success('Message converted to task');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to convert message');
    },
  });
};

export const useCreateCrewTask = (crewId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => crewApi.createCrewTask(crewId, payload),
    onSuccess: () => {
      toast.success('Crew task created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create crew task');
    },
  });
};

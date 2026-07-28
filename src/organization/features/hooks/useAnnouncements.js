import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as announcementApi from '../api/announcement.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

export const useAnnouncements = (orgId, params = {}) => {
  return useQuery({
    queryKey: [...queryKeys.announcements.list(orgId), params],
    queryFn: () => announcementApi.getAnnouncements(orgId, params),
    enabled: !!orgId,
    select: (data) => data, // Usually data.content handles the array
  });
};

export const useCreateAnnouncement = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => announcementApi.createAnnouncement(orgId, payload),
    onSuccess: () => {
      toast.success('Announcement posted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.list(orgId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.detail(orgId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to post announcement');
    },
  });
};

export const useDeleteAnnouncement = (orgId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (announcementId) => announcementApi.deleteAnnouncement(orgId, announcementId),
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.announcements.list(orgId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete announcement');
    },
  });
};

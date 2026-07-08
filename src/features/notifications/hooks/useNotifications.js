import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import * as notificationApi from '../api/notification.api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

// Named useNotificationQueries to avoid collision with
// NotificationProvider.jsx's useNotifications (STOMP context hook)

export const useNotificationList = (params = { page: 0, size: 20 }) => {
  return useQuery({
    queryKey: queryKeys.notifications.list(params),
    queryFn: () => notificationApi.getNotifications(params),
    select: (data) => data?.content || data || [],
  });
};

export const useNotificationInfiniteList = () => {
  return useInfiniteQuery({
    queryKey: queryKeys.notifications.list('infinite'),
    queryFn: async ({ pageParam = 0 }) => {
      return await notificationApi.getNotifications({ page: pageParam, size: 20 });
    },
    getNextPageParam: (lastPage) => {
      if (lastPage.number < lastPage.totalPages - 1) {
        return lastPage.number + 1;
      }
      return undefined;
    },
  });
};

export const useUnreadCount = () => {
  return useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationApi.getUnreadCount(),
    refetchInterval: 30000, // Poll every 30s as fallback to STOMP
  });
};

export const useMarkRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.markAsRead(id),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const prev = queryClient.getQueryData(queryKeys.notifications.unreadCount());
      if (typeof prev === 'number' && prev > 0) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), prev - 1);
      } else if (prev && typeof prev.count === 'number' && prev.count > 0) {
        // Fallback just in case old cache is still present
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), prev.count - 1);
      }
      return { prev };
    },
    onError: (error, _, context) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to mark as read');
      if (context?.prev !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.prev);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useMarkAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationApi.markAllRead(),
    onMutate: async () => {
      // Optimistic: set unread count to 0
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });
      const previousCount = queryClient.getQueryData(queryKeys.notifications.unreadCount());
      queryClient.setQueryData(queryKeys.notifications.unreadCount(), 0);
      return { previousCount };
    },
    onError: (error, _, context) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to mark all as read');
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => notificationApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete notification');
    },
  });
};

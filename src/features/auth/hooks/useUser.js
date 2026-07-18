import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as userApi from '../api/user.api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';
import { useAuth } from './useAuth';

export const useProfile = () => {
  return useQuery({
    queryKey: queryKeys.users.me(),
    queryFn: () => userApi.getMe(),
  });
};

export const useUsersList = () => {
  return useQuery({
    queryKey: ['users', 'list'],
    queryFn: () => userApi.getAllUsers(),
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (profileData) => userApi.updateProfile(profileData),
    onSuccess: async () => {
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      // Sync AuthContext.user so sidebar/header reflects the new name immediately
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update profile');
    },
  });
};

export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { refreshUser } = useAuth();
  return useMutation({
    mutationFn: (file) => userApi.uploadAvatar(file),
    onSuccess: async () => {
      toast.success('Avatar uploaded successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.me() });
      // Sync AuthContext.user so header avatar updates immediately
      await refreshUser();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload avatar');
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) => userApi.changePassword(currentPassword, newPassword),
    onSuccess: () => {
      toast.success('Password changed. Redirecting to login...');
      setTimeout(() => {
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('jwt_refresh');
        window.location.href = '/login';
      }, 1500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to change password');
    },
  });
};

export const useSessions = () => {
  return useQuery({
    queryKey: queryKeys.users.sessions(),
    queryFn: () => userApi.getSessions(),
  });
};

export const useRevokeSession = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tokenId) => userApi.revokeSession(tokenId),
    onSuccess: () => {
      toast.success('Session revoked');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.sessions() });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to revoke session');
    },
  });
};

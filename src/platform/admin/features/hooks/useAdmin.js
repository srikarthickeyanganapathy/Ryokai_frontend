import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminApi from '../api/admin.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';

// --- Roles ---

export const useRoles = () => {
  return useQuery({
    queryKey: queryKeys.admin.roles.list(),
    queryFn: () => adminApi.getRoles(),
  });
};

export const useCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleData) => adminApi.createRole(roleData),
    onSuccess: () => {
      toast.success('Role created');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create role');
    },
  });
};

export const useUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roleId, roleData }) => adminApi.updateRole(roleId, roleData),
    onSuccess: () => {
      toast.success('Role updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update role');
    },
  });
};

export const useDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roleId) => adminApi.deleteRole(roleId),
    onSuccess: () => {
      toast.success('Role deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete role');
    },
  });
};

// --- Permissions ---

export const usePermissionsList = () => {
  return useQuery({
    queryKey: queryKeys.admin.permissions.list(),
    queryFn: () => adminApi.getPermissions(),
  });
};

export const useRolePermissions = (roleId) => {
  return useQuery({
    queryKey: queryKeys.admin.roles.permissions(roleId),
    queryFn: () => adminApi.getRolePermissions(roleId),
    enabled: !!roleId,
  });
};

export const useAssignRolePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    // Sends permission NAME strings, not IDs
    mutationFn: ({ roleId, permissionNames }) => adminApi.assignRolePermissions(roleId, permissionNames),
    onSuccess: (_, { roleId }) => {
      toast.success('Permissions updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.permissions(roleId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.admin.roles.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update permissions');
    },
  });
};

// --- Super Admin: Organization Management ---

export const useAdminOrganizations = () => {
  return useQuery({
    queryKey: ['admin', 'organizations'],
    queryFn: () => adminApi.getAdminOrganizations(),
  });
};

export const useSuspendOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId) => adminApi.suspendOrganization(orgId),
    onSuccess: () => {
      toast.success('Organization suspended');
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to suspend organization');
    },
  });
};

export const useActivateOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId) => adminApi.activateOrganization(orgId),
    onSuccess: () => {
      toast.success('Organization activated');
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to activate organization');
    },
  });
};

export const useDeleteOrganization = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orgId) => adminApi.deleteOrganization(orgId),
    onSuccess: () => {
      toast.success('Organization deleted');
      queryClient.invalidateQueries({ queryKey: ['admin', 'organizations'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.organizations.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to delete organization');
    },
  });
};

// --- Users (Admin Role Assignment) ---

export const useAssignUserRoles = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, roleNames }) => adminApi.assignUserRoles(userId, roleNames),
    onSuccess: () => {
      toast.success('User roles updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update user roles');
    },
  });
};

export const useUserRoles = (userId) => {
  return useQuery({
    queryKey: [...queryKeys.users.all, userId, 'roles'],
    queryFn: () => adminApi.getUserRoles(userId),
    enabled: !!userId,
  });
};


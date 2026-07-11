import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as taskTemplateApi from '../api/taskTemplate.api';
import { queryKeys } from '@/lib/queryKeys';
import { toast } from 'sonner';

export const useTaskTemplates = () => {
  return useQuery({
    queryKey: queryKeys.templates.all,
    queryFn: () => taskTemplateApi.getTemplates(),
    select: (data) => data || [],
  });
};

export const useCreateTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => taskTemplateApi.createTemplate(payload),
    onSuccess: () => {
      toast.success('Template created successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create template');
    },
  });
};

export const useUpdateTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => taskTemplateApi.updateTemplate(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Template updated successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update template');
    },
  });
};

export const useDeleteTaskTemplate = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskTemplateApi.deleteTemplate(id),
    onSuccess: () => {
      toast.success('Template deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete template');
    },
  });
};

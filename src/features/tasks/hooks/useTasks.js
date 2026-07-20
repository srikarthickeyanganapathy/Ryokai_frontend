import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import * as taskApi from '../api/task.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';

export const useTaskList = (filters) => {
  return useQuery({
    queryKey: [...queryKeys.tasks.list(filters)],
    queryFn: () => taskApi.getTasks(filters),
    select: (data) => data?.content || data || [],
  });
};

export const useAssignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => taskApi.assignTask(payload),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      return {};
    },
    onSuccess: () => {
      toast.success('Task assigned successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to assign task');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { workspaceMode } = useWorkspace();
  return useMutation({
    mutationFn: async (payload) => {
      // Ensure required fields: assigneeUsername defaults to current user, priority defaults to MEDIUM
      // Backend expects LocalDateTime — empty string "" causes Jackson 500.
      const taskPayload = {
        ...payload,
        assigneeUsername: payload.assigneeUsername || user?.username,
        priority: payload.priority || 'MEDIUM',
        dueDate: payload.dueDate || null,
        teamId: payload.teamId ? Number(payload.teamId) : null,
      };

      if (workspaceMode === 'PERSONAL') {
        taskPayload.isPersonal = true;
        return await taskApi.createPersonalTask(taskPayload);
      } else if (workspaceMode === 'CREWS') {
        // Find the active crew ID from somewhere, or it should be passed in payload
        const crewId = payload.crewId || (payload.projectId ? null : null); 
        // Wait, how do we know crewId? It is passed from TaskForm? 
        taskPayload.crewId = crewId;
        return await taskApi.createCrewTask(taskPayload);
      } else {
        taskPayload.isPersonal = false;
        return await taskApi.assignTask(taskPayload);
      }
    },
    onSuccess: (data, variables) => {
      const taskTitle = data?.title || variables?.title || 'Task';
      toast.success(`'${taskTitle}' created successfully`);
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to create task');
    }
  });
};

export const useSubmitTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.submitTask(id),
    onSuccess: (data) => {
      const title = data?.title || 'Task';
      toast.success(`'${title}' submitted for review`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit task');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useCompletePersonalTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.completePersonalTask(id),
    onSuccess: (data) => {
      const title = data?.title || 'Task';
      toast.success(`'${title}' marked as complete`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to complete task');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

// FIX (SM-C01): new hook for completing CREW tasks (ASSIGNED -> COMPLETED).
// Crew tasks follow the no-review pipeline per the spec state machine.
export const useCompleteCrewTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.completeCrewTask(id),
    onSuccess: (data) => {
      const title = data?.title || 'Crew task';
      toast.success(`'${title}' completed`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to complete crew task');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

// FIX (SM-M03): new hook for recalling a submitted task (SUBMITTED -> ASSIGNED).
export const useRecallTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.recallTask(id),
    onSuccess: (data) => {
      const title = data?.title || 'Task';
      toast.success(`'${title}' recalled to draft`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to recall task');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useBulkAssign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => taskApi.bulkAssign(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to bulk assign tasks');
    },
  });
};

export const useApproveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.approveTask(id),
    onSuccess: (data) => {
      const title = data?.title || 'Task';
      toast.success(`'${title}' approved and completed`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to approve task');
    },
    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useRejectTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => taskApi.rejectTask(id, reason),
    onSuccess: (data) => {
      const title = data?.title || 'Task';
      toast.success(`'${title}' rejected and sent back`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to reject task');
    },
    onSettled: (_, __, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
  });
};

export const useComments = (taskId) => {
  return useQuery({
    queryKey: queryKeys.tasks.comments(taskId),
    queryFn: () => taskApi.getComments(taskId),
    select: (data) => data?.content || data || [],
    enabled: !!taskId,
  });
};

export const useAddComment = (taskId) => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  return useMutation({
    mutationFn: (text) => taskApi.addComment(taskId, text),
    onMutate: async (text) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.comments(taskId) });
      const previousComments = queryClient.getQueryData(queryKeys.tasks.comments(taskId));
      queryClient.setQueryData(queryKeys.tasks.comments(taskId), (old) => {
        if (!old) return old;
        return {
          ...old,
          content: [...(old.content || []), { 
            id: Date.now(), 
            username: currentUser?.username || 'me',
            comment: text, 
            createdAt: new Date().toISOString() 
          }]
        };
      });
      return { previousComments };
    },
    onSuccess: () => {
      toast.success('Comment added');
    },
    onError: (error, _, context) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to add comment');
      if (context?.previousComments) {
        queryClient.setQueryData(queryKeys.tasks.comments(taskId), context.previousComments);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.comments(taskId) });
    },
  });
};

export const useAddChecklistItem = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (text) => taskApi.addChecklistItem(taskId, text),
    onSuccess: () => {
      toast.success('Item added');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to add item');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

export const useToggleChecklistItem = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => taskApi.toggleChecklistItem(taskId, itemId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.all });
      return {};
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to toggle item');
    },
    onSettled: () => {
      if (taskId) {
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      }
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

export const useDeleteChecklistItem = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemId) => taskApi.deleteChecklistItem(taskId, itemId),
    onSuccess: () => {
      toast.success('Checklist item deleted');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete item');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

export const useReorderChecklistItems = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (itemIds) => taskApi.reorderChecklistItems(taskId, itemIds),
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to reorder items');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
  });
};

export const useTaskHistory = (taskId) => {
  return useQuery({
    queryKey: queryKeys.tasks.history(taskId),
    queryFn: () => taskApi.getTaskHistory(taskId),
    select: (data) => data?.content || data || [],
    enabled: !!taskId,
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }) => taskApi.updateTask(id, payload),
    onSuccess: (_, { id }) => {
      toast.success('Task updated');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to update task');
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.deleteTask(id),
    onSuccess: () => {
      toast.success('Task deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete task');
    },
  });
};

export const useArchiveTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => taskApi.archiveTask(id),
    onSuccess: (_, id) => {
      toast.success('Task archived successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to archive task');
    },
  });
};

export const useAddDependency = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blocksTaskId) => taskApi.addDependency(taskId, blocksTaskId),
    onSuccess: () => {
      toast.success('Dependency added');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to add dependency');
    },
  });
};

export const useRemoveDependency = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (depId) => taskApi.removeDependency(taskId, depId),
    onSuccess: () => {
      toast.success('Dependency removed');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to remove dependency');
    },
  });
};

export const useReassignTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, newAssigneeId }) => taskApi.reassignTask(taskId, newAssigneeId),
    onSuccess: (_, { taskId }) => {
      toast.success('Task reassigned');
      if (taskId) queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to reassign task');
    },
  });
};

// --- Attachments ---

export const useAttachments = (taskId) => {
  return useQuery({
    queryKey: queryKeys.tasks.attachments(taskId),
    queryFn: () => taskApi.getAttachments(taskId),
    enabled: !!taskId,
  });
};

export const useUploadAttachment = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file) => taskApi.uploadAttachment(taskId, file),
    onSuccess: () => {
      toast.success('Attachment uploaded');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.attachments(taskId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload attachment');
    },
  });
};

export const useDeleteAttachment = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (attachmentId) => taskApi.deleteAttachment(taskId, attachmentId),
    onSuccess: () => {
      toast.success('Attachment deleted');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.attachments(taskId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete attachment');
    },
  });
};

// --- Task Evidence Hooks ---
export const useEvidence = (taskId) => {
  return useQuery({
    queryKey: queryKeys.tasks.evidence(taskId),
    queryFn: () => taskApi.getEvidence(taskId),
    enabled: !!taskId,
  });
};

export const useAddEvidence = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => taskApi.addEvidence(taskId, payload),
    onSuccess: () => {
      toast.success('Evidence submitted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.evidence(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit evidence');
    },
  });
};

export const useDeleteEvidence = (taskId) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (evidenceId) => taskApi.deleteEvidence(taskId, evidenceId),
    onSuccess: () => {
      toast.success('Evidence deleted successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.evidence(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to delete evidence');
    },
  });
};

// --- Task Claim Hook (Crew tasks) ---
export const useClaimTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (taskId) => taskApi.claimTask(taskId),
    onSuccess: (_, taskId) => {
      toast.success('Task claimed successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to claim task');
    },
  });
};

// Note: Removing useTaskSubscription temporarily if NotificationProvider import fails. 
// If it was in use, we'll restore it properly connected to the web socket.


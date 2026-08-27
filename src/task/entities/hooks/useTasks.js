import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import * as taskApi from '../api/task.api';
import { queryKeys } from '@/shared/api/queryKeys';
import { toast } from 'sonner';
import { useAuth, usePermissions } from '@/identity';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { toBackendStatus } from '@/shared/lib/status';

/**
 * Workspace isolation: derive the server-side scope from the active workspace.
 *   PERSONAL -> no params (backend returns only own personal tasks)
 *   ORG      -> { orgId }   (backend returns ONLY that org's tasks)
 *   CREWS    -> { crewId }  (backend returns ONLY that crew's tasks)
 * Explicit caller filters win over the derived scope.
 */
function useWorkspaceScope() {
  const { workspaceMode, activeOrganization, activeCrew } = useWorkspace();
  if (workspaceMode === 'ORG' && activeOrganization?.id) return { orgId: activeOrganization.id };
  if (workspaceMode === 'CREWS' && activeCrew?.id) return { crewId: activeCrew.id };
  return {};
}

export const useTaskList = (filters) => {
  const wsScope = useWorkspaceScope();
  const { page = 0, size = 50, sort, ...restFilters } = filters || {};
  // A project board is the most specific scope — the backend resolves access per
  // project. Never stack the workspace scope (crewId/orgId) on top of an explicit
  // projectId, or the crew branch would swallow the project filter and show every
  // task in the crew instead of only this project's tasks.
  const effectiveFilters = { ...(restFilters.projectId ? {} : wsScope), ...restFilters, page, size, ...(sort ? { sort } : {}) };
  return useQuery({
    queryKey: [...queryKeys.tasks.list(effectiveFilters)],
    queryFn: () => taskApi.getTasks(effectiveFilters),
    select: (data) => ({
      tasks: data?.content || (Array.isArray(data) ? data : []),
      totalCount: data?.totalCount ?? data?.totalElements ?? (Array.isArray(data) ? data.length : 0),
      totalPages: data?.totalPages ?? 0,
      page: data?.page ?? effectiveFilters.page,
      size: data?.size ?? effectiveFilters.size,
    }),
  });
};

export const useTaskSearch = (searchQuery) => {
  const wsScope = useWorkspaceScope();
  const effectiveFilters = { ...wsScope, search: searchQuery };
  return useQuery({
    queryKey: [...queryKeys.tasks.list(effectiveFilters)],
    queryFn: () => taskApi.getTasks(effectiveFilters),
    select: (data) => ({
      tasks: data?.content || (Array.isArray(data) ? data : []),
      totalCount: data?.totalCount ?? data?.totalElements ?? (Array.isArray(data) ? data.length : 0),
      totalPages: data?.totalPages ?? 0,
    }),
    enabled: !!searchQuery,
  });
};

/**
 * Fetch a single task by ID straight from the backend (permission-checked on
 * the server). Used by the task detail page so deep links and cross-workspace
 * navigation resolve even when the task isn't in any locally cached list.
 */
export const useTask = (taskId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.tasks.detail(taskId),
    queryFn: () => taskApi.getTaskById(taskId),
    enabled: !!taskId && options.enabled !== false,
    retry: (failureCount, error) => {
      // 403/404 mean the task is gone or inaccessible — don't retry.
      if (error?.response?.status === 403 || error?.response?.status === 404) return false;
      return failureCount < 2;
    },
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
  const { workspaceMode, activeCrew, activeOrganization } = useWorkspace();
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
        // Personal tasks must never carry org/team/crew scope ids - the
        // backend auth gate would otherwise classify them as org/crew creates.
        delete taskPayload.orgId;
        delete taskPayload.teamId;
        delete taskPayload.crewId;
        return await taskApi.createPersonalTask(taskPayload);
      } else if (workspaceMode === 'CREWS') {
        const crewId = payload.crewId || activeCrew?.id || null;
        if (!crewId) {
          throw new Error('A crew must be selected to create a crew task');
        }
        taskPayload.crewId = crewId;
        // Crew tasks must NEVER carry org/team context - the DTO auth gate
        // classifies the workspace from orgId/crewId, and a leaked orgId turns
        // a crew create into an org-RBAC evaluation (403 ACCESS_DENIED).
        delete taskPayload.orgId;
        delete taskPayload.teamId;
        // FIX: crew tasks are claim-based — the backend maps a provided
        // assigneeUsername to IN_PROGRESS (claimed). Never auto-assign the
        // creator; crew tasks must start unclaimed (TODO) so members can claim.
        delete taskPayload.assigneeUsername;
        return await taskApi.createCrewTask(taskPayload);
      } else {
        // Org task: send orgId explicitly (from the caller payload or the
        // active org) so the backend never has to guess the org from an
        // arbitrary membership.
        const orgId = payload.orgId || activeOrganization?.id || null;
        if (orgId) taskPayload.orgId = Number(orgId);
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

export const useCreateTaskWithDependencies = () => {
  const queryClient = useQueryClient();
  const createTaskMutation = useCreateTask();

  return useMutation({
    mutationFn: async (payload) => {
      const { dependsOnIds = [], ...taskPayload } = payload;
      
      // 1. Create the task
      const createdTask = await createTaskMutation.mutateAsync(taskPayload);
      
      // 2. Add dependencies sequentially if any exist
      let failedDependencies = 0;
      if (dependsOnIds.length > 0) {
        for (const depId of dependsOnIds) {
          try {
            await taskApi.addDependency(createdTask.id, depId);
          } catch (err) {
            console.error(`Failed to add dependency ${depId}`, err);
            failedDependencies++;
          }
        }
      }
      
      return { createdTask, failedDependencies, totalDependencies: dependsOnIds.length };
    },
    onSuccess: ({ createdTask, failedDependencies, totalDependencies }) => {
      if (failedDependencies > 0) {
        toast.warning(`Task created. ${totalDependencies - failedDependencies} of ${totalDependencies} dependencies were attached.`);
      } else if (totalDependencies > 0) {
        // toast.success(`Task created with ${totalDependencies} dependencies.`); // Optional, createTask already toasts success
      }
      
      // Invalidate relevant graphs and details
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(createdTask.id) });
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error) => {
      if (error.message !== 'Create failed') {
        toast.error(error.response?.data?.message || error.message || 'Failed to create task with dependencies');
      }
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

// FIX (SM-C01): new hook for completing CREW tasks (IN_PROGRESS -> COMPLETED).
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
    mutationFn: ({ text, parentId }) => taskApi.addComment(taskId, text, parentId),
    onMutate: async ({ text, parentId }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.tasks.comments(taskId) });
      const previousComments = queryClient.getQueryData(queryKeys.tasks.comments(taskId));
      queryClient.setQueryData(queryKeys.tasks.comments(taskId), (old) => {
        if (!old) return old;
        return {
          ...old,
          content: [...(old.content || []), { 
            id: Date.now(), 
            username: currentUser?.username || 'me',
            text: text, 
            parentId: parentId || null,
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

export const useTaskHistory = (taskId, params = {}) => {
  return useQuery({
    queryKey: queryKeys.tasks.history(taskId, params),
    queryFn: () => taskApi.getTaskHistory(taskId, params),
    // Pass the full mapped Page<ActivityEvent> through, not just content, so we preserve pagination metadata.
    select: (data) => data,
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
    onError: (error, { id }) => {
      if (error.response?.status === 409) {
        // INT-004: Immediately refetch on optimistic lock failure
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.detail(id) });
        queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all });
      } else {
        toast.error(error.response?.data?.message || error.message || 'Failed to update task');
      }
    },
  });
};

/**
 * Shared status-transition router for kanban boards (projects / teams).
 *
 * The backend has NO `status` field on PUT /tasks/{id} — status changes MUST go
 * through the dedicated state-transition endpoints (submit / approve / reject /
 * recall / complete / complete-crew / claim). This hook routes a board drop to
 * the correct mutation and enforces the same permission rules as the backend
 * @PreAuthorize guards, so the UI fails closed instead of firing 403s.
 *
 * targetStatus accepts backend enums or board aliases:
 *   'SUBMITTED' | 'IN_REVIEW'          -> submit for review
 *   'APPROVED' | 'COMPLETED' | 'DONE'  -> complete (personal/crew) / approve (org)
 *   'IN_PROGRESS' | 'TODO' | 'TO_DO'   -> recall (from review) or no-op
 *   'REJECTED'                         -> rejected on boards (needs reason + reassign)
 *
 * Returns true when a mutation was fired, false when the move was rejected
 * (a toast explains why).
 */
export const useTaskStatusChange = () => {
  const { user } = useAuth();
  const { workspaceMode } = useWorkspace();
  const { canReview, canEditTask, isSuperAdmin } = usePermissions();

  const submitMutation = useSubmitTask();
  const approveMutation = useApproveTask();
  const recallMutation = useRecallTask();
  const completePersonalMutation = useCompletePersonalTask();
  const completeCrewMutation = useCompleteCrewTask();

  return useCallback((task, targetStatus) => {
    if (!task?.id) return false;

    const current = toBackendStatus(task.currentStatus || task.status);
    const target = String(targetStatus || '').toUpperCase();

    const isPersonalTask = workspaceMode === 'PERSONAL' || !!task.isPersonal;
    const isCrewTask = !!(task.crewId || task.crew);
    const isTerminal = current === 'COMPLETED' || current === 'APPROVED';

    const doneTarget = target === 'DONE' || target === 'COMPLETED' || target === 'APPROVED';
    const reviewTarget = target === 'SUBMITTED' || target === 'IN_REVIEW' || target === 'REVIEW';
    const progressTarget = target === 'IN_PROGRESS' || target === 'TODO' || target === 'TO_DO' || target === 'ASSIGNED';

    const assigneeName = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo);
    const isAssignee = assigneeName === user?.username || (typeof task.assignee === 'object' && task.assignee?.id === user?.id);

    if (doneTarget) {
      if (isTerminal) { toast.info('Task is already completed'); return false; }
      if (isPersonalTask) { completePersonalMutation.mutate(task.id); return true; }
      if (isCrewTask) {
        if (current === 'TODO' || current === 'IN_PROGRESS') { completeCrewMutation.mutate(task.id); return true; }
        toast.error('Crew tasks can only be completed when claimed (In Progress)'); return false;
      }
      if (current !== 'SUBMITTED') { toast.error('Only tasks In Review can be approved'); return false; }
      if (!canReview) { toast.error('You do not have permission to approve tasks'); return false; }
      if (assigneeName && assigneeName === user?.username) { toast.error('You cannot approve your own task'); return false; }
      approveMutation.mutate(task.id); return true;
    }

    if (reviewTarget) {
      if (current === 'SUBMITTED') { toast.info('Task is already In Review'); return false; }
      if (isPersonalTask) { toast.error('Personal tasks have no review step'); return false; }
      if (isCrewTask) { toast.error('Crew tasks skip review — move to Done to complete'); return false; }
      if (current !== 'TODO' && current !== 'IN_PROGRESS') { toast.error('Only To Do / In Progress tasks can be submitted for review'); return false; }
      if (!isAssignee && !isSuperAdmin && !canEditTask) { toast.error('Only the assignee can submit a task for review'); return false; }
      submitMutation.mutate(task.id); return true;
    }

    if (progressTarget) {
      if (current === 'SUBMITTED') {
        if (!isAssignee && !isSuperAdmin) { toast.error('Only the assignee can recall a submitted task'); return false; }
        recallMutation.mutate(task.id); return true;
      }
      if (current === 'REJECTED') { toast.error('Rejected tasks must be reassigned first'); return false; }
      if (isTerminal) { toast.error('Completed tasks cannot be reopened'); return false; }
      toast.info('Task is already in progress'); return false;
    }

    toast.error('Unsupported status change');
    return false;
  }, [workspaceMode, user, canReview, canEditTask, isSuperAdmin,
    submitMutation, approveMutation, recallMutation, completePersonalMutation, completeCrewMutation]);
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
      toast.success('Evidence uploaded successfully');
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.attachments(taskId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.tasks.evidence(taskId) });
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to upload evidence');
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


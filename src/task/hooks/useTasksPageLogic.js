import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth, useUsersList, usePermissions } from "@/identity";
import { useWorkspace } from "@/app/providers/WorkspaceProvider";
import { useTaskList, useUpdateTask, useDeleteTask, useSubmitTask, useApproveTask, useReassignTask, useCompletePersonalTask, useCompleteCrewTask, useRecallTask, useRejectTask, useCreateTaskWithDependencies } from "../entities/hooks/useTasks";
import { useProjects } from "@/project";
import { useOrgTeams } from "@/organization";
import { filterTasksByWorkspace } from "@/shared/lib/workspaceTaskFilter";
import { PRIORITY_OPTIONS } from "@/shared/lib/priority";
import { toast } from "sonner";

const PAGE_SIZE = 50;

export function useTasksPageLogic() {
  const [searchParams, setSearchParams] = useSearchParams();
  const viewMode = searchParams.get("view") || "list";
  const { user } = useAuth();
  const { canReview, canEditTask, canDeleteTask, canAssignTask, canReviewTask } = usePermissions();
  const { workspaceMode, activeOrganization } = useWorkspace();

  const [taskScope, setTaskScope] = useState("all");
  const [globalFilter, setGlobalFilter] = useState("");
  const [debouncedFilter, setDebouncedFilter] = useState("");
  const debounceRef = useRef(null);
  const [priorityFilter, setPriorityFilter] = useState([]);
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [teamFilter, setTeamFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("dueDate");
  const [currentPage, setCurrentPage] = useState(0);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [reassignData, setReassignData] = useState(null);
  const [isBulkAssignOpen, setIsBulkAssignOpen] = useState(false);

  useEffect(() => { debounceRef.current = setTimeout(() => setDebouncedFilter(globalFilter), 300); return () => clearTimeout(debounceRef.current); }, [globalFilter]);

  const { data: taskData, isLoading, isError, error, refetch } = useTaskList({ page: currentPage, size: PAGE_SIZE });
  const rawTasks = taskData?.tasks ?? [];
  const totalCount = taskData?.totalCount ?? 0;
  const totalPages = taskData?.totalPages ?? 0;
  const { data: allProjects = [] } = useProjects();
  const { data: orgTeams = [] } = useOrgTeams(activeOrganization?.id);
  const { data: allUsers } = useUsersList();

  const updateTaskMutation = useUpdateTask();
  const deleteTaskMutation = useDeleteTask();
  const submitTaskMutation = useSubmitTask();
  const approveTaskMutation = useApproveTask();
  const reassignTaskMutation = useReassignTask();
  const completePersonal = useCompletePersonalTask();
  const completeCrew = useCompleteCrewTask();
  const recallTask = useRecallTask();
  const rejectTask = useRejectTask();
  const createTaskMutation = useCreateTaskWithDependencies();

  const isBulkPending = completePersonal.isPending || completeCrew.isPending || submitTaskMutation.isPending || approveTaskMutation.isPending || reassignTaskMutation.isPending || rejectTask.isPending || deleteTaskMutation.isPending;
  useEffect(() => { setCurrentPage(0); }, [workspaceMode, activeOrganization?.id, taskScope, debouncedFilter, priorityFilter]);

  const projectsList = useMemo(() => (allProjects || []).map(p => ({ id: p.id, name: p.name })), [allProjects]);
  const teamsList = useMemo(() => (orgTeams || []).map(t => ({ id: t.id, name: t.name })), [orgTeams]);

  const tasks = useMemo(() => {
    if (!rawTasks) return [];
    let result = filterTasksByWorkspace(rawTasks, workspaceMode, activeOrganization);
    if (debouncedFilter) { const lower = debouncedFilter.toLowerCase(); result = result.filter(t => t.title?.toLowerCase().includes(lower) || t.description?.toLowerCase().includes(lower)); }
    if (projectFilter !== "ALL") result = result.filter(t => String(t.projectId) === String(projectFilter) || String(t.projectName) === String(projectFilter));
    if (teamFilter !== "ALL") result = result.filter(t => String(t.teamId) === String(teamFilter) || String(t.team?.id) === String(teamFilter));
    if (taskScope === "archived") result = result.filter(t => t.archived);
    else { result = result.filter(t => !t.archived); if (taskScope === "assigned") result = result.filter(t => t.assignedTo === user?.username); else if (taskScope === "completed") result = result.filter(t => t.status === "Done"); else if (taskScope === "today") { const today = new Date().toDateString(); result = result.filter(t => t.dueDate && new Date(t.dueDate).toDateString() === today); } else if (taskScope === "upcoming") { const today = new Date(); result = result.filter(t => t.dueDate && new Date(t.dueDate) > today); } }
    if (priorityFilter.length > 0) result = result.filter(t => priorityFilter.includes(String(t.priority).toUpperCase()));
    const priorityRank = Object.fromEntries(PRIORITY_OPTIONS.map((o, i) => [o.value, i]));
    return [...result].sort((a, b) => { if (sortBy === "priority") return (priorityRank[String(a.priority).toUpperCase()] ?? 99) - (priorityRank[String(b.priority).toUpperCase()] ?? 99); if (sortBy === "title") return (a.title || "").localeCompare(b.title || ""); if (sortBy === "updated") return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0); if (!a.dueDate && !b.dueDate) return 0; if (!a.dueDate) return 1; if (!b.dueDate) return -1; return new Date(a.dueDate) - new Date(b.dueDate); });
  }, [rawTasks, workspaceMode, activeOrganization, taskScope, debouncedFilter, priorityFilter, sortBy, user, projectFilter, teamFilter]);

  useEffect(() => { const id = searchParams.get("openTaskId"); if (id && tasks.length > 0) { const t = tasks.find(t => String(t.id) === String(id)); if (t && (!selectedTask || selectedTask.id !== t.id)) setSelectedTask(t); else if (!t && selectedTask) { setSelectedTask(null); setSearchParams(p => { p.delete("openTaskId"); return p; }, { replace: true }); } } else if (!id && selectedTask) setSelectedTask(null); }, [searchParams, tasks]);

  const selectedIds = Object.keys(rowSelection);
  const selectedTasks = selectedIds.map(id => tasks.find(t => String(t.id) === id)).filter(Boolean);
  const searchActive = globalFilter.length > 0;
  const filtersActive = taskScope !== "all" || priorityFilter.length > 0 || projectFilter !== "ALL" || teamFilter !== "ALL";

  const setViewMode = useCallback((mode) => { setSearchParams(p => { p.set("view", mode); return p; }, { replace: true }); }, [setSearchParams]);
  const handleTaskSelect = useCallback((task) => { setSelectedTask(task); setSearchParams(p => { p.set("openTaskId", task.id); return p; }, { replace: true }); }, [setSearchParams]);
  const handleTaskClose = useCallback(() => { setSelectedTask(null); setSearchParams(p => { p.delete("openTaskId"); return p; }, { replace: true }); }, [setSearchParams]);
  const handleClearFilters = useCallback(() => { setGlobalFilter(""); setPriorityFilter([]); setProjectFilter("ALL"); setTeamFilter("ALL"); setTaskScope("all"); }, []);

  const handleQuickComplete = useCallback((task) => { const current = task.currentStatus?.toUpperCase(); if (task.isPersonal) completePersonal.mutate(task.id); else if (task.crewId || task.crew) { if (current === "IN_PROGRESS") completeCrew.mutate(task.id); else if (current === "COMPLETED") toast.info("Already completed"); else toast.error("Crew task must be ASSIGNED to complete"); } else if (current === "IN_PROGRESS" || current === "TODO") { submitTaskMutation.mutate(task.id, { onSuccess: () => toast.success("\"" + task.title + "\" submitted") }); } else if (current === "REJECTED") toast.error("Rejected tasks must be reassigned first"); }, [completePersonal, completeCrew, submitTaskMutation]);
  const handleQuickDelete = useCallback((id) => deleteTaskMutation.mutate(id), [deleteTaskMutation]);

  const handleBulkComplete = useCallback(() => { let skipped = 0; selectedTasks.forEach(task => { const cur = task.currentStatus?.toUpperCase(); if (task.isPersonal) completePersonal.mutate(task.id); else if (task.crewId || task.crew) { if (cur === "IN_PROGRESS") completeCrew.mutate(task.id); else skipped++; } else if (cur === "IN_PROGRESS" || cur === "REJECTED") submitTaskMutation.mutate(task.id); else if (cur === "SUBMITTED") { if (!canReview || task.assignedTo === user?.username) { skipped++; return; } approveTaskMutation.mutate(task.id); } }); if (skipped > 0) toast.error(skipped + " task(s) skipped"); setRowSelection({}); }, [selectedTasks, completePersonal, completeCrew, submitTaskMutation, approveTaskMutation, canReview, user]);
  const handleBulkSubmit = useCallback(() => { let skipped = 0; selectedTasks.forEach(task => { const cur = task.currentStatus?.toUpperCase(); if (!task.isPersonal && !task.crewId && !task.crew && (cur === "IN_PROGRESS" || cur === "REJECTED")) submitTaskMutation.mutate(task.id); else skipped++; }); if (skipped > 0) toast.error(skipped + " task(s) could not be submitted"); setRowSelection({}); }, [selectedTasks, submitTaskMutation]);
  const handleBulkAssign = useCallback((targetUser) => { if (!targetUser) return; selectedTasks.forEach(task => reassignTaskMutation.mutate({ taskId: task.id, newAssigneeId: targetUser.id })); toast.success("Reassigned to " + targetUser.username); setIsBulkAssignOpen(false); setRowSelection({}); }, [selectedTasks, reassignTaskMutation]);
  const handleBulkDelete = useCallback(() => { selectedTasks.forEach(t => deleteTaskMutation.mutate(t.id)); toast.success("Deleted " + selectedTasks.length + " task(s)"); setRowSelection({}); }, [selectedTasks, deleteTaskMutation]);
  const handleReassignSubmit = useCallback((payload) => { if (!reassignData) return; const u = allUsers?.find(x => x.username === payload.assigneeUsername); if (u) reassignTaskMutation.mutate({ taskId: reassignData.id, newAssigneeId: u.id }, { onSuccess: () => { setReassignData(null); setRowSelection({}); } }); }, [reassignData, allUsers, reassignTaskMutation]);
  const handleCreateTask = useCallback((payload) => { createTaskMutation.mutate(payload, { onSuccess: () => setCreateOpen(false) }); }, [createTaskMutation]);

  return { tasks, isLoading, isError, error, refetch, totalCount, totalPages, viewMode, setViewMode, currentPage, setCurrentPage, selectedTask, handleTaskSelect, handleTaskClose, taskScope, setTaskScope, globalFilter, setGlobalFilter, priorityFilter, setPriorityFilter, projectFilter, setProjectFilter, teamFilter, setTeamFilter, sortBy, setSortBy, searchActive, filtersActive, handleClearFilters, projectsList, teamsList, allUsers, rowSelection, setRowSelection, selectedIds, selectedTasks, updateTaskMutation, deleteTaskMutation, isBulkPending, handleQuickComplete, handleQuickDelete, handleBulkComplete, handleBulkSubmit, handleBulkAssign, handleBulkDelete, createOpen, setCreateOpen, reassignData, setReassignData, isBulkAssignOpen, setIsBulkAssignOpen, handleCreateTask, handleReassignSubmit, createTaskMutation, user, canReview, canEditTask, canDeleteTask, canAssignTask, canReviewTask, workspaceMode };
}

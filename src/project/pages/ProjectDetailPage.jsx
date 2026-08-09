import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { SectionPanel } from '@/shared/ui/SectionPanel';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { ImmersiveStatCard, MetricGrid } from '@/shared/ui/Immersive';
import { ProgressBar, ProgressRing } from '@/shared/ui/Progress';
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent, PremiumCardFooter } from '@/shared/ui/PremiumCard';
import {
  PageShell, PageHero, PageStats, PageContent,
  PageToolbar, PageGrid, PageAside, FloatingActions
} from '@/shared/ui/PageShell';
import { PageState } from '@/shared/ui/PageState';
import { useProject, useUpdateProject, useDeleteProject, useUnshareProjectFromCrew, useProjectActivities } from '../features/hooks/useProjects';
import { useTeam, useOrgMembers, useOrgTeams } from '@/organization';
import { useCrewMembers, useCrews } from '@/crew';
import { ProjectForm } from '../components/ProjectForm';
import { CrewProjectShareModal } from '../components/CrewProjectShareModal';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useTaskList, useCreateTask, useReassignTask, useTaskStatusChange } from '@/task';
import { TaskForm } from '@/task';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority';
import { SaveToggle } from '@/library/saved/features/components/SaveToggle';
import { ENTITY_TYPES } from '@/shared/constants/entityTypes';
import { normalizeStatus, PROJECT_STATUS_COLORS } from '@/shared/lib/status';
import { usePermissions, useAuth } from '@/identity';
import {
  calculateHealthScore, getHealthStatus, formatRelativeDate,
  getTaskAnalytics, getTeamContributions
} from '../features/utils/projectUtils';
import {
  Users, CalendarClock, Activity as ActivityIcon, CheckCircle2,
  ListTodo, Clock, Share2, Edit3, Trash2, Plus, Sparkles,
  ArrowRight, Circle, KanbanSquare, GripVertical,
  MoreHorizontal, UserPlus, Eye
} from '@/shared/ui/Icons';

const defaultStatusColor = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

/* ── Kanban column definitions ── */
const KANBAN_COLUMNS = [
  { id: 'todo', label: 'To Do', icon: Circle, tone: 'default', colorBar: 'bg-[var(--text-tertiary)]' },
  { id: 'in_progress', label: 'In Progress', icon: ArrowRight, tone: 'accent', colorBar: 'bg-[var(--accent)]' },
  { id: 'review', label: 'Review', icon: Eye, tone: 'warning', colorBar: 'bg-[var(--warning)]' },
  { id: 'done', label: 'Done', icon: CheckCircle2, tone: 'success', colorBar: 'bg-[var(--success)]' },
];

function classifyTaskStatus(status) {
  const s = (status || '').toUpperCase();
  if (s === 'DONE' || s === 'COMPLETED') return 'done';
  if (s === 'IN_PROGRESS') return 'in_progress';
  if (s === 'REVIEW') return 'review';
  return 'todo';
}

/* ── Priority dot ── */
function PriorityDot({ priority }) {
  const colors = {
    URGENT: 'bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.4)]',
    HIGH: 'bg-orange-500 shadow-[0_0_4px_rgba(249,115,22,0.3)]',
    MEDIUM: 'bg-amber-400',
    LOW: 'bg-slate-400',
  };
  return <div className={cn('w-2 h-2 rounded-full shrink-0', colors[priority] || colors.MEDIUM)} />;
}

/* ── Task Card ── */
function TaskCard({ task, canAssignTask, canDrag, onDragStart, assigningTaskId, setAssigningTaskId, assignableMembers, onAssign }) {
  const isDone = classifyTaskStatus(task.status) === 'done';
  const priority = normalizePriority(task.priority);
  const column = KANBAN_COLUMNS.find(c => c.id === classifyTaskStatus(task.status));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      draggable={canDrag}
      onDragStart={canDrag ? (e) => onDragStart?.(e, task) : undefined}
      className={cn(
        'group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-xl p-3.5 hover:border-[var(--accent-border)] hover:shadow-[var(--shadow-sm)] transition-all duration-[var(--duration-fast)]',
        canDrag && 'cursor-grab active:cursor-grabbing'
      )}
    >
      {/* Left color bar */}
      <div className={cn('absolute left-0 top-3 bottom-3 w-[3px] rounded-full', column.colorBar)} />

      <div className="pl-2.5 space-y-2">
        {/* Title + priority */}
        <div className="flex items-start gap-2.5">
          <PriorityDot priority={priority} />
          <span className={cn(
            'text-[13px] font-medium text-[var(--text-primary)] leading-snug flex-1 min-w-0',
            isDone && 'line-through text-[var(--text-muted)]'
          )}>
            {task.title}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1.5 truncate">
            <span className="w-4 h-4 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[8px] font-bold shrink-0">
              {(task.assignedTo || task.assigneeUsername || 'U').charAt(0).toUpperCase()}
            </span>
            <span className="truncate">{task.assignedTo || task.assigneeUsername || 'Unassigned'}</span>
          </span>

          <span className={cn(
            'px-1.5 py-0.5 rounded font-semibold uppercase tracking-wider text-[9px] shrink-0',
            PRIORITY_COLORS[priority] || PRIORITY_COLORS.MEDIUM
          )}>
            {priority}
          </span>
        </div>

        {/* Assign button (only if can assign) */}
        {canAssignTask && !isDone && (
          <div className="pt-1 border-t border-[var(--border-subtle)] opacity-0 group-hover:opacity-100 transition-opacity duration-[var(--duration-fast)]">
            <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="xs" className="w-full justify-start gap-1.5 h-7 text-[11px]">
                  <UserPlus className="w-3 h-3" /> Reassign
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-52 p-1 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] z-50 rounded-xl">
                <Text size="xs" variant="muted" className="px-2.5 py-2 uppercase font-semibold tracking-wide border-b border-[var(--color-border-subtle)] block text-[10px]">
                  Assign to
                </Text>
                <div className="space-y-0.5 max-h-44 overflow-y-auto mt-1 custom-scrollbar">
                  {assignableMembers.map(m => {
                    const username = m.username || m.name || 'Member';
                    const id = m.userId || m.id;
                    return (
                      <button
                        key={id}
                        onClick={() => onAssign(task.id, id, username)}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 text-[12px] rounded-lg hover:bg-[var(--bg-hover)] transition-colors text-left"
                      >
                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[9px] shrink-0 font-bold">
                          {username.charAt(0).toUpperCase()}
                        </div>
                        <span className="truncate text-[var(--text-primary)]">{username}</span>
                      </button>
                    );
                  })}
                  {assignableMembers.length === 0 && (
                    <div className="text-center py-3 text-[11px] text-[var(--text-muted)]">No members available.</div>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/* ── Empty Column State ── */
function EmptyColumn({ column }) {
  const Icon = column.icon;
  return (
    <div className="flex flex-col items-center justify-center py-10 px-3 text-center">
      <div className={cn(
        'w-10 h-10 rounded-xl flex items-center justify-center mb-3',
        column.tone === 'accent' && 'bg-[var(--accent-soft)]',
        column.tone === 'warning' && 'bg-[var(--warning-soft)]',
        column.tone === 'success' && 'bg-[var(--success-soft)]',
        column.tone === 'default' && 'bg-[var(--bg-subtle)]'
      )}>
        <Icon className={cn(
          'w-4 h-4',
          column.tone === 'accent' && 'text-[var(--accent)]',
          column.tone === 'warning' && 'text-[var(--warning)]',
          column.tone === 'success' && 'text-[var(--success)]',
          column.tone === 'default' && 'text-[var(--text-tertiary)]'
        )} />
      </div>
      <span className="text-[12px] font-medium text-[var(--text-secondary)]">No {column.label} tasks</span>
      <span className="text-[11px] text-[var(--text-muted)] mt-1">Drag tasks here or create new ones</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
 * ProjectDetailPage — Redesigned
 * ══════════════════════════════════════════════════════ */
export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { workspaceMode } = useWorkspace();
  const { canManageProject, canAssignTask, canEditTask, canReview, canReviewTask, isSuperAdmin } = usePermissions();
  const { user } = useAuth();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState(null);
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(projectId));
  const { data: rawActivities } = useProjectActivities(Number(projectId));
  const projectActivities = Array.isArray(rawActivities) ? rawActivities : rawActivities?.content || [];

  const { data: team } = useTeam(project?.teamId);
  const { data: orgMembers = [] } = useOrgMembers(project?.organizationId);

  const { data: { tasks: rawTasks = [] } = {}, isLoading: tasksLoading } = useTaskList({ projectId: Number(projectId) });
  const projectTasks = Array.isArray(rawTasks) ? rawTasks : rawTasks?.content || [];
  const createTaskMutation = useCreateTask();
  const reassignTaskMutation = useReassignTask();
  const changeTaskStatus = useTaskStatusChange();

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const unshareMutation = useUnshareProjectFromCrew();
  const { data: userCrews = [] } = useCrews();

  const crewId = project?.crewId || (project?.sharedCrewIds && project.sharedCrewIds.length > 0 ? project.sharedCrewIds[0] : null);
  const isSharedToCrew = !!crewId || (Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0);
  const { data: crewMembers = [] } = useCrewMembers(crewId);

  const taskAnalytics = useMemo(() => getTaskAnalytics(projectTasks), [projectTasks]);
  const teamContributions = useMemo(() => getTeamContributions(projectTasks), [projectTasks]);
  const healthScore = useMemo(() => calculateHealthScore(project), [project]);
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore]);

  /* ── Kanban board columns ── */
  const kanbanColumns = useMemo(() => {
    const columns = { todo: [], in_progress: [], review: [], done: [] };
    projectTasks.forEach(task => {
      const col = classifyTaskStatus(task.status);
      columns[col].push(task);
    });
    return columns;
  }, [projectTasks]);

  const assignableMembers = useMemo(() => {
    if (crewId && crewMembers && crewMembers.length > 0) return crewMembers;
    if (project?.teamId && team) return team.members || [];
    return orgMembers || [];
  }, [project, team, orgMembers, crewId, crewMembers]);

  const handleEditProject = (payload) => {
    updateProjectMutation.mutate({ id: Number(projectId), updates: payload }, {
      onSuccess: () => setIsEditModalOpen(false)
    });
  };

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate(Number(projectId), {
      onSuccess: () => {
        setIsDeleteModalOpen(false);
        navigate('/app/projects');
      }
    });
  };

  const handleAddTaskSubmit = (payload) => {
    createTaskMutation.mutate({
      ...payload,
      projectId: Number(projectId),
      teamId: project?.teamId || null,
      organizationId: project?.organizationId || null,
      crewId: crewId || null,
    }, {
      onSuccess: () => setIsAddTaskOpen(false)
    });
  };

  const handleAssignTask = (taskId, memberId, memberUsername) => {
    reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, {
      onSuccess: () => {
        toast.success(`Task assigned to ${memberUsername}`);
        setAssigningTaskId(null);
      }
    });
  };

  /* ── Kanban drag & drop status updates (permission-gated, useTasks only) ── */
  // A card may be dragged when the user holds any task-transition permission,
  // or is the assignee/creator of that task (submit / recall / complete rights).
  const canDragTask = (task) => {
    if (!task?.id) return false;
    if (workspaceMode === 'PERSONAL' || isSuperAdmin || canEditTask || canAssignTask || canReview || canReviewTask) return true;
    const me = user?.username;
    const assignee = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo);
    const creator = typeof task.creator === 'object' ? task.creator?.username : task.creator;
    return assignee === me || creator === me;
  };

  const handleTaskDrop = (e, columnId) => {
    e.preventDefault();
    const columnKey = dragOverCol;
    setDragOverCol(null);
    if (!draggedTaskId || !columnKey) return;
    const task = projectTasks.find(t => String(t.id) === String(draggedTaskId));
    setDraggedTaskId(null);
    if (!task) return;
    if (classifyTaskStatus(task.status) === columnKey) return; // same column
    const mapped = columnKey === 'review'
      ? 'SUBMITTED'
      : (columnKey === 'done' ? 'DONE' : 'IN_PROGRESS');
    changeTaskStatus(task, mapped);
  };

  const handleTaskDragStart = (e, task) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedTaskId(String(task.id));
  };

  const daysRemaining = project?.dueDate
    ? Math.max(0, Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  const pageState = projectLoading || tasksLoading ? 'loading' : projectError || !project ? 'error' : 'ready';

  /* ── Hero actions ── */
  const heroActions = project && (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <SaveToggle entityType={ENTITY_TYPES.PROJECT} entityId={project.id} className="mr-1" />
      <div className="h-6 w-px bg-[var(--border-subtle)]" />
      <Button size="sm" className="gap-1.5 shadow-sm font-medium" onClick={() => setIsAddTaskOpen(true)}>
        <Plus className="w-4 h-4" /> Add Task
      </Button>
      {canManageProject && (
        <>
          <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)} className="gap-1.5">
            <Share2 className="w-3.5 h-3.5" />
            {isSharedToCrew ? 'Crew Access' : 'Share'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-1.5">
            <Edit3 className="w-3.5 h-3.5" /> Edit
          </Button>
          <Button variant="outline" size="sm" className="text-[var(--danger)] hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] gap-1.5" onClick={() => setIsDeleteModalOpen(true)}>
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </Button>
        </>
      )}
    </div>
  );

  return (
    <PageShell maxWidth="wide">
      {/* ── Hero ── */}
      <PageHero
        eyebrow={project?.status || 'ACTIVE'}
        title={project?.name || 'Project'}
        subtitle={project?.description}
      >
        <div className="flex items-center gap-3 flex-wrap">
          {/* Health score ring */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <ProgressRing value={healthScore} size={32} strokeWidth={3} />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] leading-none">Health</span>
              <span className={cn(
                'text-xs font-bold leading-none mt-0.5',
                healthStatus.tone === 'success' && 'text-[var(--success)]',
                healthStatus.tone === 'accent' && 'text-[var(--accent)]',
                healthStatus.tone === 'warning' && 'text-[var(--warning)]',
                healthStatus.tone === 'danger' && 'text-[var(--danger)]'
              )}>{healthStatus.label}</span>
            </div>
          </div>

          {/* Status badge */}
          <Badge variant="outline" className={cn(
            'text-xs uppercase font-semibold px-2.5 py-1',
            PROJECT_STATUS_COLORS[project?.status] || defaultStatusColor
          )}>
            {project?.status || 'ACTIVE'}
          </Badge>

          {heroActions}
        </div>
      </PageHero>

      <PageState
        state={pageState}
        stateProps={{
          loadingVariant: 'dashboard',
          icon: Icons.folderKanban,
          title: 'Project not found',
          description: "The project you're looking for doesn't exist or has been deleted.",
        }}
      >
        {project && (
          <>
            {/* ── Stats Row ── */}
            <PageStats>
              <ImmersiveStatCard
                icon={CheckCircle2}
                label="Completion Rate"
                value={`${taskAnalytics.completionRate}%`}
                tone="success"
                subtitle={`${taskAnalytics.done}/${taskAnalytics.total} complete`}
              />
              <ImmersiveStatCard
                icon={Clock}
                label="In Progress"
                value={taskAnalytics.inProgress}
                tone="accent"
                subtitle="Active now"
              />
              <ImmersiveStatCard
                icon={ListTodo}
                label="To Do"
                value={taskAnalytics.todo}
                subtitle="Awaiting action"
              />
              <ImmersiveStatCard
                icon={CalendarClock}
                label="Timeline"
                value={daysRemaining !== null ? `${daysRemaining}d` : '—'}
                tone={daysRemaining !== null && daysRemaining <= 3 ? 'danger' : 'warning'}
                subtitle={project.dueDate ? `Due ${formatDate(project.dueDate)}` : 'No deadline set'}
              />
            </PageStats>

            {/* ── Progress bar ── */}
            <div className="mt-1 mb-1">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Overall Progress</span>
                <span className="text-[11px] font-bold text-[var(--text-primary)] tabular-nums">{project.progress || 0}%</span>
              </div>
              <ProgressBar value={project.progress || 0} height="h-2" />
            </div>

            {/* ── Toolbar ── */}
            <PageToolbar>
              <div className="flex items-center gap-2">
                <KanbanSquare className="w-4 h-4 text-[var(--text-muted)]" />
                <span className="text-[13px] font-semibold text-[var(--text-primary)]">
                  Task Board
                </span>
                <span className="text-[11px] text-[var(--text-muted)] tabular-nums">
                  ({projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button size="xs" variant="outline" className="gap-1.5" onClick={() => setIsAddTaskOpen(true)}>
                  <Plus className="w-3 h-3" /> New Task
                </Button>
              </div>
            </PageToolbar>

            {/* ── Main Content: Grid ── */}
            <PageContent>
              <PageGrid sidebarWidth="default">
                {/* ═══ Left: Kanban Board ═══ */}
                <div className="overflow-x-auto -mx-1 px-1">
                  <div className="grid grid-cols-4 gap-3 min-w-[720px]">
                    {KANBAN_COLUMNS.map(column => {
                      const tasks = kanbanColumns[column.id] || [];
                      const isDragOver = dragOverCol === column.id;

                      return (
                        <div
                          key={column.id}
                          className={cn(
                            'flex flex-col min-h-[320px] rounded-xl transition-all',
                            isDragOver && 'bg-[var(--accent-soft)]/20 ring-2 ring-[var(--accent)]/30 ring-inset'
                          )}
                          onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverCol(column.id); }}
                          onDragLeave={() => setDragOverCol(prev => prev === column.id ? null : prev)}
                          onDrop={(e) => handleTaskDrop(e, column.id)}
                        >
                          {/* Column header */}
                          <div className="flex items-center justify-between mb-2.5 px-1">
                            <div className="flex items-center gap-2">
                              <div className={cn('w-2 h-2 rounded-full', column.colorBar)} />
                              <span className="text-[12px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                                {column.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-[var(--text-muted)] font-mono tabular-nums">
                              {tasks.length}
                            </span>
                          </div>

                          {/* Task cards */}
                          <div className="flex-1 space-y-2 rounded-xl bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] p-2">
                            <AnimatePresence mode="popLayout">
                              {tasks.length === 0 ? (
                                <EmptyColumn column={column} />
                              ) : (
                                tasks.map(task => (
                                  <TaskCard
                                    key={task.id}
                                    task={task}
                                    canAssignTask={canAssignTask}
                                    canDrag={canDragTask(task)}
                                    onDragStart={handleTaskDragStart}
                                    assigningTaskId={assigningTaskId}
                                    setAssigningTaskId={setAssigningTaskId}
                                    assignableMembers={assignableMembers}
                                    onAssign={handleAssignTask}
                                  />
                                ))
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* ═══ Right Aside ═══ */}
                <PageAside>
                  {/* ── Project Summary ── */}
                  <PremiumCard variant="default">
                    <PremiumCardHeader>
                      <PremiumCardTitle icon={CheckCircle2}>Project Summary</PremiumCardTitle>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <div className="space-y-4">
                        {/* Progress ring centered */}
                        <div className="flex justify-center py-2">
                          <ProgressRing value={project.progress || 0} size={80} strokeWidth={5}>
                            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
                              {project.progress || 0}%
                            </span>
                          </ProgressRing>
                        </div>

                        {/* Key metrics */}
                        <div className="space-y-2.5">
                          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[var(--bg-subtle)]">
                            <span className="text-[11px] text-[var(--text-muted)]">Health Score</span>
                            <span className={cn(
                              'text-[13px] font-bold tabular-nums',
                              healthStatus.tone === 'success' && 'text-[var(--success)]',
                              healthStatus.tone === 'accent' && 'text-[var(--accent)]',
                              healthStatus.tone === 'warning' && 'text-[var(--warning)]',
                              healthStatus.tone === 'danger' && 'text-[var(--danger)]'
                            )}>{healthScore}<span className="text-[10px] font-normal text-[var(--text-muted)]">/100</span></span>
                          </div>

                          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[var(--bg-subtle)]">
                            <span className="text-[11px] text-[var(--text-muted)]">Tasks Done</span>
                            <span className="text-[13px] font-bold text-[var(--text-primary)] tabular-nums">
                              {taskAnalytics.done} <span className="text-[10px] font-normal text-[var(--text-muted)]">/ {taskAnalytics.total}</span>
                            </span>
                          </div>

                          <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[var(--bg-subtle)]">
                            <span className="text-[11px] text-[var(--text-muted)]">Remaining</span>
                            <span className={cn(
                              'text-[13px] font-bold tabular-nums',
                              daysRemaining !== null && daysRemaining <= 3 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]'
                            )}>
                              {daysRemaining !== null ? `${daysRemaining} days` : '—'}
                            </span>
                          </div>
                        </div>

                        {/* Milestone checklist */}
                        <div className="border-t border-[var(--border-subtle)] pt-3">
                          <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 block">
                            Milestones
                          </span>
                          <div className="space-y-2">
                            <div className="flex items-center gap-2.5 text-[11px]">
                              <div className={cn(
                                'w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 transition-colors',
                                projectTasks.length > 0
                                  ? 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30'
                                  : 'border-[var(--border-default)] text-transparent'
                              )}>
                                {projectTasks.length > 0 && '✓'}
                              </div>
                              <span className={projectTasks.length > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}>
                                Tasks initialized ({projectTasks.length})
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px]">
                              <div className={cn(
                                'w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 transition-colors',
                                project.dueDate
                                  ? 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30'
                                  : 'border-[var(--border-default)] text-transparent'
                              )}>
                                {project.dueDate && '✓'}
                              </div>
                              <span className={project.dueDate ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}>
                                Timeline scheduled
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5 text-[11px]">
                              <div className={cn(
                                'w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 transition-colors',
                                teamContributions.length > 0
                                  ? 'bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30'
                                  : 'border-[var(--border-default)] text-transparent'
                              )}>
                                {teamContributions.length > 0 && '✓'}
                              </div>
                              <span className={teamContributions.length > 0 ? 'text-[var(--text-secondary)]' : 'text-[var(--text-muted)]'}>
                                Team assigned
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>

                  {/* ── Team Contributions ── */}
                  {teamContributions.length > 0 && (
                    <PremiumCard variant="default">
                      <PremiumCardHeader>
                        <PremiumCardTitle icon={Users}>Team Contribution</PremiumCardTitle>
                      </PremiumCardHeader>
                      <PremiumCardContent>
                        <div className="space-y-3.5">
                          {teamContributions.map((c, i) => (
                            <div key={i}>
                              <div className="flex justify-between text-[11px] mb-1.5">
                                <span className="font-medium text-[var(--text-primary)] truncate">{c.name}</span>
                                <span className="text-[var(--text-muted)] font-mono tabular-nums">{c.tasks} ({c.percentage}%)</span>
                              </div>
                              <ProgressBar value={c.percentage} height="h-1.5" />
                            </div>
                          ))}
                        </div>
                      </PremiumCardContent>
                    </PremiumCard>
                  )}

                  {/* ── Shared Crews ── */}
                  <PremiumCard variant="default">
                    <PremiumCardHeader>
                      <PremiumCardTitle icon={Share2}>Crew Access</PremiumCardTitle>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      {(!project.sharedCrewIds || project.sharedCrewIds.length === 0) ? (
                        <div className="py-3 text-center">
                          <Text variant="muted" size="sm" className="mb-2">Not shared with any crew</Text>
                          {workspaceMode === 'PERSONAL' && canManageProject && (
                            <Button size="xs" variant="outline" onClick={() => setIsShareModalOpen(true)} className="mt-1">
                              <Share2 className="w-3 h-3 mr-1" /> Share Now
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {project.sharedCrewIds.map(sharedCrewId => {
                            const crewObj = userCrews.find(c => String(c.id) === String(sharedCrewId));
                            return (
                              <div key={sharedCrewId} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[11px] shrink-0">
                                    {crewObj?.name?.charAt(0).toUpperCase() || 'C'}
                                  </div>
                                  <span className="font-medium text-[12px] truncate text-[var(--text-primary)]">
                                    {crewObj?.name || `Crew #${sharedCrewId}`}
                                  </span>
                                </div>
                                {canManageProject && (
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    className="text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                                    onClick={() => unshareMutation.mutate({ projectId: Number(projectId), crewId: Number(sharedCrewId) })}
                                    isLoading={unshareMutation.isPending}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </PremiumCardContent>
                  </PremiumCard>

                  {/* ── Metadata ── */}
                  <PremiumCard variant="default">
                    <PremiumCardHeader>
                      <PremiumCardTitle>Details</PremiumCardTitle>
                    </PremiumCardHeader>
                    <PremiumCardContent>
                      <div className="space-y-3">
                        {project.organizationName && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[var(--text-muted)]">Organization</span>
                            <span className="font-medium text-[var(--text-primary)]">{project.organizationName}</span>
                          </div>
                        )}
                        {project.teamName && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[var(--text-muted)]">Team</span>
                            <span className="font-medium text-[var(--text-primary)]">{project.teamName}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-[var(--text-muted)]">Owner</span>
                          <span className="font-medium text-[var(--text-primary)]">{project.createdBy || 'System'}</span>
                        </div>
                        {project.dueDate && (
                          <div className="flex items-center justify-between text-[12px]">
                            <span className="text-[var(--text-muted)]">Deadline</span>
                            <span className="font-medium text-[var(--text-primary)]">{formatDate(project.dueDate)}</span>
                          </div>
                        )}
                      </div>
                    </PremiumCardContent>
                  </PremiumCard>

                  {/* ── Activity Feed ── */}
                  <PremiumCard variant="default" className="overflow-hidden">
                    <PremiumCardHeader>
                      <PremiumCardTitle icon={ActivityIcon}>Recent Activity</PremiumCardTitle>
                    </PremiumCardHeader>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {projectActivities.length === 0 ? (
                        <div className="py-6 text-center">
                          <Text variant="muted" size="sm">No activity recorded yet.</Text>
                        </div>
                      ) : (
                        <div className="px-5 pb-5 space-y-0.5">
                          {projectActivities.slice(0, 10).map((act, idx) => (
                            <div
                              key={act.id || idx}
                              className="flex items-start gap-3 py-2"
                            >
                              <div className="relative mt-1.5">
                                <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                                {idx < Math.min(projectActivities.length, 10) - 1 && (
                                  <div className="absolute top-3 left-[3px] w-px h-full bg-[var(--border-subtle)]" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[11px] text-[var(--text-primary)] leading-relaxed">
                                  <span className="font-semibold text-[var(--accent)]">{act.actor || act.username || 'System'}</span>
                                  {' '}{act.action || act.description || 'performed an action'}
                                </p>
                                <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-mono">
                                  {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently'}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </PremiumCard>
                </PageAside>
              </PageGrid>
            </PageContent>

            {/* ── Floating action button (mobile quick-add) ── */}
            <FloatingActions position="bottom-right">
              <Button
                size="icon"
                className="w-12 h-12 rounded-2xl shadow-[var(--shadow-lg)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white"
                onClick={() => setIsAddTaskOpen(true)}
              >
                <Plus className="w-5 h-5" />
              </Button>
            </FloatingActions>
          </>
        )}
      </PageState>

      {/* ═══════════════ Modals ═══════════════ */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <Heading level={3} className="mb-5 text-[15px] font-semibold">Edit Project</Heading>
          <ProjectForm
            defaultValues={project ? {
              name: project.name,
              description: project.description || '',
              organizationId: project.organizationId || '',
              teamId: project.teamId ? project.teamId.toString() : 'none',
              crewId: project.crewId ? project.crewId.toString() : (project.sharedCrewIds && project.sharedCrewIds.length > 0 ? project.sharedCrewIds[0].toString() : ''),
              collaboratorIds: Array.isArray(project.collaboratorIds) ? project.collaboratorIds : (Array.isArray(project.collaborators) ? project.collaborators.map(c => c.userId || c.id) : []),
              dueDate: project.dueDate ? project.dueDate.slice(0, 16) : '',
            } : {}}
            onSubmit={handleEditProject}
            isLoading={updateProjectMutation.isPending}
            workspaceMode={workspaceMode === 'PERSONAL' && isSharedToCrew ? 'CREWS' : workspaceMode}
            useOrgTeamsHook={useOrgTeams}
            hideContextFields={workspaceMode === 'ORG'}
          />
        </ModalContent>
      </Modal>

      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4 text-[var(--danger)]">Delete Project</Heading>
          <Text className="mb-6">Are you sure you want to delete <strong>{project?.name}</strong>? This action cannot be undone and will delete all associated tasks.</Text>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteProject} isLoading={deleteProjectMutation.isPending}>Yes, Delete</Button>
          </div>
        </ModalContent>
      </Modal>

      <Modal open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Task</Heading>
          <TaskForm
            defaultValues={project ? {
              title: '',
              description: '',
              assigneeUsername: '',
              priority: 'MEDIUM',
              dueDate: '',
              tags: '',
              teamId: project.teamId ? project.teamId.toString() : '',
              projectId: projectId.toString(),
            } : {}}
            fixedProjectId={projectId}
            fixedTeamId={project?.teamId}
            onSubmit={handleAddTaskSubmit}
            isLoading={createTaskMutation.isPending}
          />
        </ModalContent>
      </Modal>

      {project && <CrewProjectShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} project={project} />}
    </PageShell>
  );
}

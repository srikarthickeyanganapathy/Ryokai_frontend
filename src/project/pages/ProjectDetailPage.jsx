import React, { useMemo, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { SectionPanel } from '@/shared/ui/SectionPanel';
import { Icons } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { PageHeader } from '@/shared/ui/PageHeader';
import { ImmersiveStatCard, MetricGrid } from '@/shared/ui/Immersive';
import { ProgressBar } from '@/shared/ui/Progress';
import { useProject, useUpdateProject, useDeleteProject, useUnshareProjectFromCrew, useProjectActivities } from '../features/hooks/useProjects';
import { useTeam, useOrgMembers, useOrgTeams } from '@/organization';
import { useCrewMembers, useCrews } from '@/crew';
import { ProjectForm } from '../components/ProjectForm';
import { CrewProjectShareModal } from '../components/CrewProjectShareModal';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useTaskList, useCreateTask, useReassignTask } from '@/task';
import { TaskForm } from '@/task';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority';
import { SaveToggle } from '@/library/saved/features/components/SaveToggle';
import { ENTITY_TYPES } from '@/shared/constants/entityTypes';
import { normalizeStatus, PROJECT_STATUS_COLORS } from '@/shared/lib/status';
import { usePermissions } from '@/identity';
import { calculateHealthScore, getHealthStatus, formatRelativeDate, getTaskAnalytics, getTeamContributions } from '../features/utils/projectUtils';
import { WorkspaceShell, CommandLayout } from '@/shared/workspace-framework';
import { Users, CalendarClock, Activity as ActivityIcon, CheckCircle2, ListTodo, Clock, Share2, Edit3, Trash2, Plus, Sparkles } from '@/shared/ui/Icons';

const defaultStatusColor = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]';

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  });
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { workspaceMode } = useWorkspace();
  const { canManageProject, canAssignTask } = usePermissions();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [assigningTaskId, setAssigningTaskId] = useState(null);

  // Fetch Project details
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(projectId));
  const { data: rawActivities } = useProjectActivities(Number(projectId));
  const projectActivities = Array.isArray(rawActivities) ? rawActivities : rawActivities?.content || [];

  // Fetch Team & Org members dynamically to enable custom assignment dropdown
  const { data: team } = useTeam(project?.teamId);
  const { data: orgMembers = [] } = useOrgMembers(project?.organizationId);

  // Fetch Project Tasks
  const { data: rawTasks, isLoading: tasksLoading } = useTaskList({ projectId: Number(projectId) });
  const projectTasks = Array.isArray(rawTasks) ? rawTasks : rawTasks?.content || [];
  const createTaskMutation = useCreateTask();
  const reassignTaskMutation = useReassignTask();

  const updateProjectMutation = useUpdateProject();
  const deleteProjectMutation = useDeleteProject();
  const unshareMutation = useUnshareProjectFromCrew();
  const { data: userCrews = [] } = useCrews();

  // Fetch Crew members if shared
  const crewId = project?.crewId || (project?.sharedCrewIds && project.sharedCrewIds.length > 0 ? project.sharedCrewIds[0] : null);
  const isSharedToCrew = !!crewId || (Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0);
  const { data: crewMembers = [] } = useCrewMembers(crewId);

  // Derived Project Analytics & Team Metrics
  const taskAnalytics = useMemo(() => getTaskAnalytics(projectTasks), [projectTasks]);
  const teamContributions = useMemo(() => getTeamContributions(projectTasks), [projectTasks]);
  const healthScore = useMemo(() => calculateHealthScore(project), [project]);
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore]);

  // Get assignable members (crew members if shared, team members if team is linked, otherwise org members)
  const assignableMembers = useMemo(() => {
    if (crewId && crewMembers && crewMembers.length > 0) {
      return crewMembers;
    }
    if (project?.teamId && team) {
      return team.members || [];
    }
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
      onSuccess: () => {
        setIsAddTaskOpen(false);
      }
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

  if (projectLoading || tasksLoading) {
    return (
      <WorkspaceShell maxWidth="default">
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
          <MetricGrid columns={4} className="mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass-panel rounded-[var(--radius-lg)] border border-[var(--color-border-subtle)] p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </div>
            ))}
          </MetricGrid>
        </div>
      </WorkspaceShell>
    );
  }

  if (projectError || !project) {
    return (
      <WorkspaceShell maxWidth="default">
        <div className="text-center py-20">
          <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
            <Icons.x className="w-6 h-6" />
          </div>
          <Heading level={3}>Project not found</Heading>
          <Text variant="muted" className="mt-2 mb-6">
            The project you're looking for doesn't exist or has been deleted.
          </Text>
          <Link to="/app/projects" className="px-4 py-2 rounded-[10px] border border-[var(--color-border-default)] text-[13px] font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-subtle)] transition-colors inline-flex items-center gap-2">
            <Icons.chevronLeft className="w-4 h-4" /> Back to Projects
          </Link>
        </div>
      </WorkspaceShell>
    );
  }

  return (
    <WorkspaceShell maxWidth="default">
      <CommandLayout
        hero={
          <PageHeader
            eyebrow={project.status || 'ACTIVE'}
            title={project.name}
            subtitle={project.description}
            actions={
              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <Badge variant="outline" className={cn('text-xs uppercase font-semibold', PROJECT_STATUS_COLORS[project.status] || defaultStatusColor)}>
                  {project.status || 'ACTIVE'}
                </Badge>
                <span className={cn(
                  "px-2.5 py-0.5 rounded-full text-[11px] uppercase tracking-wider font-bold border flex items-center gap-1",
                  healthStatus.tone === 'success' && 'bg-green-500/10 text-green-500 border-green-500/20',
                  healthStatus.tone === 'accent' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
                  healthStatus.tone === 'warning' && 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
                  healthStatus.tone === 'danger' && 'bg-red-500/10 text-red-500 border-red-500/20'
                )}>
                  <Sparkles className="w-3 h-3" /> {healthStatus.label} ({healthScore})
                </span>
                <SaveToggle entityType={ENTITY_TYPES.PROJECT} entityId={project.id} className="ml-1" />
                <Button size="sm" className="gap-1.5 shadow-sm" onClick={() => setIsAddTaskOpen(true)}>
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
            }
          />
        }
        metrics={
          <MetricGrid columns={4}>
            <ImmersiveStatCard
              icon={CheckCircle2}
              label="Completion Rate"
              value={`${taskAnalytics.completionRate}%`}
              tone="success"
              subtitle={`${taskAnalytics.done}/${taskAnalytics.total} Done`}
            />
            <ImmersiveStatCard
              icon={Clock}
              label="In Progress"
              value={taskAnalytics.inProgress}
              tone="accent"
              subtitle="Active deliverables"
            />
            <ImmersiveStatCard
              icon={ListTodo}
              label="To Do / Backlog"
              value={taskAnalytics.todo}
              subtitle="Pending action"
            />
            <ImmersiveStatCard
              icon={CalendarClock}
              label="Target Deadline"
              value={formatRelativeDate(project.dueDate)}
              tone="warning"
              subtitle={formatDate(project.dueDate)}
            />
          </MetricGrid>
        }
      >
        {/* 2-COLUMN PROJECT ROOM STAGE (70% Canvas / 30% Rail) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Main Canvas (70% / 8 Cols) — Tasks & Activity Feed */}
          <div className="lg:col-span-8 space-y-6">
            <SectionPanel
              title="Tasks & Deliverables"
              subtitle="Manage and delegate project milestones and action items."
              actions={
                <Button size="sm" className="gap-1.5" onClick={() => setIsAddTaskOpen(true)}>
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </Button>
              }
              noPadding
            >
                {projectTasks.length === 0 ? (
                  <div className="text-center py-14 text-[var(--text-tertiary)]">
                    No tasks inside this project. Click 'Add Task' to initiate your workflow!
                  </div>
                ) : (
                  <div className="divide-y divide-[var(--color-border-subtle)]">
                    {projectTasks.map((task) => (
                      <div key={task.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", task.status === 'Done' || task.status === 'COMPLETED' ? "bg-emerald-500" : task.status === 'IN_PROGRESS' ? "bg-[var(--accent)]" : "bg-amber-500")} />
                          <div className="min-w-0">
                            <span className={cn("font-medium text-sm block truncate text-[var(--text-primary)]", (task.status === 'Done' || task.status === 'COMPLETED') && "line-through text-[var(--text-muted)]")}>
                              {task.title}
                            </span>
                            <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                              Status: <strong className="text-[var(--text-secondary)]">{task.status || 'Todo'}</strong> | Assigned to: <strong className="text-[var(--text-secondary)]">{task.assignedTo || task.assigneeUsername || 'Unassigned'}</strong>
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <Badge className={cn("text-xs capitalize mr-1", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)}>
                            {task.priority?.toLowerCase() || 'medium'}
                          </Badge>
                          {canAssignTask && (
                            <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
                              <PopoverTrigger asChild>
                                <Button variant="outline" size="xs">
                                  Assign
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent align="end" className="w-56 p-1 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)] z-50">
                                <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold tracking-wide border-b border-[var(--color-border-subtle)] block">
                                  {project.teamId ? 'Assign Team Member' : 'Assign Org Member'}
                                </Text>
                                <div className="space-y-0.5 max-h-48 overflow-y-auto mt-1 custom-scrollbar">
                                  {assignableMembers.map(m => {
                                    const username = m.username || m.name || 'Member';
                                    const id = m.userId || m.id;
                                    return (
                                      <button
                                        key={id}
                                        onClick={() => handleAssignTask(task.id, id, username)}
                                        className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded hover:bg-[var(--bg-hover)] transition-colors text-left"
                                      >
                                        <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] shrink-0 font-bold">
                                          {username.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="truncate text-[var(--text-primary)]">{username}</span>
                                      </button>
                                    );
                                  })}
                                  {assignableMembers.length === 0 && (
                                    <div className="text-center py-4 text-xs text-[var(--text-muted)]">
                                      No members available to assign.
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </SectionPanel>

            {/* Activity Feed */}
            <SectionPanel
              icon={ActivityIcon}
              title="Project Activity Feed & Audit Trail"
              actions={
                <span className="text-xs text-[var(--text-muted)] font-mono">{projectActivities.length} events</span>
              }
            >
              <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-[var(--color-border-subtle)] -mx-4 -my-4 px-4 py-2">
                {projectActivities.length === 0 ? (
                  <div className="text-center py-8 text-sm text-[var(--text-tertiary)]">
                    No recent operational events or log activities recorded for this project yet.
                  </div>
                ) : (
                  projectActivities.map((act, idx) => (
                    <div key={act.id || idx} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-[var(--text-primary)] font-medium">
                          <span className="font-bold text-[var(--accent)]">{act.actor || act.username || 'System'}</span> {act.action || act.description || 'performed a milestone action'}
                        </div>
                        <div className="text-[10px] text-[var(--text-muted)] mt-0.5 font-mono">
                          {act.timestamp ? new Date(act.timestamp).toLocaleString() : 'Recently'}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </SectionPanel>
          </div>

          {/* Right Telemetry & Governance Rail (30% / 4 Cols) */}
          <div className="lg:col-span-4 space-y-6">

            {/* Project Summary & Completion Checklist */}
            <SectionPanel
              icon={CheckCircle2}
              title="Project Summary & Checklist"
            >
                <div className="space-y-2.5 text-xs mb-4">
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Progress</span> <span className="font-bold text-[var(--text-primary)]">{project.progress || 0}%</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Health Score</span> <span className="font-bold text-[var(--text-primary)]">{healthScore}/100</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Days Remaining</span> <span className="font-bold text-[var(--text-primary)]">{project.dueDate ? Math.max(0, Math.ceil((new Date(project.dueDate) - new Date()) / (1000 * 60 * 60 * 24))) : '—'}</span></div>
                  <div className="flex justify-between"><span className="text-[var(--text-muted)]">Tasks Completed</span> <span className="font-bold text-[var(--text-primary)]">{taskAnalytics.done} / {taskAnalytics.total}</span></div>
                </div>
                <div className="pt-3.5 border-t border-[var(--border-subtle)]/60 text-xs">
                  <div className="font-semibold mb-2.5 text-[var(--text-secondary)]">Milestone Checklist</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center text-[9px]", projectTasks.length > 0 ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 font-bold" : "border-gray-500")}>{projectTasks.length > 0 && "✓"}</div>
                      <span>Tasks & scope initialized ({projectTasks.length})</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center text-[9px]", project.dueDate ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 font-bold" : "border-gray-500")}>{project.dueDate && "✓"}</div>
                      <span>Target timeline scheduled</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                      <div className={cn("w-4 h-4 rounded-full border flex items-center justify-center text-[9px]", teamContributions.length > 0 ? "bg-emerald-500/20 text-emerald-500 border-emerald-500/50 font-bold" : "border-gray-500")}>{teamContributions.length > 0 && "✓"}</div>
                      <span>Team ownership assigned</span>
                    </div>
                  </div>
                </div>
            </SectionPanel>

            {/* Team Contribution */}
            <SectionPanel title="Team Contribution">
              <div className="space-y-3.5">
                {teamContributions.length === 0 ? (
                  <Text variant="muted" size="sm" className="py-2 text-center">No task distribution data available yet.</Text>
                ) : (
                  teamContributions.map((c, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-medium text-[var(--text-primary)] truncate">{c.name}</span>
                        <span className="text-[var(--text-muted)] font-mono">{c.tasks} tasks ({c.percentage}%)</span>
                      </div>
                      <ProgressBar value={c.percentage} height="h-1.5" />
                    </div>
                  ))
                )}
              </div>
            </SectionPanel>

            {/* Shared Crews Governance */}
            <SectionPanel
              icon={Users}
              title="Shared Crews Access"
              subtitle="Crews with task visibility."
              actions={
                workspaceMode === 'PERSONAL' && canManageProject && !isSharedToCrew && (
                  <Button size="xs" variant="outline" onClick={() => setIsShareModalOpen(true)}>
                    Share
                  </Button>
                )
              }
            >
              <div className="space-y-2">
                {(!project.sharedCrewIds || project.sharedCrewIds.length === 0) ? (
                  <Text variant="muted" size="sm">Not shared with any collaborative crews.</Text>
                ) : (
                  project.sharedCrewIds.map(sharedCrewId => {
                    const crewObj = userCrews.find(c => String(c.id) === String(sharedCrewId));
                    return (
                      <div key={sharedCrewId} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[11px] shrink-0 border border-[var(--accent-border)]">
                            {crewObj?.name?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <span className="font-semibold text-xs truncate text-[var(--text-primary)]">{crewObj?.name || `Crew #${sharedCrewId}`}</span>
                        </div>
                        {canManageProject && (
                          <Button
                            size="xs"
                            variant="outline"
                            className="text-[var(--danger)] hover:bg-[var(--danger-soft)] px-2.5 border-[var(--danger-border)]"
                            onClick={() => unshareMutation.mutate({ projectId: Number(projectId), crewId: Number(sharedCrewId) })}
                            isLoading={unshareMutation.isPending}
                          >
                            Unshare
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </SectionPanel>

            {/* Project Metadata & Scope */}
            <SectionPanel title="Metadata & Scope">
              <div className="space-y-3">
                {project.organizationName && (
                  <div className="flex items-center justify-between text-xs">
                    <Text variant="muted">Organization</Text>
                    <Text className="font-medium text-[var(--text-primary)]">{project.organizationName}</Text>
                  </div>
                )}
                {project.teamName && (
                  <div className="flex items-center justify-between text-xs">
                    <Text variant="muted">Team</Text>
                    <Text className="font-medium text-[var(--text-primary)]">{project.teamName}</Text>
                  </div>
                )}
                <div className="flex items-center justify-between text-xs">
                  <Text variant="muted">Created by</Text>
                  <Text className="font-medium text-[var(--text-primary)]">{project.createdBy || 'System'}</Text>
                </div>
              </div>
            </SectionPanel>
          </div>

        </div>
      </CommandLayout>

      {/* Modals kept intact */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <Heading level={3} className="mb-5 text-[15px] font-semibold">Edit Project</Heading>
          <ProjectForm
            defaultValues={{
              name: project.name,
              description: project.description || '',
              organizationId: project.organizationId || '',
              teamId: project.teamId ? project.teamId.toString() : 'none',
              crewId: project.crewId ? project.crewId.toString() : (project.sharedCrewIds && project.sharedCrewIds.length > 0 ? project.sharedCrewIds[0].toString() : ''),
              collaboratorIds: Array.isArray(project.collaboratorIds) ? project.collaboratorIds : (Array.isArray(project.collaborators) ? project.collaborators.map(c => c.userId || c.id) : []),
              dueDate: project.dueDate ? project.dueDate.slice(0, 16) : '',
            }}
            onSubmit={(payload) => updateProjectMutation.mutate({ id: Number(projectId), updates: payload }, { onSuccess: () => setIsEditModalOpen(false) })}
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
          <Text className="mb-6">Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone and will delete all associated tasks.</Text>
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
            defaultValues={{
              title: '',
              description: '',
              assigneeUsername: '',
              priority: 'MEDIUM',
              dueDate: '',
              tags: '',
              teamId: project.teamId ? project.teamId.toString() : '',
              projectId: projectId.toString(),
            }}
            fixedProjectId={projectId}
            fixedTeamId={project.teamId}
            onSubmit={handleAddTaskSubmit}
            isLoading={createTaskMutation.isPending}
          />
        </ModalContent>
      </Modal>

      {project && <CrewProjectShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} project={project} />}
    </WorkspaceShell>
  );
}

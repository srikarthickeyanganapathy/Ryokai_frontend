import React, { useMemo, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { cn } from "@/shared/lib/cn";
import { Heading, Text } from "@/shared/ui/Typography";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";
import { Modal, ModalContent } from "@/shared/ui/Modal";
import { ImmersiveStatCard } from "@/shared/ui/Immersive";
import { ProgressBar, ProgressRing } from "@/shared/ui/Progress";
import { PremiumCard, PremiumCardHeader, PremiumCardTitle, PremiumCardContent } from "@/shared/ui/PremiumCard";
import { PageShell, PageHero, PageStats, PageContent, PageToolbar, PageGrid, PageAside, FloatingActions } from "@/shared/ui/PageShell";
import { PageState } from "@/shared/ui/PageState";
import { DetailTabs } from "@/shared/ui/DetailTabs";
import { useProject, useUpdateProject, useDeleteProject, useUnshareProjectFromCrew, useProjectActivities } from "../features/hooks/useProjects";
import { useTeam, useOrgMembers, useOrgTeams } from "@/organization";
import { useCrewMembers, useCrews } from "@/crew";
import { ProjectForm } from "../components/ProjectForm";
import { CrewProjectShareModal } from "../components/CrewProjectShareModal";
import { useWorkspace } from "@/app/providers/WorkspaceProvider";
import { useTaskList, useCreateTask, useReassignTask, useTaskStatusChange, TaskForm, KanbanBoard, TaskPanel } from "@/task";
import { toast } from "sonner";
import { SaveToggle } from "@/saved/features/components/SaveToggle";
import { ENTITY_TYPES } from "@/shared/constants/entityTypes";
import { PROJECT_STATUS_COLORS } from "@/shared/lib/status";
import { usePermissions, useAuth } from "@/identity";
import { calculateHealthScore, getHealthStatus, getTaskAnalytics, getTeamContributions } from "../features/utils/projectUtils";
import { CheckCircle2, Clock, ListTodo, CalendarClock, Share2, Edit3, Trash2, Plus, KanbanSquare, Users, Activity as ActivityIcon, LayoutDashboard } from "lucide-react";

const defaultStatusColor = "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]";

const PROJECT_TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "tasks", label: "Task Board", icon: KanbanSquare },
  { id: "activity", label: "Activity", icon: ActivityIcon },
];

function formatDate(d) {
  return d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
}

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { workspaceMode } = useWorkspace();
  const { canManageProject, canAssignTask, canEditTask, canReview, canReviewTask, isSuperAdmin } = usePermissions();
  const { user } = useAuth();

  const initialTab = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(initialTab && PROJECT_TABS.some(t => t.id === initialTab) ? initialTab : "overview");
  const handleTabChange = (id) => {
    setActiveTab(id);
    setSearchParams(params => { if (id === "overview") params.delete("tab"); else params.set("tab", id); return params }, { replace: true });
  };

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

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

  const crewId = project?.crewId || (project?.sharedCrewIds?.[0] ?? null);
  const isSharedToCrew = !!crewId || (Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0);
  const { data: crewMembers = [] } = useCrewMembers(crewId);

  const taskAnalytics = useMemo(() => getTaskAnalytics(projectTasks), [projectTasks]);
  const teamContributions = useMemo(() => getTeamContributions(projectTasks), [projectTasks]);
  const healthScore = useMemo(() => calculateHealthScore(project), [project]);
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore]);

  const assignableMembers = useMemo(() => {
    if (crewId && crewMembers?.length > 0) return crewMembers;
    if (project?.teamId && team) return team.members || [];
    return orgMembers || [];
  }, [project, team, orgMembers, crewId, crewMembers]);

  /* Handlers */
  const handleEditProject = (p) => updateProjectMutation.mutate({ id: Number(projectId), updates: p }, { onSuccess: () => setIsEditModalOpen(false) });
  const handleDeleteProject = () => deleteProjectMutation.mutate(Number(projectId), { onSuccess: () => { setIsDeleteModalOpen(false); navigate("/app/projects"); } });
  const handleAddTaskSubmit = (p) => createTaskMutation.mutate({ ...p, projectId: Number(projectId), teamId: project?.teamId || null, organizationId: project?.organizationId || null, crewId: crewId || null }, { onSuccess: () => setIsAddTaskOpen(false) });
  const handleAssignTask = (taskId, memberId, username) => reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, { onSuccess: () => { toast.success("Task assigned to " + username); setAssigningTaskId(null); } });

  const daysRemaining = project?.dueDate ? Math.max(0, Math.ceil((new Date(project.dueDate) - new Date()) / 86400000)) : null;
  const pageState = projectLoading || tasksLoading ? "loading" : projectError || !project ? "error" : "ready";

  return (
    <PageShell maxWidth="wide">
      <PageHero eyebrow={project?.status || "ACTIVE"} title={project?.name || "Project"} subtitle={project?.description}>
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
            <ProgressRing value={healthScore} size={32} strokeWidth={3} />
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[var(--text-secondary)] leading-none">Health</span>
              <span className={cn("text-xs font-bold leading-none mt-0.5", healthStatus.tone === "success" && "text-[var(--success)]", healthStatus.tone === "accent" && "text-[var(--accent)]", healthStatus.tone === "warning" && "text-[var(--warning)]", healthStatus.tone === "danger" && "text-[var(--danger)]")}>{healthStatus.label}</span>
            </div>
          </div>
          <Badge variant="outline" className={cn("text-xs uppercase font-semibold px-2.5 py-1", PROJECT_STATUS_COLORS[project?.status] || defaultStatusColor)}>{project?.status || "ACTIVE"}</Badge>
          {project && <ProjectHeroActions project={project} isSharedToCrew={isSharedToCrew} canManageProject={canManageProject} setIsAddTaskOpen={setIsAddTaskOpen} setIsShareModalOpen={setIsShareModalOpen} setIsEditModalOpen={setIsEditModalOpen} setIsDeleteModalOpen={setIsDeleteModalOpen} />}
        </div>
      </PageHero>

      <PageState state={pageState} stateProps={{ loadingVariant: "dashboard", title: "Project not found", description: "The project you're looking for doesn't exist or has been deleted." }}>
        {project && (
          <>
            <PageStats>
              <ImmersiveStatCard icon={CheckCircle2} label="Completion Rate" value={taskAnalytics.completionRate + "%"} tone="success" subtitle={taskAnalytics.done + "/" + taskAnalytics.total + " complete"} />
              <ImmersiveStatCard icon={Clock} label="In Progress" value={taskAnalytics.inProgress} tone="accent" subtitle="Active now" />
              <ImmersiveStatCard icon={ListTodo} label="To Do" value={taskAnalytics.todo} subtitle="Awaiting action" />
              <ImmersiveStatCard icon={CalendarClock} label="Timeline" value={daysRemaining !== null ? daysRemaining + "d" : "-"} tone={daysRemaining !== null && daysRemaining <= 3 ? "danger" : "warning"} subtitle={project.dueDate ? "Due " + formatDate(project.dueDate) : "No deadline set"} />
            </PageStats>

            <DetailTabs tabs={PROJECT_TABS} activeTab={activeTab} onChange={handleTabChange} counts={{ tasks: projectTasks.length }} />

            {activeTab === "overview" && (
              <>
                <div className="mt-4 mb-1 px-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">Overall Progress</span>
                    <span className="text-[11px] font-bold text-[var(--text-primary)] tabular-nums">{project.progress || 0}%</span>
                  </div>
                  <ProgressBar value={project.progress || 0} height="h-2" />
                </div>

                <PageContent>
                  <PageGrid sidebarWidth="default">
                    <div className="space-y-5">
                      <ProjectSummaryCard project={project} taskAnalytics={taskAnalytics} healthScore={healthScore} healthStatus={healthStatus} daysRemaining={daysRemaining} projectTasks={projectTasks} teamContributions={teamContributions} />
                      {teamContributions.length > 0 && <TeamContributionsCard teamContributions={teamContributions} />}
                    </div>

                    <PageAside>
                      <CrewAccessCard project={project} userCrews={userCrews} workspaceMode={workspaceMode} canManageProject={canManageProject} setIsShareModalOpen={setIsShareModalOpen} unshareMutation={unshareMutation} />
                      <ProjectDetailsCard project={project} />
                      <ActivityCard projectActivities={projectActivities} limit={5} />
                    </PageAside>
                  </PageGrid>
                </PageContent>
              </>
            )}

            {activeTab === "tasks" && (
              <>
                <PageToolbar>
                  <div className="flex items-center gap-2">
                    <KanbanSquare className="w-4 h-4 text-[var(--text-muted)]" />
                    <span className="text-[13px] font-semibold text-[var(--text-primary)]">Task Board</span>
                    <span className="text-[11px] text-[var(--text-muted)] tabular-nums">({projectTasks.length} {projectTasks.length === 1 ? "task" : "tasks"})</span>
                  </div>
                  <Button size="xs" variant="outline" className="gap-1.5" onClick={() => setIsAddTaskOpen(true)}><Plus className="w-3 h-3" /> New Task</Button>
                </PageToolbar>

                <PageContent>
                  <KanbanBoard
                    tasks={projectTasks}
                    mode={isSharedToCrew ? "CREWS" : workspaceMode}
                    onTaskClick={(t) => setSelectedTaskId(t.id)}
                  />
                </PageContent>

                <FloatingActions position="bottom-right">
                  <Button size="icon" className="w-12 h-12 rounded-2xl shadow-[var(--shadow-lg)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white" onClick={() => setIsAddTaskOpen(true)}><Plus className="w-5 h-5" /></Button>
                </FloatingActions>
              </>
            )}

            {activeTab === "activity" && (
              <PageContent>
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden">
                  <div className="px-5 pt-4 pb-1 border-b border-[var(--border-subtle)]">
                    <Heading level={4} className="text-sm font-semibold flex items-center gap-2"><ActivityIcon className="w-4 h-4 text-[var(--accent)]" /> Recent Activity</Heading>
                  </div>
                  <div className="p-5">
                    {projectActivities.length === 0 ? (
                      <div className="py-10 text-center"><Text variant="muted" size="sm">No activity recorded yet.</Text></div>
                    ) : (
                      <div className="space-y-0.5 max-w-3xl">
                        {projectActivities.slice(0, 30).map((act, idx) => (
                          <div key={act.id || idx} className="flex items-start gap-3 py-2.5">
                            <div className="relative mt-1.5">
                              <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                              {idx < Math.min(projectActivities.length, 30) - 1 && <div className="absolute top-3 left-[3px] w-px h-full bg-[var(--border-subtle)]" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[13px] text-[var(--text-primary)] leading-relaxed"><span className="font-semibold text-[var(--accent)]">{act.actor || act.username || "System"}</span> {act.action || act.description || "performed an action"}</p>
                              <span className="text-[11px] text-[var(--text-muted)] mt-0.5 block font-mono">{act.timestamp ? new Date(act.timestamp).toLocaleString() : "Recently"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </PageContent>
            )}
          </>
        )}
      </PageState>

      {/* Modals */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <Heading level={3} className="mb-5 text-[15px] font-semibold">Edit Project</Heading>
          <ProjectForm defaultValues={project ? { name: project.name, description: project.description || "", organizationId: project.organizationId || "", teamId: project.teamId ? project.teamId.toString() : "none", crewId: project.crewId ? project.crewId.toString() : (project.sharedCrewIds?.[0]?.toString() || ""), collaboratorIds: Array.isArray(project.collaboratorIds) ? project.collaboratorIds : (Array.isArray(project.collaborators) ? project.collaborators.map(c => c.userId || c.id) : []), dueDate: project.dueDate ? project.dueDate.slice(0, 16) : "" } : {}} onSubmit={handleEditProject} isLoading={updateProjectMutation.isPending} workspaceMode={workspaceMode === "PERSONAL" && isSharedToCrew ? "CREWS" : workspaceMode} useOrgTeamsHook={useOrgTeams} hideContextFields={workspaceMode === "ORG"} />
        </ModalContent>
      </Modal>
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4 text-[var(--danger)]">Delete Project</Heading>
          <Text className="mb-6">Are you sure you want to delete <strong>{project?.name}</strong>? This action cannot be undone and will delete all associated tasks.</Text>
          <div className="flex justify-end gap-3"><Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button><Button variant="danger" onClick={handleDeleteProject} isLoading={deleteProjectMutation.isPending}>Yes, Delete</Button></div>
        </ModalContent>
      </Modal>
      <Modal open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Task</Heading>
          <TaskForm defaultValues={project ? { title: "", description: "", assigneeUsername: "", priority: "MEDIUM", dueDate: "", tags: "", teamId: project.teamId ? project.teamId.toString() : "", projectId: projectId.toString() } : {}} fixedProjectId={projectId} fixedTeamId={project?.teamId} onSubmit={handleAddTaskSubmit} isLoading={createTaskMutation.isPending} />
        </ModalContent>
      </Modal>
      {project && <CrewProjectShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} project={project} />}
      <TaskPanel taskId={selectedTaskId} isOpen={!!selectedTaskId} onClose={() => setSelectedTaskId(null)} />
    </PageShell>
  );
}

/* Side cards (Overview tab) */

function ProjectHeroActions({ project, isSharedToCrew, canManageProject, setIsAddTaskOpen, setIsShareModalOpen, setIsEditModalOpen, setIsDeleteModalOpen }) {
  return (
    <div className="flex flex-wrap items-center gap-2 shrink-0">
      <SaveToggle entityType={ENTITY_TYPES.PROJECT} entityId={project.id} className="mr-1" />
      <div className="h-6 w-px bg-[var(--border-subtle)]" />
      <Button size="sm" className="gap-1.5 shadow-sm font-medium" onClick={() => setIsAddTaskOpen(true)}><Plus className="w-4 h-4" /> Add Task</Button>
      {canManageProject && (<><Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)} className="gap-1.5"><Share2 className="w-3.5 h-3.5" />{isSharedToCrew ? "Crew Access" : "Share"}</Button><Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)} className="gap-1.5"><Edit3 className="w-3.5 h-3.5" /> Edit</Button><Button variant="outline" size="sm" className="text-[var(--danger)] hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger-soft)] gap-1.5" onClick={() => setIsDeleteModalOpen(true)}><Trash2 className="w-3.5 h-3.5" /> Delete</Button></>)}
    </div>
  );
}

function ProjectSummaryCard({ project, taskAnalytics, healthScore, healthStatus, daysRemaining, projectTasks, teamContributions }) {
  return (
    <PremiumCard variant="default">
      <PremiumCardHeader><PremiumCardTitle icon={CheckCircle2}>Project Summary</PremiumCardTitle></PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-4">
          <div className="flex justify-center py-2"><ProgressRing value={project.progress || 0} size={80} strokeWidth={5}><span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">{project.progress || 0}%</span></ProgressRing></div>
          <div className="space-y-2.5">
            <SummaryRow label="Health Score" value={healthScore} suffix="/100" tone={healthStatus.tone} />
            <SummaryRow label="Tasks Done" value={taskAnalytics.done} suffix={" / " + taskAnalytics.total} />
            <SummaryRow label="Remaining" value={daysRemaining !== null ? daysRemaining + " days" : "-"} tone={daysRemaining !== null && daysRemaining <= 3 ? "danger" : undefined} />
          </div>
          <div className="border-t border-[var(--border-subtle)] pt-3">
            <span className="text-[11px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-2.5 block">Milestones</span>
            <div className="space-y-2">
              <MilestoneCheck done={projectTasks.length > 0} label={"Tasks initialized (" + projectTasks.length + ")"} />
              <MilestoneCheck done={!!project.dueDate} label="Timeline scheduled" />
              <MilestoneCheck done={teamContributions.length > 0} label="Team assigned" />
            </div>
          </div>
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

function SummaryRow({ label, value, suffix = "", tone }) {
  return (
    <div className="flex justify-between items-center py-1.5 px-3 rounded-lg bg-[var(--bg-subtle)]">
      <span className="text-[11px] text-[var(--text-muted)]">{label}</span>
      <span className={cn("text-[13px] font-bold tabular-nums", tone === "success" && "text-[var(--success)]", tone === "accent" && "text-[var(--accent)]", tone === "warning" && "text-[var(--warning)]", tone === "danger" && "text-[var(--danger)]", !tone && "text-[var(--text-primary)]")}>{value}<span className="text-[10px] font-normal text-[var(--text-muted)]">{suffix}</span></span>
    </div>
  );
}

function MilestoneCheck({ done, label }) {
  return (
    <div className="flex items-center gap-2.5 text-[11px]">
      <div className={cn("w-4 h-4 rounded-md border flex items-center justify-center text-[8px] shrink-0 transition-colors", done ? "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success)]/30" : "border-[var(--border-default)] text-transparent")}>{done && "âœ“"}</div>
      <span className={done ? "text-[var(--text-secondary)]" : "text-[var(--text-muted)]"}>{label}</span>
    </div>
  );
}

function TeamContributionsCard({ teamContributions }) {
  return (
    <PremiumCard variant="default">
      <PremiumCardHeader><PremiumCardTitle icon={Users}>Team Contribution</PremiumCardTitle></PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-3.5">
          {teamContributions.map((c, i) => (
            <div key={i}>
              <div className="flex justify-between text-[11px] mb-1.5"><span className="font-medium text-[var(--text-primary)] truncate">{c.name}</span><span className="text-[var(--text-muted)] font-mono tabular-nums">{c.tasks} ({c.percentage}%)</span></div>
              <ProgressBar value={c.percentage} height="h-1.5" />
            </div>
          ))}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

function CrewAccessCard({ project, userCrews, workspaceMode, canManageProject, setIsShareModalOpen, unshareMutation }) {
  return (
    <PremiumCard variant="default">
      <PremiumCardHeader><PremiumCardTitle icon={Share2}>Crew Access</PremiumCardTitle></PremiumCardHeader>
      <PremiumCardContent>
        {(!project.sharedCrewIds || project.sharedCrewIds.length === 0) ? (
          <div className="py-3 text-center">
            <Text variant="muted" size="sm" className="mb-2">Not shared with any crew</Text>
            {workspaceMode === "PERSONAL" && canManageProject && <Button size="xs" variant="outline" onClick={() => setIsShareModalOpen(true)} className="mt-1"><Share2 className="w-3 h-3 mr-1" /> Share Now</Button>}
          </div>
        ) : (
          <div className="space-y-2">
            {project.sharedCrewIds.map(cid => {
              const crew = userCrews.find(c => String(c.id) === String(cid));
              return (
                <div key={cid} className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-[11px] shrink-0">{crew?.name?.charAt(0).toUpperCase() || "C"}</div>
                    <span className="font-medium text-[12px] truncate text-[var(--text-primary)]">{crew?.name || "Crew #" + cid}</span>
                  </div>
                  {canManageProject && <Button size="xs" variant="ghost" className="text-[var(--danger)] hover:bg-[var(--danger-soft)]" onClick={() => unshareMutation.mutate({ projectId: Number(project.id), crewId: Number(cid) })} isLoading={unshareMutation.isPending}>Remove</Button>}
                </div>
              );
            })}
          </div>
        )}
      </PremiumCardContent>
    </PremiumCard>
  );
}

function ProjectDetailsCard({ project }) {
  return (
    <PremiumCard variant="default">
      <PremiumCardHeader><PremiumCardTitle>Details</PremiumCardTitle></PremiumCardHeader>
      <PremiumCardContent>
        <div className="space-y-3">
          {project.organizationName && <DetailRow label="Organization" value={project.organizationName} />}
          {project.teamName && <DetailRow label="Team" value={project.teamName} />}
          <DetailRow label="Owner" value={project.createdBy || "System"} />
          {project.dueDate && <DetailRow label="Deadline" value={formatDate(project.dueDate)} />}
        </div>
      </PremiumCardContent>
    </PremiumCard>
  );
}

function DetailRow({ label, value }) {
  return <div className="flex items-center justify-between text-[12px]"><span className="text-[var(--text-muted)]">{label}</span><span className="font-medium text-[var(--text-primary)]">{value}</span></div>;
}

function ActivityCard({ projectActivities, limit = 10 }) {
  const items = projectActivities.slice(0, limit);
  return (
    <PremiumCard variant="default" className="overflow-hidden">
      <PremiumCardHeader><PremiumCardTitle icon={ActivityIcon}>Recent Activity</PremiumCardTitle></PremiumCardHeader>
      <div className={cn(limit > 0 && "max-h-64", "overflow-y-auto custom-scrollbar")}>
        {items.length === 0 ? (
          <div className="py-6 text-center"><Text variant="muted" size="sm">No activity recorded yet.</Text></div>
        ) : (
          <div className="px-5 pb-5 space-y-0.5">
            {items.map((act, idx) => (
              <div key={act.id || idx} className="flex items-start gap-3 py-2">
                <div className="relative mt-1.5">
                  <div className="w-2 h-2 rounded-full bg-[var(--accent)] shrink-0" />
                  {idx < items.length - 1 && <div className="absolute top-3 left-[3px] w-px h-full bg-[var(--border-subtle)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[var(--text-primary)] leading-relaxed"><span className="font-semibold text-[var(--accent)]">{act.actor || act.username || "System"}</span> {act.action || act.description || "performed an action"}</p>
                  <span className="text-[10px] text-[var(--text-muted)] mt-0.5 block font-mono">{act.timestamp ? new Date(act.timestamp).toLocaleString() : "Recently"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PremiumCard>
  );
}

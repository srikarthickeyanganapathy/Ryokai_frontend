import React, { useMemo, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { DropdownMenu } from '@/shared/ui/DropdownMenu'
import { Badge } from '@/shared/ui/Badge'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProgressRing } from '@/shared/ui/Progress'
import { PageShell } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { useProject, useUpdateProject, useDeleteProject, useUnshareProjectFromCrew, useProjectActivities } from '../features/hooks/useProjects'
import { useTeam, useOrgMembers, useOrgTeams } from '@/organization'
import { useCrewMembers, useCrews } from '@/crew'
import { ProjectForm } from '../components/ProjectForm'
import { CrewProjectShareModal } from '../components/CrewProjectShareModal'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useTaskList, useCreateTask, useReassignTask, useTaskStatusChange, TaskForm, TaskPanel } from '@/task'
import { toast } from 'sonner'
import { SaveToggle } from '@/saved/features/components/SaveToggle'
import { ENTITY_TYPES } from '@/shared/constants/entityTypes'
import { PROJECT_STATUS_COLORS } from '@/shared/lib/status'
import { usePermissions, useAuth } from '@/identity'
import { calculateHealthScore, getHealthStatus, getTaskAnalytics, getTeamContributions } from '../features/utils/projectUtils'
import { Plus, Share2, Edit3, Trash2, Archive, MoreHorizontal, AlertTriangle, CalendarClock, ListTodo, CheckCircle2 } from 'lucide-react'
import { Icons } from '@/shared/ui/Icons'
import { ProjectTabs } from '../components/ProjectTabs'
import { OverviewTab } from '../components/OverviewTab'
import { BoardTab } from '../components/BoardTab'
import { ActivityTab } from '../components/ActivityTab'

/* ============================================================
   pages/ProjectDetailPage.jsx — project HQ (approved demo).
   Data layer (hooks, derivations, permissions, mutations,
   modals, TaskPanel, crew logic) is preserved from your page;
   presentation follows the approved demo and uses your shared
   UI components throughout.
   ============================================================ */

const defaultStatusColor = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]'

function hashHue(str = '') {
  const navigate = useNavigate();
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

const isDone = t => (t.currentStatus || t.status || '').toUpperCase() === 'DONE'

function daysUntil(dateInput) {
  if (!dateInput) return null
  const d = new Date(dateInput)
  if (isNaN(d.getTime())) return null
  return Math.round((d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)) / 86400000)
}

export function ProjectDetailPage() {
  const { projectId } = useParams()
  // navigate already present
  const [searchParams, setSearchParams] = useSearchParams()
  const { workspaceMode } = useWorkspace()
  const { canManageProject, canAssignTask, canEditTask, canReview, canReviewTask, isSuperAdmin } = usePermissions()
  const { user } = useAuth()

  const initialTab = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState(initialTab && ['overview', 'tasks', 'activity'].includes(initialTab) ? initialTab : 'overview')
  const handleTabChange = (id) => {
    setActiveTab(id)
    setSearchParams(params => { if (id === 'overview') params.delete('tab'); else params.set('tab', id); return params }, { replace: true })
  }

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [assigningTaskId, setAssigningTaskId] = useState(null)
  const [selectedTaskId, setSelectedTaskId] = useState(null)

  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(projectId))
  const { data: rawActivities } = useProjectActivities(Number(projectId))
  const projectActivities = Array.isArray(rawActivities) ? rawActivities : rawActivities?.content || []
  const { data: team } = useTeam(project?.teamId)
  const { data: orgMembers = [] } = useOrgMembers(project?.organizationId)
  const { data: { tasks: rawTasks = [] } = {}, isLoading: tasksLoading } = useTaskList({ projectId: Number(projectId) })
  const projectTasks = Array.isArray(rawTasks) ? rawTasks : rawTasks?.content || []

  const createTaskMutation = useCreateTask()
  const reassignTaskMutation = useReassignTask()
  const changeTaskStatus = useTaskStatusChange()
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const unshareMutation = useUnshareProjectFromCrew()
  const { data: userCrews = [] } = useCrews()

  const crewId = project?.crewId || (project?.sharedCrewIds?.[0] ?? null)
  const isSharedToCrew = !!crewId || (Array.isArray(project?.sharedCrewIds) && project.sharedCrewIds.length > 0)
  const { data: crewMembers = [] } = useCrewMembers(crewId)

  const taskAnalytics = useMemo(() => getTaskAnalytics(projectTasks), [projectTasks])
  const teamContributions = useMemo(() => getTeamContributions(projectTasks), [projectTasks])
  const healthScore = useMemo(() => calculateHealthScore(project), [project])
  const healthStatus = useMemo(() => getHealthStatus(healthScore), [healthScore])

  const assignableMembers = useMemo(() => {
    if (crewId && crewMembers?.length > 0) return crewMembers
    if (project?.teamId && team) return team.members || []
    return orgMembers || []
  }, [project, team, orgMembers, crewId, crewMembers])

  const canDragTask = (task) => {
    if (!task?.id) return false
    if (workspaceMode === 'PERSONAL' || isSuperAdmin || canEditTask || canAssignTask || canReview || canReviewTask) return true
    const me = user?.username
    const assignee = typeof task.assignee === 'object' ? task.assignee?.username : (task.assignee || task.assignedTo)
    const creator = typeof task.creator === 'object' ? task.creator?.username : task.creator
    return assignee === me || creator === me
  }

  /* Handlers */
  const handleEditProject = (p) => updateProjectMutation.mutate({ id: Number(projectId), updates: p }, { onSuccess: () => { setIsEditModalOpen(false); toast.success('Project updated') } })
  const handleDeleteProject = () => deleteProjectMutation.mutate(Number(projectId), { onSuccess: () => { setIsDeleteModalOpen(false); toast.success('Project deleted'); navigate('/app/projects') } })
  const handleArchiveProject = () => updateProjectMutation.mutate({ id: Number(projectId), updates: { status: 'ARCHIVED' } }, { onSuccess: () => { toast.success('Project archived'); navigate('/app/projects') } })
  const handleAddTaskSubmit = (p) => createTaskMutation.mutate({ ...p, projectId: Number(projectId), teamId: project?.teamId || null, organizationId: project?.organizationId || null, crewId: crewId || null }, { onSuccess: () => { setIsAddTaskOpen(false); toast.success('Task created') } })
  const handleAssignTask = (taskId, memberId, username) => reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, { onSuccess: () => { toast.success('Task assigned to ' + username); setAssigningTaskId(null) } })

  const handleTaskDrop = (taskId, colKey) => {
    const task = projectTasks.find(t => String(t.id) === String(taskId))
    if (!task) return
    changeTaskStatus(task, colKey === 'review' ? 'SUBMITTED' : colKey === 'done' ? 'DONE' : 'IN_PROGRESS')
    toast.success('Task moved')
  }

  const handleQuickComplete = (task) => {
    changeTaskStatus(task, 'DONE')
    toast.success('Task completed')
  }

  const daysRemaining = project?.dueDate ? Math.max(0, Math.ceil((new Date(project.dueDate) - new Date()) / 86400000)) : null
  const pageState = projectLoading || tasksLoading ? 'loading' : projectError || !project ? 'error' : 'ready'

  // Attention tiles — pure presentation derivation from real tasks
  const band = useMemo(() => {
    const overdue = projectTasks.filter(t => !isDone(t) && !t.archived && daysUntil(t.dueDate) != null && daysUntil(t.dueDate) < 0).length
    const dueSoon = projectTasks.filter(t => { const d = daysUntil(t.dueDate); return !isDone(t) && !t.archived && d != null && d >= 0 && d <= 7 }).length
    const inProgress = projectTasks.filter(t => !isDone(t) && !t.archived).length
    return { overdue, dueSoon, inProgress, completionRate: taskAnalytics.completionRate }
  }, [projectTasks, taskAnalytics])

  const hue = hashHue(project?.name || 'project')

  const crewAccessList = useMemo(() => (project?.sharedCrewIds || []).map(cid => {
    const crew = userCrews.find(c => String(c.id) === String(cid))
    return { id: cid, name: crew?.name || `Crew #${cid}` }
  }), [project, userCrews])

  return (
    <PageShell maxWidth="full" className="!px-0 !py-0">
      <div className="flex flex-col h-full">
        {/* ---------- Header: identity + actions ---------- */}
        <div className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-3 py-3.5 flex-wrap">
              <button
                onClick={() => navigate('/app/projects')}
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                title="Back to projects"
              >
                <Icons.chevronLeft className="w-4 h-4" />
              </button>

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 border border-white/10"
                style={{ background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 35) % 360} 68% 38%))` }}
              >
                {(project?.name || 'P').charAt(0).toUpperCase()}
              </div>

              <div className="flex items-center gap-2 min-w-0 flex-1">
                <Heading level={3} className="font-semibold truncate mb-0 text-[15px]">
                  {project?.name || 'Project'}
                </Heading>
                <Badge variant="outline" size="xs" className={cn('uppercase tracking-wider font-mono shrink-0', PROJECT_STATUS_COLORS[project?.status] || defaultStatusColor)}>
                  {project?.status || 'ACTIVE'}
                </Badge>
                {project?.description && (
                  <Text variant="muted" size="sm" className="line-clamp-1 ml-1 hidden lg:inline">
                    {project.description}
                  </Text>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]">
                  <ProgressRing value={healthScore} size={28} strokeWidth={3} />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-[var(--text-secondary)] leading-none">Health</span>
                    <span className={cn('text-[11px] font-bold leading-none mt-0.5', healthStatus.tone === 'success' && 'text-[var(--success)]', healthStatus.tone === 'accent' && 'text-[var(--accent)]', healthStatus.tone === 'warning' && 'text-[var(--warning)]', healthStatus.tone === 'danger' && 'text-[var(--danger)]')}>
                      {healthStatus.label}
                    </span>
                  </div>
                </div>
                {project && (
                  <>
                    <SaveToggle entityType={ENTITY_TYPES.PROJECT} entityId={project.id} />
                    <div className="h-6 w-px bg-[var(--border-subtle)]" />
                    <Button size="sm" onClick={() => setIsAddTaskOpen(true)} className="gap-1 text-[11px] h-7 shadow-sm font-medium">
                      <Plus className="w-3 h-3" /> Add Task
                    </Button>
                    {canManageProject && (
                      <>
                        <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)} className="gap-1 text-[11px] h-7">
                          <Share2 className="w-3 h-3" />{isSharedToCrew ? 'Crew Access' : 'Share'}
                        </Button>
                        <DropdownMenu
                          trigger={
                            <Button variant="outline" size="sm" className="px-2 h-7">
                              <MoreHorizontal className="w-3.5 h-3.5" />
                            </Button>
                          }
                          items={[
                            { label: 'Edit', icon: Edit3, onClick: () => setIsEditModalOpen(true) },
                            { label: 'Archive', icon: Archive, onClick: handleArchiveProject },
                            { label: 'Delete', icon: Trash2, onClick: () => setIsDeleteModalOpen(true), danger: true },
                          ]}
                        />
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
          <PageState state={pageState} stateProps={{ loadingVariant: 'dashboard', title: 'Project not found', description: "The project you're looking for doesn't exist or has been deleted." }}>
        {project && (
          <>
            {/* Attention tiles (approved demo) */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--success)]/25 bg-[var(--success)]/5 px-3.5 py-3">
                <ProgressRing value={band.completionRate} size={40} strokeWidth={3.5}>
                  <span className="text-[10.5px] font-bold tabular-nums">{band.completionRate}%</span>
                </ProgressRing>
                <div>
                  <p className="text-[12px] font-bold leading-none">Completion</p>
                  <p className="text-[10px] font-semibold text-[var(--text-muted)] mt-1">{taskAnalytics.done}/{taskAnalytics.total} done</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger)]/5 px-3.5 py-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-4 h-4 text-[var(--danger)]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-none tabular-nums">{band.overdue}</p>
                  <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Overdue</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning)]/5 px-3.5 py-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center shrink-0">
                  <CalendarClock className="w-4 h-4 text-[var(--warning)]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-none tabular-nums">{band.dueSoon}</p>
                  <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Due soon</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-[var(--accent-border)]/60 bg-[var(--accent-soft)]/40 px-3.5 py-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                  <ListTodo className="w-4 h-4 text-[var(--accent)]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-[17px] font-bold leading-none tabular-nums">{band.inProgress}</p>
                  <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">In progress</p>
                </div>
              </div>
            </div>

            <ProjectTabs activeTab={activeTab} onChange={handleTabChange} counts={{ tasks: projectTasks.length }} />

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {activeTab === 'overview' && (
                  <OverviewTab
                    project={project}
                    taskAnalytics={taskAnalytics}
                    healthScore={healthScore}
                    healthStatus={healthStatus}
                    daysRemaining={daysRemaining}
                    projectTasks={projectTasks}
                    teamContributions={teamContributions}
                    crewAccess={{
                      list: crewAccessList,
                      canManage: canManageProject,
                      onRemove: (cid) => unshareMutation.mutate({ projectId: Number(project.id), crewId: Number(cid) }),
                    }}
                    activities={projectActivities}
                    onOpenTasks={() => handleTabChange('tasks')}
                  />
                )}
                {activeTab === 'tasks' && (
                  <BoardTab
                    projectTasks={projectTasks}
                    canAssignTask={canAssignTask}
                    canDragTask={canDragTask}
                    assigningTaskId={assigningTaskId}
                    setAssigningTaskId={setAssigningTaskId}
                    assignableMembers={assignableMembers}
                    onAssign={handleAssignTask}
                    onUpdateStatus={handleQuickComplete}
                    onTaskDrop={handleTaskDrop}
                    onTaskClick={(task) => navigate(`/app/tasks/${task.id}`, { state: { task } })}
                    onNewTask={() => setIsAddTaskOpen(true)}
                  />
                )}
                {activeTab === 'activity' && (
                  <ActivityTab projectActivities={projectActivities} />
                )}
              </motion.div>
            </AnimatePresence>
          </>
          )}
          </PageState>
        </div>
      </div>

      {/* Modals */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-md !bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <Heading level={3} className="mb-5 text-[15px] font-semibold">Edit Project</Heading>
          <ProjectForm
            defaultValues={project ? { name: project.name, description: project.description || '', organizationId: project.organizationId || '', teamId: project.teamId ? project.teamId.toString() : 'none', crewId: project.crewId ? project.crewId.toString() : (project.sharedCrewIds?.[0]?.toString() || ''), collaboratorIds: Array.isArray(project.collaboratorIds) ? project.collaboratorIds : (Array.isArray(project.collaborators) ? project.collaborators.map(c => c.userId || c.id) : []), dueDate: project.dueDate ? project.dueDate.slice(0, 16) : '' } : {}}
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
            defaultValues={project ? { title: '', description: '', assigneeUsername: '', priority: 'MEDIUM', dueDate: '', tags: '', teamId: project.teamId ? project.teamId.toString() : '', projectId: projectId.toString() } : {}}
            fixedProjectId={projectId}
            fixedTeamId={project?.teamId}
            onSubmit={handleAddTaskSubmit}
            isLoading={createTaskMutation.isPending}
          />
        </ModalContent>
      </Modal>
      {project && <CrewProjectShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} project={project} />}

      {/* Mobile FAB */}
      <AnimatePresence>
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={() => setIsAddTaskOpen(true)}
          className="sm:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-lg)] flex items-center justify-center cursor-pointer"
          title="New task" aria-label="New task"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      </AnimatePresence>
    </PageShell>
  )
}

export default ProjectDetailPage

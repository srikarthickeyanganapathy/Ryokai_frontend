import React, { useState, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Plus, Settings2, AlertTriangle, CalendarClock, ListTodo } from 'lucide-react'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { ProgressRing } from '@/shared/ui/Progress'
import { PillNav } from '@/shared/ui/PillNav'
import { PageShell } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { useTeam, useTeamMessages, useSendTeamMessage, useDeleteTeamMessage, useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { useTaskList, useCreateTask, useReassignTask, useTaskStatusChange, TaskForm } from '@/task'
import { useProjects, useCreateProject, useUpdateProject, ProjectForm } from '@/project'
import { useAuth, usePermissions } from '@/identity'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'
import { TeamTabs } from '../components/TeamTabs'
import { WhiteboardsTab } from '@/crew/components/CrewDetailTabs/WhiteboardsTab'
import { OverviewTab } from '../components/OverviewTab'
import { ProjectsTab } from '../components/ProjectsTab'
import { TasksTab } from '../components/TasksTab'
import { MembersTab } from '../components/MembersTab'
import { DiscussionTab } from '../components/DiscussionTab'
import { InsightsTab } from '../components/InsightsTab'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'
import { normalizePriority } from '@/shared/lib/priority'
import { Skeleton } from '@/shared/ui/Skeleton';

const INACTIVE_STATUSES = new Set(['completed', 'done', 'archived', 'cancelled', 'closed'])
const isActiveStatus = (status) => !INACTIVE_STATUSES.has((status || '').toLowerCase())
const isHighPriority = (priority) => ['High', 'Urgent'].includes(normalizePriority(priority))

/* ============================================================
   pages/TeamDetailPage.jsx
   Team HQ -- Overview / Work / People / Discussion / Insights.
   Data layer (hooks, derivations, mutations, permissions,
   PageState, modals) is preserved from the original page;
   only the presentation follows the approved redesign and is
   built entirely on your shared UI components.
   ============================================================ */

export function TeamDetailPage() {
  const { orgId, teamId } = useParams()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()
  const navigate = useNavigate()
  const reduceMotion = useReducedMotion()
  const { user } = useAuth()
  const { canManageTeam, canCreateProject, canAssignTask, canEditTask, canDeleteTask, canReviewTask } = usePermissions()
  const canManage = canManageTeam

  const [activeTab, setActiveTab] = useState('overview')
  const [workView, setWorkView] = useState('tasks')
  const [taskFilter, setTaskFilter] = useState('all')
  const [assigningTaskId, setAssigningTaskId] = useState(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false)


  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamId)
  const { data: messages = [], isLoading: messagesLoading } = useTeamMessages(teamId)
  const sendMessageMutation = useSendTeamMessage(teamId)
  const deleteMessageMutation = useDeleteTeamMessage(teamId)

  const { data: { tasks: allTasks = [] } = {}, isLoading: tasksLoading } = useTaskList({ teamId: Number(teamId) })
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects()
  const createProjectMutation = useCreateProject()
  const createTaskMutation = useCreateTask()
  const reassignTaskMutation = useReassignTask()
  const changeTaskStatus = useTaskStatusChange()
  const updateProjectMutation = useUpdateProject()
  const { data: orgMembers = [] } = useOrgMembers(orgId)

  const handleCreateProjectSubmit = (data) => {
    createProjectMutation.mutate(
      { ...data, teamId: Number(teamId), organizationId: Number(orgId) },
      { onSuccess: () => { setIsCreateProjectOpen(false); toast.success('Team project created') } },
    )
  }

  const handleCreateTaskSubmit = (values) => {
    createTaskMutation.mutate(
      { ...values, teamId: Number(teamId), organizationId: Number(orgId) },
      {
        onSuccess: () => {
          setIsNewTaskOpen(false)
          toast.success('Task created')
          setActiveTab('work')
          setWorkView('tasks')
        },
      },
    )
  }

  const isMember = useMemo(() => !!(team && user && team.members?.some(m => m.username === user.username)), [team, user])
  const isObserver = useMemo(() => !!(team && user && team.observers?.some(o => o.username === user.username)), [team, user])
  const isAuthorized = canManage || isMember || isObserver
  const isReadOnly = isObserver && !canManage

  // Backend returns the team's tasks including tasks of the team's projects
  // (project bridge), so no client-side teamId filter is needed here.
  const teamTasks = useMemo(() => allTasks, [allTasks])
  const teamProjects = useMemo(() => allProjects.filter(p => p.teamId === Number(teamId)), [allProjects, teamId])

  const workload = useMemo(() => {
    const counts = {}
    team?.members?.forEach(m => { counts[m.username] = 0 })
    teamTasks.forEach(t => {
      if (t.assignedTo && t.status !== 'Done' && !t.archived) {
        counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1
      }
    })
    return counts
  }, [team, teamTasks])

  const hasProjectIdOnTasks = useMemo(() => teamTasks.some(t => t.projectId != null), [teamTasks])
  const hasTaskTimestamps = useMemo(() => teamTasks.some(t => t.updatedAt || t.createdAt || t.completedAt), [teamTasks])

  const tasksForProject = (projectId) =>
    hasProjectIdOnTasks ? teamTasks.filter(t => t.projectId === projectId) : []

  const insights = useMemo(() => {
    const activeTasks = teamTasks.filter(t => !t.archived && t.status !== 'Done')
    const doneTasks = teamTasks.filter(t => t.status === 'Done')
    const total = teamTasks.length
    const completionRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0
    const unassignedTasks = activeTasks.filter(t => !t.assignedTo)
    const highPriorityTasks = activeTasks.filter(t => isHighPriority(t.priority))
    const activeProjects = teamProjects.filter(p => isActiveStatus(p.status))
    const idleMembers = Object.entries(workload).filter(([, count]) => count === 0)
    const workloadValues = Object.values(workload)
    const maxWorkload = workloadValues.length ? Math.max(...workloadValues) : 0
    const minWorkload = workloadValues.length ? Math.min(...workloadValues) : 0
    const balanceScore =
      maxWorkload > 0 ? Math.round(100 - ((maxWorkload - minWorkload) / maxWorkload) * 60) : 100
    const busiestEntry = Object.entries(workload).sort((a, b) => b[1] - a[1])[0]
    const busiestMember = busiestEntry && busiestEntry[1] > 0 ? busiestEntry[0] : null

    return {
      total,
      doneCount: doneTasks.length,
      activeCount: activeTasks.length,
      completionRate,
      unassignedCount: unassignedTasks.length,
      highPriorityCount: highPriorityTasks.length,
      activeProjectsCount: activeProjects.length,
      idleMembersCount: idleMembers.length,
      balanceScore,
      busiestMember,
    }
  }, [teamTasks, teamProjects, workload])

  const taskBoard = useMemo(() => {
    const unassigned = []
    const inProgress = []
    const review = []
    const completed = []
    teamTasks.forEach(t => {
      if (t.status === 'Done') completed.push(t)
      else if (!t.assignedTo) unassigned.push(t)
      else if ((t.status || '').toLowerCase().includes('review')) review.push(t)
      else inProgress.push(t)
    })
    return { unassigned, inProgress, review, completed }
  }, [teamTasks])

  // Synthetic activity feed from messages + project/task state
  const activityFeed = useMemo(() => {
    const items = []

    // Add recent messages
    messages.slice(-8).reverse().forEach(msg => {
      items.push({
        type: 'message_sent',
        user: msg.sender?.username || 'Someone',
        action: 'sent a message',
        target: null,
        time: msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
      })
    })

    // Add completed tasks
    teamTasks.filter(t => t.status === 'Done').slice(-3).forEach(t => {
      items.push({
        type: 'task_completed',
        user: t.assignedTo || 'Someone',
        action: 'completed',
        target: t.title || 'a task',
        time: t.updatedAt ? new Date(t.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
      })
    })

    // Add recent projects
    teamProjects.slice(-3).reverse().forEach(p => {
      items.push({
        type: 'project_created',
        user: p.creator || 'Someone',
        action: 'created project',
        target: p.name || 'Untitled',
        time: p.createdAt ? new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'recently',
      })
    })

    return items.slice(0, 20)
  }, [messages, teamTasks, teamProjects])

  const handleSendMessage = (content) => sendMessageMutation.mutate(content)
  const handleDeleteMessage = async (messageId) => {
    if (await confirm({ title: 'Delete this message?', danger: true })) {
      deleteMessageMutation.mutate(messageId)
    }
  }
  const handleAssignTask = (taskId, memberId, memberUsername) => {
    reassignTaskMutation.mutate(
      { taskId, newAssigneeId: memberId },
      {
        onSuccess: () => {
          toast.success(`Assigned to ${memberUsername}`)
          setAssigningTaskId(null)
        },
      },
    )
  }

  // Wire the team kanban drop -> shared task status transitions (useTasks only).
  // Board columns: 'To Do'/'In Progress' -> IN_PROGRESS, 'In Review' -> SUBMITTED, 'Done' -> DONE.
  // Permission gating lives in useTaskStatusChange (mirrors backend @PreAuthorize rules).
  const handleUpdateTaskStatus = (taskId, targetStatus) => {
    if (isReadOnly) return
    const task = teamTasks.find(t => String(t.id) === String(taskId))
    if (!task) return
    const normalized = String(targetStatus || '').toUpperCase().replace(/\s+/g, '_')
    const mapped = normalized === 'IN_REVIEW' || normalized === 'REVIEW'
      ? 'SUBMITTED'
      : (normalized === 'TO_DO' ? 'IN_PROGRESS' : normalized)
    changeTaskStatus(task, mapped)
  }

  const handleUpdateProjectStatus = (projectId, newStatus) => {
    if (isReadOnly) return
    updateProjectMutation.mutate({ id: projectId, updates: { status: newStatus } })
  }

  // Attention band -- pure presentation derivation from real task data
  const band = useMemo(() => {
    const now = new Date().setHours(0, 0, 0, 0)
    const overdue = teamTasks.filter(t => t.status !== 'Done' && !t.archived && t.dueDate && new Date(t.dueDate).setHours(0, 0, 0, 0) < now)
    const dueSoon = teamTasks.filter(t => {
      if (t.status === 'Done' || t.archived || !t.dueDate) return false
      const d = new Date(t.dueDate).setHours(0, 0, 0, 0)
      return d >= now && d - now <= 7 * 86400000
    })
    const inProgress = teamTasks.filter(t => t.status !== 'Done' && !t.archived)
    return { overdue: overdue.length, dueSoon: dueSoon.length, inProgress: inProgress.length, completionRate: insights.completionRate }
  }, [teamTasks, insights])

  const gotoWork = useCallback((view, filter) => {
    setActiveTab('work')
    setWorkView(view)
    setTaskFilter(filter)
  }, [])

  const isLoading = teamLoading || tasksLoading || projectsLoading
  const pageState = isLoading
    ? 'loading'
    : teamError || !team
      ? 'error'
      : !isAuthorized
        ? 'unauthorized'
        : 'ready'

  const tabCounts = {
    work: teamTasks.length,
    people: team?.members?.length || 0,
    discussion: messages.length,
  }

  const hue = hashHue(team?.name || 'team')

  return (
    <PageShell maxWidth="full" className="!px-0 !py-0">
      <PageState
        state={pageState}
        stateProps={{skeleton: <TeamDetailSkeleton />, 
          loadingVariant: 'cards',
          onRetry: () => navigate(0),
          error: {
            title: 'Team Not Found',
            description: 'This team may have been removed.',
          },
          unauthorized: {
            title: 'Access Denied',
            description: 'You are not a member of this team.',
          },
        }}
      >
        {team && (
          <div className="flex flex-col h-full">
            {/* ---------- Header: identity + actions ---------- */}
            <div className="bg-[var(--bg-base)] border-b border-[var(--border-subtle)]">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-3 py-3.5">
                  <button
                    onClick={() => navigate('/app/teams')}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                    title="Back to Teams"
                  >
                    <Icons.chevronLeft className="w-4 h-4" />
                  </button>

                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white shrink-0 border border-white/10"
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 35) % 360} 68% 38%))` }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <Heading level={3} className="font-semibold truncate mb-0 text-[15px]">
                      {team.name}
                    </Heading>
                    {isReadOnly && (
                      <Badge variant="outline" className="bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 text-[9px] uppercase tracking-wider font-mono shrink-0">
                        Observer
                      </Badge>
                    )}
                    {team.description && (
                      <Text variant="muted" size="sm" className="line-clamp-1 ml-1 hidden lg:inline">
                        {team.description}
                      </Text>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAuthorized && !isReadOnly && (
                      <Button variant="primary" size="sm" onClick={() => setIsNewTaskOpen(true)} className="gap-1 text-[11px] h-7 shadow-sm">
                        <Plus className="w-3 h-3" /> New Task
                      </Button>
                    )}
                    {canCreateProject && !isReadOnly && (
                      <Button variant="outline" size="sm" onClick={() => setIsCreateProjectOpen(true)} className="gap-1 text-[11px] h-7">
                        <Plus className="w-3 h-3" /> New Project
                      </Button>
                    )}
                    {canManage && (
                      <Button variant="ghost" size="sm" onClick={() => setIsManageMembersOpen(true)} className="gap-1 text-[11px] h-7">
                        <Settings2 className="w-3 h-3" /> Manage
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
              {/* ---------- Attention band: triage first ---------- */}
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <button
                  onClick={() => gotoWork('tasks', 'overdue')}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger)]/5 px-3.5 py-3 hover:bg-[var(--danger)]/10 transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--danger)]/10 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-4 h-4 text-[var(--danger)]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold leading-none tabular-nums">{band.overdue}</p>
                    <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Overdue</p>
                  </div>
                </button>
                <button
                  onClick={() => gotoWork('tasks', 'due')}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--warning)]/25 bg-[var(--warning)]/5 px-3.5 py-3 hover:bg-[var(--warning)]/10 transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--warning)]/10 flex items-center justify-center shrink-0">
                    <CalendarClock className="w-4 h-4 text-[var(--warning)]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold leading-none tabular-nums">{band.dueSoon}</p>
                    <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">Due soon</p>
                  </div>
                </button>
                <button
                  onClick={() => gotoWork('tasks', 'active')}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--accent-border)]/60 bg-[var(--accent-soft)]/40 px-3.5 py-3 hover:bg-[var(--accent-soft)] transition-colors cursor-pointer text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                    <ListTodo className="w-4 h-4 text-[var(--accent)]" strokeWidth={2} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[17px] font-bold leading-none tabular-nums">{band.inProgress}</p>
                    <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">In progress</p>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('insights')}
                  className="flex items-center gap-3 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] px-3.5 py-3 hover:border-[var(--accent-border)] transition-colors cursor-pointer text-left"
                >
                  <ProgressRing value={band.completionRate} size={38} strokeWidth={3.5}>
                    <span className="text-[10.5px] font-bold tabular-nums">{band.completionRate}%</span>
                  </ProgressRing>
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold leading-none">Completion</p>
                    <p className="text-[10.5px] font-semibold text-[var(--text-muted)] mt-1">
                      {band.completionRate >= 65 ? 'On track' : band.completionRate >= 35 ? 'At risk' : 'Behind'}
                    </p>
                  </div>
                </button>
              </div>

              {/* ---------- Tabs ---------- */}
              <div className="mt-5">
                <TeamTabs activeTab={activeTab} onChange={setActiveTab} counts={tabCounts} />
              </div>

              {/* Work segment: Tasks | Projects (always switchable) */}
              {activeTab === 'work' && (
                <div className="mt-4">
                  <PillNav
                    variant="segmented"
                    items={[{ value: 'tasks', label: 'Tasks' }, { value: 'projects', label: 'Projects' }]}
                    value={workView}
                    onChange={setWorkView}
                  />
                </div>
              )}

              {/* ---------- Content ---------- */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={activeTab}
                  initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: 'easeOut' }}
                >
                  {activeTab === 'overview' && (
                    <OverviewTab
                      key="overview"
                      team={team}
                      insights={insights}
                      teamTasks={teamTasks}
                      teamProjects={teamProjects}
                      members={team.members || []}
                      activityFeed={activityFeed}
                      observerCount={team.observers?.length || 0}
                      canManage={canManage}
                      isReadOnly={isReadOnly}
                      onManageMembers={() => setIsManageMembersOpen(true)}
                      onCreateProject={() => setIsCreateProjectOpen(true)}
                      onOpenTasks={() => gotoWork('tasks', 'all')}
                      onOpenProjects={() => gotoWork('projects', 'all')}
                    />
                  )}
                  {activeTab === 'work' && workView === 'tasks' && (
                    <TasksTab
                      key="tasks"
                      team={team}
                      teamTasks={teamTasks}
                      taskBoard={taskBoard}
                      filter={taskFilter}
                      onFilterChange={setTaskFilter}
                      canAssignTask={canAssignTask}
                      canEditTask={canEditTask}
                      canDeleteTask={canDeleteTask}
                      canReviewTask={canReviewTask}
                      onOpenTask={(task) => navigate(`/app/tasks/${task.id || task.taskId}`, { state: { task } })}
                      isReadOnly={isReadOnly}
                      assigningTaskId={assigningTaskId}
                      setAssigningTaskId={setAssigningTaskId}
                      handleAssignTask={handleAssignTask}
                      onUpdateTaskStatus={handleUpdateTaskStatus}
                      onViewProjects={() => setWorkView('projects')}
                    />
                  )}
                  {activeTab === 'work' && workView === 'projects' && (
                    <ProjectsTab
                      key="projects"
                      teamProjects={teamProjects}
                      members={team.members || []}
                      hasProjectIdOnTasks={hasProjectIdOnTasks}
                      tasksForProject={tasksForProject}
                      canCreateProject={canCreateProject}
                      isReadOnly={isReadOnly}
                      onCreateProject={() => setIsCreateProjectOpen(true)}
                      onStatusChange={handleUpdateProjectStatus}
                    />
                  )}
                  {activeTab === 'whiteboards' && (
                    <WhiteboardsTab
                      key="whiteboards"
                      team={{ orgId: Number(orgId), teamId: Number(teamId) }}
                      isCreator={canManage}
                    />
                  )}
                  {activeTab === 'people' && (
                    <MembersTab
                      key="members"
                      team={team}
                      workload={workload}
                      teamTasks={teamTasks}
                      hasProjectIdOnTasks={hasProjectIdOnTasks}
                      hasTaskTimestamps={hasTaskTimestamps}
                      canManage={canManage}
                      user={user}
                      onManageMembers={() => setIsManageMembersOpen(true)}
                    />
                  )}
                  {activeTab === 'discussion' && (
                    <DiscussionTab
                      key="discussion"
                      teamId={teamId}
                      messages={messages}
                      messagesLoading={messagesLoading}
                      user={user}
                      canManage={canManage}
                      isReadOnly={isReadOnly}
                      onSend={handleSendMessage}
                      onDelete={handleDeleteMessage}
                    />
                  )}
                  {activeTab === 'insights' && (
                    <InsightsTab
                      key="insights"
                      teamTasks={teamTasks}
                      teamProjects={teamProjects}
                      insights={insights}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* ---------- Modals ---------- */}
        <Modal open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
          <ModalContent className="sm:max-w-xl">
            <Heading level={3} className="mb-5 text-[15px] font-semibold">
              New Team Task
            </Heading>
            <TaskForm
              defaultValues={{ teamId: Number(teamId), organizationId: Number(orgId) }}
              onSubmit={handleCreateTaskSubmit}
              isLoading={createTaskMutation.isPending}
            />
          </ModalContent>
        </Modal>

        <Modal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
          <ModalContent className="sm:max-w-xl">
            <Heading level={3} className="mb-5 text-[15px] font-semibold">
              Create Team Project
            </Heading>
            <ProjectForm
              defaultValues={{
                name: '',
                description: '',
                organizationId: orgId,
                teamId: teamId,
                dueDate: '',
              }}
              onSubmit={handleCreateProjectSubmit}
              isLoading={createProjectMutation.isPending}
              workspaceMode="ORG"
              useOrgTeamsHook={useOrgTeams}
            />
          </ModalContent>
        </Modal>

        <ManageTeamMembersModal
          isOpen={isManageMembersOpen}
          onClose={() => setIsManageMembersOpen(false)}
          team={team}
          orgMembers={orgMembers}
        />
        {confirmDialog}
      </PageState>

      {/* Mobile FAB -- new task (demo parity) */}
      {isAuthorized && !isReadOnly && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          onClick={() => setIsNewTaskOpen(true)}
          className="sm:hidden fixed bottom-5 right-5 z-40 w-12 h-12 rounded-2xl bg-[var(--accent)] text-white shadow-[var(--shadow-lg)] flex items-center justify-center cursor-pointer"
          title="New task"
          aria-label="New task"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      )}
    </PageShell>
  )
}

function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

export default TeamDetailPage

function TeamDetailSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-8 h-8 rounded-lg" />
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-1.5 flex-1 min-w-0"><Skeleton className="h-4 w-44" /><Skeleton className="h-3 w-56" /></div>
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
      <div className="flex items-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-7 w-20 rounded-lg" />)}
      </div>
      <Skeleton className="h-[340px] w-full rounded-2xl" />
    </div>
  );
}

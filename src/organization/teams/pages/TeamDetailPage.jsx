import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { useTeam, useTeamMessages, useSendTeamMessage, useDeleteTeamMessage, useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { useTaskList, useReassignTask } from '@/task'
import { useProjects, useCreateProject } from '@/project'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProjectForm } from '@/project'
import { useAuth, usePermissions } from '@/identity'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'
import { TeamTabs } from '../components/TeamTabs'
import { OverviewTab } from '../components/OverviewTab'
import { ProjectsTab } from '../components/ProjectsTab'
import { TasksTab } from '../components/TasksTab'
import { MembersTab } from '../components/MembersTab'
import { DiscussionTab } from '../components/DiscussionTab'
import { InsightsTab } from '../components/InsightsTab'
import { PageShell } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { cn } from '@/shared/lib/cn'
import { toast } from 'sonner'
import { normalizePriority } from '@/shared/lib/priority'
import { SPRINGS } from '@/shared/lib/uxTokens'

const INACTIVE_STATUSES = new Set(['completed', 'done', 'archived', 'cancelled', 'closed'])
const isActiveStatus = (status) => !INACTIVE_STATUSES.has((status || '').toLowerCase())
const isHighPriority = (priority) => ['High', 'Urgent'].includes(normalizePriority(priority))

/* ── Activity Feed Item ── */
function ActivityItem({ type, user, action, target, time, hue }) {
  const iconMap = {
    project_created: Icons.folderPlus,
    task_completed: Icons.checkCircle2,
    task_assigned: Icons.userPlus,
    message_sent: Icons.messageSquare,
    member_joined: Icons.userPlus,
    team_updated: Icons.settings,
  }
  const Icon = iconMap[type] || Icons.activity

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-2.5 py-2.5 px-3 rounded-lg hover:bg-[var(--bg-hover)]/50 transition-colors"
    >
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `linear-gradient(135deg, hsl(${hue} 70% 60% / 0.15), hsl(${hue} 70% 60% / 0.05))` }}
      >
        <Icon className="w-3.5 h-3.5 text-[var(--accent)]" />
      </div>
      <div className="min-w-0 flex-1">
        <Text size="xs" className="text-[var(--text-primary)] leading-snug">
          <span className="font-semibold">{user}</span>{' '}
          <span className="text-[var(--text-secondary)]">{action}</span>{' '}
          {target && <span className="font-medium text-[var(--accent)]">{target}</span>}
        </Text>
        <Text size="xs" className="text-[var(--text-muted)]">{time}</Text>
      </div>
    </motion.div>
  )
}

/* ── Quick Jump FAB ── */
function QuickJumpFab({ visible }) {
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 16 }}
          transition={SPRINGS.fast}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-lg shadow-black/5 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent-border)] hover:shadow-xl transition-all duration-200"
          title="Scroll to top"
        >
          <Icons.chevronUp className="w-5 h-5" />
        </motion.button>
      )}
    </AnimatePresence>
  )
}

/* ═══════════════════════════════════════════════
   TeamDetailPage - Team HQ
   ═══════════════════════════════════════════════ */
export function TeamDetailPage() {
  const { orgId, teamId } = useParams()
  const { confirm, dialog: confirmDialog } = useConfirmDialog()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { canManageTeam, canCreateProject, canAssignTask } = usePermissions()
  const canManage = canManageTeam

  const [activeTab, setActiveTab] = useState('overview')
  const [assigningTaskId, setAssigningTaskId] = useState(null)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [isManageMembersOpen, setIsManageMembersOpen] = useState(false)
  const [isHeaderSticky, setIsHeaderSticky] = useState(false)
  const [showSidebar, setShowSidebar] = useState(true)
  const [showFab, setShowFab] = useState(false)
  const headerRef = useRef(null)
  const sentinelRef = useRef(null)
  const contentRef = useRef(null)

  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamId)
  const { data: messages = [], isLoading: messagesLoading } = useTeamMessages(teamId)
  const sendMessageMutation = useSendTeamMessage(teamId)
  const deleteMessageMutation = useDeleteTeamMessage(teamId)

  const { data: allTasks = [], isLoading: tasksLoading } = useTaskList({ teamId: Number(teamId) })
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects()
  const createProjectMutation = useCreateProject()
  const reassignTaskMutation = useReassignTask()
  const { data: orgMembers = [] } = useOrgMembers(orgId)

  // Sticky header observer
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      ([entry]) => setIsHeaderSticky(!entry.isIntersecting),
      { threshold: 1.0 },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [])

  // Scroll listener for FAB visibility
  useEffect(() => {
    const onScroll = () => {
      setShowFab(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleCreateProjectSubmit = (data) => {
    createProjectMutation.mutate(
      { ...data, teamId: Number(teamId), organizationId: Number(orgId) },
      { onSuccess: () => { setIsCreateProjectOpen(false); toast.success('Team project created') } },
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

  const isLoading = teamLoading || tasksLoading || projectsLoading
  const pageState = isLoading
    ? 'loading'
    : teamError || !team
      ? 'error'
      : !isAuthorized
        ? 'unauthorized'
        : 'ready'

  const tabCounts = {
    projects: teamProjects.length,
    tasks: teamTasks.length,
    members: team?.members?.length || 0,
    chat: messages.length,
  }

  const hue = hashHue(team?.name || 'team')
  return (
    <PageShell maxWidth="full" className="!px-0 !py-0">
      <PageState
        state={pageState}
        stateProps={{
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
            {/* Sentinel for sticky detection */}
            <div ref={sentinelRef} className="h-px" />

            {/* ═══ Sticky Header — identity + actions only (stats live in Overview) ═══ */}
            <div
              ref={headerRef}
              className={cn(
                'sticky top-0 z-30 transition-shadow duration-200',
                isHeaderSticky
                  ? 'bg-[var(--bg-base)] border-b border-[var(--border-subtle)] shadow-sm'
                  : 'bg-[var(--bg-base)]',
              )}
            >
              <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
                <div
                  className={cn(
                    'flex items-center gap-3 transition-all duration-200',
                    isHeaderSticky ? 'py-2' : 'py-3',
                  )}
                >
                  {/* Back */}
                  <button
                    onClick={() => navigate(`/app/organizations/${orgId}`)}
                    className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors shrink-0"
                    title="Back to organization"
                  >
                    <Icons.chevronLeft className="w-4 h-4" />
                  </button>

                  {/* Avatar */}
                  <div
                    className={cn(
                      'rounded-lg flex items-center justify-center font-bold text-white shrink-0 border border-white/10 transition-all',
                      isHeaderSticky ? 'w-7 h-7 text-[10px]' : 'w-8 h-8 text-xs',
                    )}
                    style={{ background: `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${(hue + 35) % 360} 68% 38%))` }}
                  >
                    {team.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Name + badge */}
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Heading level={3} className={cn('font-semibold truncate mb-0 transition-all', isHeaderSticky ? 'text-[13px]' : 'text-[14px]')}>
                      {team.name}
                    </Heading>
                    {isReadOnly && (
                      <Badge variant="outline" className="bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20 text-[9px] uppercase shrink-0">Observer</Badge>
                    )}
                    {!isHeaderSticky && team.description && (
                      <Text variant="muted" size="xs" className="line-clamp-1 ml-1 hidden sm:inline">{team.description}</Text>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {canCreateProject && !isReadOnly && (
                      <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)} className="gap-1 text-[11px] h-7 shadow-sm">
                        <Icons.plus className="w-3 h-3" /> New Project
                      </Button>
                    )}
                    {canManage && (
                      <Button variant="outline" size="sm" onClick={() => setIsManageMembersOpen(true)} className="gap-1 text-[11px] h-7">
                        <Icons.settings className="w-3 h-3" /> Settings
                      </Button>
                    )}
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className={cn('gap-1 text-[11px] h-7 px-2', showSidebar && 'text-[var(--accent)] bg-[var(--accent-soft)]')}
                      title="Activity feed"
                    >
                      <Icons.activity className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Tabs ═══ */}
            <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
              <TeamTabs activeTab={activeTab} setActiveTab={setActiveTab} tabCounts={tabCounts} />
            </div>

            {/* ═══ Content Area (with optional sidebar) ═══ */}
            <div className="flex-1 min-h-0 max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 pb-12">
              <div className="flex gap-0">
                {/* Main Content */}
                <div
                  ref={contentRef}
                  className={cn(
                    'flex-1 min-w-0 transition-all duration-300',
                    showSidebar ? 'mr-0' : 'mr-0',
                  )}
                >
                  <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                      <OverviewTab
                        key="overview"
                        team={team}
                        insights={insights}
                        teamTasks={teamTasks}
                        teamProjects={teamProjects}
                        observerCount={team.observers?.length || 0}
                        hasTaskTimestamps={hasTaskTimestamps}
                        canCreateProject={canCreateProject}
                        canAssignTask={canAssignTask}
                        canManage={canManage}
                        isReadOnly={isReadOnly}
                        onManageMembers={() => setIsManageMembersOpen(true)}
                        onCreateProject={() => setIsCreateProjectOpen(true)}
                        onAssignTask={() => setActiveTab('tasks')}
                        onOpenChat={() => setActiveTab('chat')}
                        onOpenTasks={() => setActiveTab('tasks')}
                        setActiveTab={setActiveTab}
                      />
                    )}
                    {activeTab === 'chat' && (
                      <DiscussionTab
                        key="chat"
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
                    {activeTab === 'projects' && (
                      <ProjectsTab
                        key="projects"
                        teamProjects={teamProjects}
                        hasProjectIdOnTasks={hasProjectIdOnTasks}
                        tasksForProject={tasksForProject}
                        canCreateProject={canCreateProject}
                        isReadOnly={isReadOnly}
                        onCreateProject={() => setIsCreateProjectOpen(true)}
                      />
                    )}
                    {activeTab === 'tasks' && (
                      <TasksTab
                        key="tasks"
                        teamTasks={teamTasks}
                        taskBoard={taskBoard}
                        team={team}
                        canAssignTask={canAssignTask}
                        isReadOnly={isReadOnly}
                        assigningTaskId={assigningTaskId}
                        setAssigningTaskId={setAssigningTaskId}
                        handleAssignTask={handleAssignTask}
                      />
                    )}
                    {activeTab === 'members' && (
                      <MembersTab
                        key="members"
                        team={team}
                        workload={workload}
                        teamTasks={teamTasks}
                        hasProjectIdOnTasks={hasProjectIdOnTasks}
                        hasTaskTimestamps={hasTaskTimestamps}
                        canManage={canManage}
                        onManageMembers={() => setIsManageMembersOpen(true)}
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
                  </AnimatePresence>
                </div>

                {/* ═══ Sidebar: Activity Feed ═══ */}
                <AnimatePresence>
                  {showSidebar && (
                    <motion.aside
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden shrink-0 border-l border-[var(--border-subtle)]"
                    >
                      <div className="w-[280px] pl-5 pr-3 pt-3 h-full max-h-[calc(100vh-200px)] overflow-y-auto scrollbar-thin">
                        <div className="flex items-center justify-between mb-3 sticky top-0 bg-[var(--bg-base)] z-10 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Icons.activity className="w-4 h-4 text-[var(--accent)]" />
                            <Heading level={4} className="text-[12px] font-semibold tracking-tight mb-0">
                              Activity Feed
                            </Heading>
                          </div>
                          <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                            {activityFeed.length}
                          </Badge>
                        </div>

                        {activityFeed.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Icons.activity className="w-8 h-8 text-[var(--text-muted)] mb-3 opacity-40" />
                            <Text size="xs" className="text-[var(--text-muted)]">
                              No recent activity
                            </Text>
                            <Text size="xs" className="text-[var(--text-muted)] mt-0.5">
                              Actions will appear here
                            </Text>
                          </div>
                        ) : (
                          <div className="divide-y divide-[var(--border-subtle)]">
                            {activityFeed.map((item, i) => (
                              <ActivityItem
                                key={`${item.type}-${i}`}
                                type={item.type}
                                user={item.user}
                                action={item.action}
                                target={item.target}
                                time={item.time}
                                hue={(hue + i * 20) % 360}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.aside>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}

        {/* ═══ Modals ═══ */}
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

      {/* ═══ Quick Jump FAB ═══ */}
      <QuickJumpFab visible={showFab} />
    </PageShell>
  )
}

/* ── Re-export hashHue for TeamHeader compatibility ── */
function hashHue(str = '') {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash)
  return Math.abs(hash) % 360
}

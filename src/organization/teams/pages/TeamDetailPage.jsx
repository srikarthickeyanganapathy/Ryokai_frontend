import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useTeam, useTeamMessages, useSendTeamMessage, useDeleteTeamMessage, useOrgTeams, useOrgMembers } from '../../features/hooks/useOrganizations'
import { useTaskList, useReassignTask } from '@/task'
import { useProjects, useCreateProject } from '@/project'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProjectForm } from '@/project'
import { useAuth } from '@/identity'
import { usePermissions } from '@/identity'
import { toast } from 'sonner'
import { normalizePriority } from '@/shared/lib/priority'
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog/ConfirmDialog'
import { ManageTeamMembersModal } from '../modals/ManageTeamMembersModal'

import { TeamHeader } from '../components/TeamHeader'
import { TeamTabs } from '../components/TeamTabs'
import { OverviewTab } from '../components/OverviewTab'
import { ProjectsTab } from '../components/ProjectsTab'
import { TasksTab } from '../components/TasksTab'
import { MembersTab } from '../components/MembersTab'
import { DiscussionTab } from '../components/DiscussionTab'
import { InsightsTab } from '../components/InsightsTab'

const INACTIVE_STATUSES = new Set(['completed', 'done', 'archived', 'cancelled', 'closed'])
const isActiveStatus = (status) => !INACTIVE_STATUSES.has((status || '').toLowerCase())
const isHighPriority = (priority) => ['High', 'Urgent'].includes(normalizePriority(priority))

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

  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamId)
  const { data: messages = [], isLoading: messagesLoading } = useTeamMessages(teamId)
  const sendMessageMutation = useSendTeamMessage(teamId)
  const deleteMessageMutation = useDeleteTeamMessage(teamId)

  const { data: allTasks = [], isLoading: tasksLoading } = useTaskList({ scope: 'org' })
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects()
  const createProjectMutation = useCreateProject()
  const reassignTaskMutation = useReassignTask()
  const { data: orgMembers = [] } = useOrgMembers(orgId)

  const handleCreateProjectSubmit = (data) => {
    createProjectMutation.mutate({ ...data, teamId: Number(teamId), organizationId: Number(orgId) }, { onSuccess: () => { setIsCreateProjectOpen(false); toast.success('Team project created successfully') } })
  }

  const isMember = useMemo(() => { if (!team || !user) return false; return team.members?.some(m => m.username === user.username) }, [team, user])
  const isObserver = useMemo(() => { if (!team || !user) return false; return team.observers?.some(o => o.username === user.username) }, [team, user])
  const isAuthorized = canManage || isMember || isObserver
  const isReadOnly = isObserver && !canManage

  const teamTasks = useMemo(() => allTasks.filter(t => t.teamId === Number(teamId)), [allTasks, teamId])
  const teamProjects = useMemo(() => allProjects.filter(p => p.teamId === Number(teamId)), [allProjects, teamId])

  const workload = useMemo(() => {
    const counts = {}
    team?.members?.forEach(m => { counts[m.username] = 0 })
    teamTasks.forEach(t => { if (t.assignedTo && t.status !== 'Done' && !t.archived) counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1 })
    return counts
  }, [team, teamTasks])

  const observerCount = team?.observers?.length || 0
  const hasProjectIdOnTasks = useMemo(() => teamTasks.some(t => t.projectId != null), [teamTasks])
  const hasLeadOnProjects = useMemo(() => teamProjects.some(p => p.teamLeadId != null || p.leadId != null || p.ownerId != null), [teamProjects])
  const hasTaskTimestamps = useMemo(() => teamTasks.some(t => t.updatedAt || t.createdAt || t.completedAt), [teamTasks])

  const tasksForProject = (projectId) => hasProjectIdOnTasks ? teamTasks.filter(t => t.projectId === projectId) : []

  const insights = useMemo(() => {
    const activeTasks = teamTasks.filter(t => !t.archived && t.status !== 'Done')
    const doneTasks = teamTasks.filter(t => t.status === 'Done')
    const unassignedTasks = activeTasks.filter(t => !t.assignedTo)
    const highPriorityTasks = activeTasks.filter(t => isHighPriority(t.priority))
    const total = teamTasks.length
    const completionRate = total > 0 ? Math.round((doneTasks.length / total) * 100) : 0
    const completedThisWeek = hasTaskTimestamps ? doneTasks.filter(t => { const ts = t.completedAt || t.updatedAt || t.createdAt; const d = new Date(ts); return !Number.isNaN(d.getTime()) && (Date.now() - d.getTime()) <= 7 * 24 * 60 * 60 * 1000 }).length : 0
    const activeProjects = teamProjects.filter(p => isActiveStatus(p.status))
    const projectsWithoutLead = hasLeadOnProjects ? teamProjects.filter(p => !p.teamLeadId && !p.leadId && !p.ownerId) : []
    const idleMembers = Object.entries(workload).filter(([, count]) => count === 0)
    const workloadValues = Object.values(workload)
    const maxWorkload = workloadValues.length ? Math.max(...workloadValues) : 0
    const minWorkload = workloadValues.length ? Math.min(...workloadValues) : 0
    const balanceScore = maxWorkload > 0 ? Math.round(100 - ((maxWorkload - minWorkload) / maxWorkload) * 60) : 100
    const busiestEntry = Object.entries(workload).sort((a, b) => b[1] - a[1])[0]
    const busiestMember = busiestEntry && busiestEntry[1] > 0 ? busiestEntry[0] : null
    let largestProject = null
    if (hasProjectIdOnTasks && teamProjects.length > 0) {
      largestProject = [...teamProjects].sort((a, b) => tasksForProject(b.id).length - tasksForProject(a.id).length)[0]
      if (tasksForProject(largestProject?.id).length === 0) largestProject = null
    }
    const highestPriorityLabel = highPriorityTasks.some(t => normalizePriority(t.priority) === 'Urgent') ? 'Urgent' : highPriorityTasks.length > 0 ? 'High' : null
    const needsAttention = [
      { key: 'unassigned', label: 'Unassigned Tasks', count: unassignedTasks.length },
      { key: 'priority', label: 'High Priority Tasks', count: highPriorityTasks.length },
      { key: 'idle', label: 'Members With No Active Tasks', count: idleMembers.length },
      ...(hasLeadOnProjects ? [{ key: 'lead', label: `Project${projectsWithoutLead.length === 1 ? '' : 's'} Without a Team Lead`, count: projectsWithoutLead.length }] : []),
    ].filter(item => item.count > 0)
    return { total, doneCount: doneTasks.length, activeCount: activeTasks.length, completionRate, completedThisWeek, unassignedCount: unassignedTasks.length, highPriorityCount: highPriorityTasks.length, activeProjectsCount: activeProjects.length, idleMembersCount: idleMembers.length, balanceScore, busiestMember, largestProject, highestPriorityLabel, needsAttention, recentMessages: [...messages].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 4) }
  }, [teamTasks, teamProjects, workload, messages, hasTaskTimestamps, hasLeadOnProjects, hasProjectIdOnTasks])

  const taskBoard = useMemo(() => {
    const unassigned = [], inProgress = [], review = [], completed = []
    teamTasks.forEach(t => {
      if (t.status === 'Done') completed.push(t)
      else if (!t.assignedTo) unassigned.push(t)
      else if ((t.status || '').toLowerCase().includes('review')) review.push(t)
      else inProgress.push(t)
    })
    return { unassigned, inProgress, review, completed }
  }, [teamTasks])

  const handleSendMessage = (content) => sendMessageMutation.mutate(content)
  const handleDeleteMessage = async (messageId) => { if (await confirm({ title: 'Are you sure you want to delete this message?', danger: true })) deleteMessageMutation.mutate(messageId) }
  const handleAssignTask = (taskId, memberId, memberUsername) => { reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, { onSuccess: () => { toast.success(`Task assigned to ${memberUsername}`); setAssigningTaskId(null) } }) }

  if (teamLoading || tasksLoading || projectsLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6 max-w-6xl mx-auto">
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-10 w-full max-w-md rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /><Skeleton className="h-40 rounded-xl" /></div>
        {confirmDialog}
      </div>
    )
  }

  if (teamError || !team) {
    return (
      <div className="text-center py-16 m-6 border border-dashed border-[var(--border-subtle)] rounded-xl">
        <Icons.alert className="w-8 h-8 text-[var(--danger)] mx-auto mb-4" />
        <Heading level={3} className="text-[15px] font-semibold mb-2 tracking-tight">Team Not Found</Heading>
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/organizations/${orgId}`)}>Back to Organization</Button>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center m-6 border border-dashed border-[var(--border-subtle)] rounded-xl">
        <Icons.alert className="w-8 h-8 text-[var(--danger)] mb-4 animate-pulse" />
        <Heading level={3} className="text-[16px] font-semibold mb-2 tracking-tight">Access Denied</Heading>
        <Text variant="muted" className="max-w-sm mb-6 text-[13px]">You are not a member of this team, and do not have organization manager permissions to view this portal.</Text>
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/organizations/${orgId}`)}>Back to Organization</Button>
      </div>
    )
  }

  const tabCounts = { projects: teamProjects.length, tasks: teamTasks.length, members: team.members?.length || 0, chat: messages.length }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] relative">
      <div className="p-4 sm:p-6 max-w-[1400px] mx-auto w-full">
        <TeamHeader
          team={team}
          orgId={orgId}
          insights={insights}
          teamProjects={teamProjects}
          teamTasks={teamTasks}
          isReadOnly={isReadOnly}
          canManage={canManage}
          canCreateProject={canCreateProject}
          onManageMembers={() => setIsManageMembersOpen(true)}
          onCreateProject={() => setIsCreateProjectOpen(true)}
          onOpenChat={() => setActiveTab('chat')}
        />
      </div>

      <TeamTabs activeTab={activeTab} setActiveTab={setActiveTab} tabCounts={tabCounts} />

      <div className="flex-1 min-h-0 relative">
        {activeTab === 'overview' && (
          <OverviewTab
            team={team}
            insights={insights}
            teamTasks={teamTasks}
            teamProjects={teamProjects}
            observerCount={observerCount}
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
            teamTasks={teamTasks}
            teamProjects={teamProjects}
            insights={insights}
          />
        )}
      </div>

      <Modal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-5 text-[15px] font-semibold tracking-tight">Create Team Project</Heading>
          <ProjectForm 
            defaultValues={{ 
              name: '', 
              description: '', 
              organizationId: orgId, 
              teamId: teamId, 
              dueDate: '' 
            }} 
            onSubmit={handleCreateProjectSubmit} 
            isLoading={createProjectMutation.isPending} 
            workspaceMode="ORG" 
            useOrgTeamsHook={useOrgTeams} 
          />
        </ModalContent>
      </Modal>

      <ManageTeamMembersModal isOpen={isManageMembersOpen} onClose={() => setIsManageMembersOpen(false)} team={team} orgMembers={orgMembers} />
      {confirmDialog}
    </div>
  )
}
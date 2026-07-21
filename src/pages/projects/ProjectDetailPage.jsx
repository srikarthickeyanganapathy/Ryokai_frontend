import React, { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { useProject, useUpdateProject, useDeleteProject, useUnshareProjectFromCrew } from '@/features/projects/hooks/useProjects'
import { useTeam, useOrgMembers } from '@/features/organizations/hooks/useOrganizations'
import { useCrewMembers, useCrews } from '@/features/crews/hooks/useCrews'
import { ProjectForm } from '@/widgets/projects/ProjectForm'
import { CrewProjectShareModal } from '@/widgets/projects/CrewProjectShareModal'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'
import { useTaskList, useCreateTask, useReassignTask } from '@/features/tasks/hooks/useTasks'
import { TaskForm } from '@/widgets/tasks/TaskForm'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

import { normalizeStatus, PROJECT_STATUS_COLORS } from '@/shared/lib/status'

const defaultStatusColor = 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]'



import { usePermissions } from '@/shared/hooks/usePermissions'

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { workspaceMode } = useWorkspace()
  const { canManageProject, canAssignTask } = usePermissions()
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [assigningTaskId, setAssigningTaskId] = useState(null)

  // Fetch Project details
  const { data: project, isLoading: projectLoading, isError: projectError } = useProject(Number(projectId))

  // Fetch Team & Org members dynamically to enable the custom assignment dropdown
  const { data: team } = useTeam(project?.teamId)
  const { data: orgMembers = [] } = useOrgMembers(project?.organizationId)

  // Fetch Project Tasks
  const { data: projectTasks = [], isLoading: tasksLoading } = useTaskList({ projectId: Number(projectId) })
  const createTaskMutation = useCreateTask()
  const reassignTaskMutation = useReassignTask()

  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()
  const unshareMutation = useUnshareProjectFromCrew()
  const { data: userCrews = [] } = useCrews()

  // Fetch Crew members if shared
  const crewId = project?.sharedCrewIds && project.sharedCrewIds.length > 0 ? project.sharedCrewIds[0] : null
  const { data: crewMembers = [] } = useCrewMembers(crewId)

  // Get assignable members (crew members if shared, team members if team is linked, otherwise org members)
  const assignableMembers = useMemo(() => {
    if (crewId && crewMembers && crewMembers.length > 0) {
      return crewMembers
    }
    if (project?.teamId && team) {
      return team.members || []
    }
    return orgMembers || []
  }, [project, team, orgMembers, crewId, crewMembers])

  const handleEditProject = (payload) => {
    updateProjectMutation.mutate({ id: Number(projectId), updates: payload }, {
      onSuccess: () => setIsEditModalOpen(false)
    })
  }

  const handleDeleteProject = () => {
    deleteProjectMutation.mutate(Number(projectId), {
      onSuccess: () => {
        setIsDeleteModalOpen(false)
        navigate('/app/projects')
      }
    })
  }

  const handleAddTaskSubmit = (payload) => {
    createTaskMutation.mutate({
      ...payload,
      projectId: Number(projectId),
      teamId: project?.teamId || null,
      organizationId: project?.organizationId || null,
      crewId: crewId || null,
    }, {
      onSuccess: () => {
        setIsAddTaskOpen(false)
      }
    })
  }

  const handleAssignTask = (taskId, memberId, memberUsername) => {
    reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, {
      onSuccess: () => {
        toast.success(`Task assigned to ${memberUsername}`)
        setAssigningTaskId(null)
      }
    })
  }

  if (projectLoading || tasksLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
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
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/app/projects"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Icons.chevronLeft className="w-5 h-5" />
            </Link>
            <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0">{project.name}</Heading>
            <Badge variant="outline" className={cn('text-xs uppercase', PROJECT_STATUS_COLORS[project.status] || defaultStatusColor)}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <Text variant="muted" className="mt-1 max-w-2xl text-[13px]">{project.description}</Text>
          )}
        </div>
        {canManageProject && (
          <div className="flex items-center gap-2">
            {workspaceMode === 'PERSONAL' && (
              <Button variant="outline" size="sm" onClick={() => setIsShareModalOpen(true)}>
                <Icons.users className="w-3.5 h-3.5 mr-1" />
                Share
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
            <Button variant="outline" size="sm" className="text-[var(--danger)] hover:text-[var(--danger)] hover:border-[var(--danger)] hover:bg-[var(--danger-soft)]" onClick={() => setIsDeleteModalOpen(true)}>Delete</Button>
          </div>
        )}
      </div>

      {/* Progress & Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border border-[var(--color-border-subtle)]">
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Progress</Text>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{project.progress}%</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-[var(--accent)]"
              />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-[var(--color-border-subtle)]">
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Total Tasks</Text>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{project.tasksTotal}</span>
          </CardContent>
        </Card>
        <Card className="border border-[var(--color-border-subtle)]">
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Completed</Text>
            <span className="text-2xl font-bold text-[var(--success)]">{project.tasksCompleted}</span>
          </CardContent>
        </Card>
        <Card className="border border-[var(--color-border-subtle)]">
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider font-semibold mb-1">Due Date</Text>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{formatDate(project.dueDate)}</span>
          </CardContent>
        </Card>
      </div>

      {/* 2-COLUMN PROJECT ROOM STAGE (70% Canvas / 30% Rail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Left Main Canvas (70% / 8 Cols) — Tasks & Backlog */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border border-[var(--color-border-subtle)]">
            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-[var(--color-border-subtle)]">
              <div>
                <CardTitle className="text-base font-semibold">Tasks & Deliverables</CardTitle>
                <Text variant="muted" size="sm" className="mt-0.5">Manage and assign task items specific to this project.</Text>
              </div>
              <Button size="sm" className="gap-1.5" onClick={() => setIsAddTaskOpen(true)}>
                <Icons.plus className="w-3.5 h-3.5" />
                Add Task
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {projectTasks.length === 0 ? (
                <div className="text-center py-12 text-[var(--text-tertiary)]">
                  No tasks inside this project. Click 'Add Task' to create one!
                </div>
              ) : (
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {projectTasks.map((task) => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        <div className="min-w-0">
                          <span className={cn("font-medium text-sm block truncate text-[var(--text-primary)]", task.status === 'Done' && "line-through text-[var(--text-secondary)]")}>
                            {task.title}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] mt-0.5 block">
                            Status: {task.status} | Assigned to: {task.assignedTo || 'Unassigned'}
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
                            <PopoverContent align="end" className="w-56 p-1 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] shadow-[var(--shadow-lg)]">
                              <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold tracking-wide border-b border-[var(--color-border-subtle)]">
                                {project.teamId ? 'Assign Team Member' : 'Assign Org Member'}
                              </Text>
                              <div className="space-y-0.5 max-h-48 overflow-y-auto mt-1 custom-scrollbar">
                                {assignableMembers.map(m => {
                                  const username = m.username || m.name
                                  const id = m.userId || m.id
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
                                  )
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
            </CardContent>
          </Card>
        </div>

        {/* Right Telemetry & Governance Rail (30% / 4 Cols) */}
        <div className="lg:col-span-4 space-y-6">

          {/* Shared Crews Governance */}
          <Card className="border border-[var(--color-border-subtle)]">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
              <div>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Icons.users className="w-4 h-4 text-[var(--accent)]" />
                  Shared Crews Access
                </CardTitle>
                <Text variant="muted" size="sm" className="mt-0.5">Crews with task access.</Text>
              </div>
              {workspaceMode === 'PERSONAL' && canManageProject && (
                <Button size="xs" variant="outline" onClick={() => setIsShareModalOpen(true)}>
                  Share
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-4 space-y-2">
              {(!project.sharedCrewIds || project.sharedCrewIds.length === 0) ? (
                <Text variant="muted" size="sm">Not shared with any crews yet.</Text>
              ) : (
                project.sharedCrewIds.map(sharedCrewId => {
                  const crewObj = userCrews.find(c => String(c.id) === String(sharedCrewId))
                  return (
                    <div key={sharedCrewId} className="flex items-center justify-between p-3 rounded-xl bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)]">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center font-bold text-xs shrink-0">
                          {crewObj?.name?.charAt(0).toUpperCase() || 'C'}
                        </div>
                        <div className="min-w-0">
                          <span className="font-semibold text-xs block truncate text-[var(--text-primary)]">{crewObj?.name || `Crew #${sharedCrewId}`}</span>
                          <span className="text-[11px] text-[var(--text-muted)]">Shared access</span>
                        </div>
                      </div>
                      {canManageProject && (
                        <Button
                          size="xs"
                          variant="outline"
                          className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20"
                          onClick={() => unshareMutation.mutate({ projectId: Number(projectId), crewId: sharedCrewId })}
                          isLoading={unshareMutation.isPending}
                        >
                          Unshare
                        </Button>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>

          {/* Project Details */}
          <Card className="border border-[var(--color-border-subtle)]">
            <CardHeader className="pb-2 border-b border-[var(--color-border-subtle)]">
              <CardTitle className="text-base font-semibold">Metadata & Scope</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              {project.organizationName && (
                <div className="flex items-center justify-between text-xs">
                  <Text variant="muted">Organization</Text>
                  <Text className="font-medium">{project.organizationName}</Text>
                </div>
              )}
              {project.teamName && (
                <div className="flex items-center justify-between text-xs">
                  <Text variant="muted">Team</Text>
                  <Text className="font-medium">{project.teamName}</Text>
                </div>
              )}
              <div className="flex items-center justify-between text-xs">
                <Text variant="muted">Created by</Text>
                <Text className="font-medium">{project.createdBy || 'System'}</Text>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Edit Project Modal */}
      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Edit Project</Heading>
          <ProjectForm
            defaultValues={{
              name: project.name,
              description: project.description || '',
              organizationId: project.organizationId || '',
              teamId: project.teamId ? project.teamId.toString() : 'none',
              dueDate: project.dueDate ? project.dueDate.slice(0, 16) : '',
            }}
            onSubmit={handleEditProject}
            isLoading={updateProjectMutation.isPending}
            workspaceMode={workspaceMode}
          />
        </ModalContent>
      </Modal>

      {/* Delete Project Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4 text-[var(--danger)]">Delete Project</Heading>
          <Text className="mb-6">
            Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone and will delete all associated tasks.
          </Text>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteProject} isLoading={deleteProjectMutation.isPending}>
              Yes, Delete
            </Button>
          </div>
        </ModalContent>
      </Modal>

      {/* Add Task Modal */}
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

      {/* Share Project Modal */}
      {project && (
        <CrewProjectShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          project={project}
        />
      )}

    </motion.div>
  )
}
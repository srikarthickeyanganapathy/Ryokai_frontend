import React, { useState, useMemo, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button, IconButton } from '@/shared/ui/Button'
import { Badge } from '@/shared/ui/Badge'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Icons } from '@/shared/ui/Icons'
import { useTeam, useTeamMessages, useSendTeamMessage, useDeleteTeamMessage } from '@/features/organizations/hooks/useOrganizations'
import { useTaskList, useReassignTask } from '@/features/tasks/hooks/useTasks'
import { useProjects, useCreateProject } from '@/features/projects/hooks/useProjects'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProjectForm } from '@/widgets/projects/ProjectForm'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { usePermissions } from '@/context/usePermissions'
import { toast } from 'sonner'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'

const priorityColors = {
  URGENT: 'bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20',
  HIGH: 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20',
  NORMAL: 'bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent)]/20',
  LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
  NONE: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]',
}

export function TeamDetailPage() {
  const { orgId, teamId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { canManageTeam, canCreateProject, canAssignTask } = usePermissions()
  const canManage = canManageTeam

  const [activeTab, setActiveTab] = useState('overview')
  const [messageInput, setMessageInput] = useState('')
  const [assigningTaskId, setAssigningTaskId] = useState(null)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  
  const messagesEndRef = useRef(null)

  // Fetch Team details
  const { data: team, isLoading: teamLoading, isError: teamError } = useTeam(teamId)

  // Fetch Team Messages (discussion feed with simple 5s polling)
  const { data: messages = [], isLoading: messagesLoading } = useTeamMessages(teamId)
  const sendMessageMutation = useSendTeamMessage(teamId)
  const deleteMessageMutation = useDeleteTeamMessage(teamId)

  // Fetch Tasks & Projects
  const { data: allTasks = [], isLoading: tasksLoading } = useTaskList({ scope: 'org' })
  const { data: allProjects = [], isLoading: projectsLoading } = useProjects()
  const createProjectMutation = useCreateProject()
  const reassignTaskMutation = useReassignTask()

  const handleCreateProjectSubmit = (data) => {
    createProjectMutation.mutate({
      ...data,
      teamId: Number(teamId),
      organizationId: Number(orgId),
    }, {
      onSuccess: () => {
        setIsCreateProjectOpen(false)
        toast.success('Team project created successfully')
      }
    })
  }

  // Authorization Guard
  const isMember = useMemo(() => {
    if (!team || !user) return false
    return team.members?.some(m => m.username === user.username)
  }, [team, user])

  const isAuthorized = canManage || isMember

  // Filter Tasks & Projects belonging to this team
  const teamTasks = useMemo(() => {
    return allTasks.filter(t => t.teamId === Number(teamId))
  }, [allTasks, teamId])

  const teamProjects = useMemo(() => {
    return allProjects.filter(p => p.teamId === Number(teamId))
  }, [allProjects, teamId])

  // Workload calculations per member (active tasks count)
  const workload = useMemo(() => {
    const counts = {}
    team?.members?.forEach(m => {
      counts[m.username] = 0
    })
    teamTasks.forEach(t => {
      if (t.assignedTo && t.status !== 'Done' && !t.archived) {
        counts[t.assignedTo] = (counts[t.assignedTo] || 0) + 1
      }
    })
    return counts
  }, [team, teamTasks])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (activeTab === 'chat') {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages?.length, activeTab])

  const handleSendMessage = (e) => {
    e.preventDefault()
    if (!messageInput.trim()) return
    sendMessageMutation.mutate(messageInput, {
      onSuccess: () => {
        setMessageInput('')
      }
    })
  }

  const handleDeleteMessage = (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      deleteMessageMutation.mutate(messageId)
    }
  }

  const handleAssignTask = (taskId, memberId, memberUsername) => {
    reassignTaskMutation.mutate({ taskId, newAssigneeId: memberId }, {
      onSuccess: () => {
        toast.success(`Task assigned to ${memberUsername}`)
        setAssigningTaskId(null)
      }
    })
  }

  if (teamLoading || tasksLoading || projectsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-full max-w-md" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
          <Skeleton className="h-32 rounded-[var(--radius-lg)]" />
        </div>
      </div>
    )
  }

  if (teamError || !team) {
    return (
      <div className="text-center py-12">
        <Icons.alert className="w-12 h-12 text-[var(--danger)] mx-auto mb-4" />
        <Heading level={3} className="text-lg font-bold mb-2">Team Not Found</Heading>
        <Button onClick={() => navigate(`/app/organizations/${orgId}`)}>Back to Organization</Button>
      </div>
    )
  }

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-8 text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
        <Icons.alert className="w-12 h-12 text-[var(--danger)] mb-4 animate-pulse" />
        <Heading level={3} className="text-xl font-bold mb-2">Access Denied</Heading>
        <Text variant="muted" className="max-w-md mb-6">
          You are not a member of this team, and do not have organization manager permissions to view this portal.
        </Text>
        <Button onClick={() => navigate(`/app/organizations/${orgId}`)}>
          Back to Organization
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative">
      {/* Brand Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <Heading level={2} className="tracking-tight text-[22px] font-semibold mb-0.5">{team.name}</Heading>
            <Badge variant="outline" className="bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]">Team Portal</Badge>
          </div>
          <Text variant="muted" className="text-[13px]">{team.description || 'No description provided.'}</Text>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate(`/app/organizations/${orgId}`)} className="self-start sm:self-auto">
          <Icons.chevronLeft className="w-4 h-4 mr-1.5" />
          Back to Org
        </Button>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-5 border-b border-[var(--border-subtle)] overflow-x-auto no-scrollbar mb-5">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'chat', label: 'Discussions & Chat' },
          { id: 'projects', label: 'Projects' },
          { id: 'tasks', label: 'Backlog & Tasks' },
          { id: 'members', label: 'Roster & Workload' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "relative pb-2.5 text-[13px] font-medium transition-colors duration-[var(--duration-base)] whitespace-nowrap",
              activeTab === tab.id ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
            )}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]" />
            )}
          </button>
        ))}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 min-h-0 relative">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5">
                <Text variant="muted" size="sm">Members</Text>
                <Heading level={3} className="text-3xl font-bold mt-1">{team.members?.length || 0}</Heading>
              </div>
              <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5">
                <Text variant="muted" size="sm">Active Projects</Text>
                <Heading level={3} className="text-3xl font-bold mt-1">{teamProjects.length}</Heading>
              </div>
              <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5">
                <Text variant="muted" size="sm">Backlog Tasks</Text>
                <Heading level={3} className="text-3xl font-bold mt-1">{teamTasks.filter(t => !t.assignedTo && t.status !== 'Done').length}</Heading>
              </div>
            </div>

            <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5">
              <Heading level={3} className="text-lg font-semibold mb-4">Quick Feed</Heading>
              <Text variant="muted" size="sm">Welcome to your team portal. Use the tabs above to engage in chat discussions, track shared projects, and reassign tasks among roster members.</Text>
            </div>
          </div>
        )}

        {/* Discussions & Chat Tab */}
        {activeTab === 'chat' && (
          <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] flex flex-col h-[500px]">
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messagesLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-8 w-1/2" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10 text-[var(--text-tertiary)]">
                  No messages yet. Start the discussion!
                </div>
              ) : (
                messages.map(msg => {
                  const isAuthor = msg.authorUsername === user?.username
                  return (
                    <div key={msg.id} className="group flex items-start gap-3 hover:bg-[var(--bg-hover)] p-2 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                        {msg.authorUsername.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="font-semibold text-sm text-[var(--text-primary)]">{msg.authorUsername}</span>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            {new Date(msg.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)] break-words whitespace-pre-wrap">{msg.content}</p>
                      </div>
                      {(isAuthor || canManage) && (
                        <IconButton
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 text-[var(--danger)] hover:text-[var(--danger)] hover:bg-[var(--danger-soft)] transition-opacity"
                          onClick={() => handleDeleteMessage(msg.id)}
                          title="Delete message"
                        >
                          <Icons.trash2 className="w-3.5 h-3.5" />
                        </IconButton>
                      )}
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-4 border-t border-[var(--color-border-subtle)] flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                placeholder="Message team discussions..."
                className="flex-1 px-3 py-2 bg-[var(--bg-subtle)] border border-[var(--color-border-default)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:border-[var(--accent-border)] text-[var(--text-primary)]"
              />
              <Button type="submit" size="sm" className="px-4">
                Send
              </Button>
            </form>
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Heading level={3} className="text-base font-semibold">Team Projects</Heading>
              {canCreateProject && (
                <Button size="sm" className="gap-1.5" onClick={() => setIsCreateProjectOpen(true)}>
                  <Icons.plus className="w-3.5 h-3.5" />
                  New Project
                </Button>
              )}
            </div>

            {teamProjects.length === 0 ? (
              <div className="text-center py-12 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center gap-3">
                <Text variant="muted">No projects assigned to this team.</Text>
                {canCreateProject && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIsCreateProjectOpen(true)}>
                    <Icons.plus className="w-3.5 h-3.5" />
                    Create First Project
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {teamProjects.map(proj => (
                  <div 
                    key={proj.id} 
                    onClick={() => navigate(`/app/projects/${proj.id}`)}
                    className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] transition-[border-color,box-shadow] cursor-pointer"
                  >
                    <Heading level={4} className="text-base font-semibold mb-2">{proj.name}</Heading>
                    <Text variant="muted" size="sm" className="line-clamp-2 mb-4">{proj.description || 'No description.'}</Text>
                    <Badge variant="outline" className="text-xs uppercase">{proj.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            {teamTasks.length === 0 ? (
              <div className="text-center py-10 bg-[var(--bg-elevated)] border border-dashed border-[var(--color-border-subtle)] rounded-[var(--radius-lg)]">
                <Text variant="muted">No tasks in team backlog.</Text>
              </div>
            ) : (
              <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
                <div className="divide-y divide-[var(--color-border-subtle)]">
                  {teamTasks.map(task => (
                    <div key={task.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg-hover)] transition-colors">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-[var(--accent)]" />
                        <div className="min-w-0">
                          <span className={cn("font-medium text-sm block truncate text-[var(--text-primary)]", task.status === 'Done' && "line-through text-[var(--text-secondary)]")}>
                            {task.title}
                          </span>
                          <span className="text-xs text-[var(--text-muted)]">
                            Status: {task.status} | Assigned to: {task.assignedTo || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs mr-2", priorityColors[task.priority])}>
                          {normalizePriority(task.priority)}
                        </Badge>
                        
                        {canAssignTask && (
                          <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
                            <PopoverTrigger asChild>
                              <Button variant="outline" size="xs">
                                Assign
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-1">
                              <Text size="xs" variant="muted" className="px-2 py-1.5 uppercase font-semibold tracking-wide">Assign Member</Text>
                              <div className="space-y-0.5">
                                {team.members?.map(m => (
                                  <button
                                    key={m.id}
                                    onClick={() => handleAssignTask(task.id, m.id, m.username)}
                                    className="w-full flex items-center gap-2 px-2 py-1.5 text-[13px] rounded hover:bg-[var(--bg-hover)] transition-colors text-left"
                                  >
                                    <div className="w-5 h-5 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-[10px] shrink-0">
                                      {m.username.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="truncate">{m.username}</span>
                                  </button>
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roster & Workload Tab */}
        {activeTab === 'members' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.members?.map(m => {
              const taskCount = workload[m.username] || 0
              return (
                <div key={m.id} className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-sm font-bold">
                      {m.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-semibold block text-[var(--text-primary)]">{m.username}</span>
                      <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider">{m.orgRole || 'Member'}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-[var(--text-secondary)] block">Active Workload</span>
                    <Badge variant="outline" className={cn("text-xs font-semibold mt-1", taskCount > 4 ? "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20" : taskCount > 2 ? "bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning)]/20" : "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]")}>
                      {taskCount} task(s)
                    </Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      <Modal open={isCreateProjectOpen} onOpenChange={setIsCreateProjectOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Team Project</Heading>
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
          />
        </ModalContent>
      </Modal>
    </div>
  )
}

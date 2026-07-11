import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { useProject, useUpdateProject, useDeleteProject } from '@/features/projects/hooks/useProjects'
import { ProjectForm } from '@/widgets/projects/ProjectForm'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/shared/lib/cn'

function formatDate(isoString) {
  if (!isoString) return '—'
  return new Date(isoString).toLocaleDateString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

const statusColors = {
  ACTIVE: 'bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  ARCHIVED: 'bg-red-500/10 text-red-500 border-red-500/20',
}

export function ProjectDetailPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { workspaceMode } = useWorkspace()
  const { data: project, isLoading, isError } = useProject(Number(projectId))
  
  const updateProjectMutation = useUpdateProject()
  const deleteProjectMutation = useDeleteProject()

  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false)

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

  if (isLoading) {
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

  if (isError || !project) {
    return (
      <div className="text-center py-20">
        <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
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
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link
              to="/app/projects"
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              <Icons.chevronLeft className="w-5 h-5" />
            </Link>
            <Heading level={2} className="tracking-tight">{project.name}</Heading>
            <Badge variant="outline" className={cn('text-xs', statusColors[project.status])}>
              {project.status}
            </Badge>
          </div>
          {project.description && (
            <Text variant="muted" className="mt-1 max-w-2xl">{project.description}</Text>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>Edit</Button>
          <Button variant="outline" size="sm" className="text-red-500 hover:text-red-600 hover:border-red-500" onClick={() => setIsDeleteModalOpen(true)}>Delete</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider mb-1">Progress</Text>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{project.progress}%</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden mt-2">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${project.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="h-full rounded-full bg-[var(--accent-cyan)]"
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider mb-1">Total Tasks</Text>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{project.tasksTotal}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider mb-1">Completed</Text>
            <span className="text-2xl font-bold text-emerald-500">{project.tasksCompleted}</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <Text variant="muted" size="xs" className="uppercase tracking-wider mb-1">Due Date</Text>
            <span className="text-2xl font-bold text-[var(--text-primary)]">{formatDate(project.dueDate)}</span>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.organizationName && (
            <div className="flex items-center gap-2">
              <Icons.projects className="w-4 h-4 text-[var(--text-muted)]" />
              <Text variant="muted">Organization:</Text>
              <Text className="font-medium">{project.organizationName}</Text>
            </div>
          )}
          {project.teamName && (
            <div className="flex items-center gap-2">
              <Icons.team className="w-4 h-4 text-[var(--text-muted)]" />
              <Text variant="muted">Team:</Text>
              <Text className="font-medium">{project.teamName}</Text>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Icons.user className="w-4 h-4 text-[var(--text-muted)]" />
            <Text variant="muted">Created by:</Text>
            <Text className="font-medium">{project.createdBy || 'System'}</Text>
          </div>
        </CardContent>
      </Card>

      <Modal open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Edit Project</Heading>
          <ProjectForm
            defaultValues={{
              name: project.name,
              description: project.description || '',
              organizationId: project.organizationId || '',
              teamId: project.teamId || '',
              dueDate: project.dueDate ? project.dueDate.slice(0, 16) : '',
            }}
            onSubmit={handleEditProject}
            isLoading={updateProjectMutation.isPending}
            workspaceMode={workspaceMode}
          />
        </ModalContent>
      </Modal>

      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <ModalContent className="sm:max-w-md">
          <Heading level={3} className="mb-4 text-red-500">Delete Project</Heading>
          <Text className="mb-6">
            Are you sure you want to delete <strong>{project.name}</strong>? This action cannot be undone and will delete all associated tasks.
          </Text>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
            <Button onClick={handleDeleteProject} isLoading={deleteProjectMutation.isPending} className="bg-red-500 hover:bg-red-600 text-white">
              Yes, Delete
            </Button>
          </div>
        </ModalContent>
      </Modal>

    </motion.div>
  )
}

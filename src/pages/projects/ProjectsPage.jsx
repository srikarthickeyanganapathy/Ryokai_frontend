import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Input } from '@/shared/ui/Input'
import { useProjects, useCreateProject } from '@/features/projects/hooks/useProjects'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { ProjectCard } from '@/widgets/projects/ProjectCard'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProjectForm } from '@/widgets/projects/ProjectForm'
import { useWorkspace } from '@/app/providers/WorkspaceProvider'

export function ProjectsPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  const { workspaceMode, activeOrganization } = useWorkspace()
  const { canCreateProject } = usePermissions()
  const canCreate = workspaceMode === 'PERSONAL' || canCreateProject
  
  const { data: allProjects = [], isLoading, isError, error } = useProjects({ search: globalFilter })
  const createProjectMutation = useCreateProject()

  const projects = allProjects.filter(p => {
    if (workspaceMode === 'PERSONAL') {
      return !p.organizationId
    } else {
      return p.organizationId === activeOrganization?.id
    }
  })

  const handleCreateProject = (data) => {
    createProjectMutation.mutate(data, {
      onSuccess: () => setIsCreateOpen(false)
    })
  }

  return (
    <div className="flex flex-col min-h-full">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-0.5">Projects</Heading>
          <Text variant="muted" className="text-[13px]">Organize work across your teams.</Text>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" />
            <Input 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search projects..." 
              className="pl-8" 
            />
          </div>
          {canCreate && (
            <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setIsCreateOpen(true)}>
              <Icons.projects className="w-3.5 h-3.5" />
              New Project
            </Button>
          )}
        </div>
      </div>

      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Project</Heading>
          <ProjectForm 
            defaultValues={{
              name: '',
              description: '',
              organizationId: workspaceMode === 'ORG' && activeOrganization ? activeOrganization.id.toString() : '',
              teamId: 'none',
              dueDate: '',
            }}
            onSubmit={handleCreateProject}
            isLoading={createProjectMutation.isPending}
            workspaceMode={workspaceMode}
          />
        </ModalContent>
      </Modal>

      {/* Loading State */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-[var(--radius-lg)] bg-[var(--bg-subtle)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <div className="w-11 h-11 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
            <Icons.x className="w-5 h-5" />
          </div>
          <Heading level={3} className="text-[15px] font-semibold">Failed to load projects</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">
            {error?.message || 'An unexpected error occurred. Please try again.'}
          </Text>
          <Button variant="outline" onClick={() => window.location.reload()}>Retry</Button>
        </div>
      )}

      {/* Projects Grid */}
      {!isLoading && !isError && projects.length > 0 && (
        <motion.div 
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        >
          {projects.map(project => (
            <motion.div 
              key={project.id}
              variants={{
                hidden: { opacity: 0, y: 10 },
                visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
              }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && projects.length === 0 && (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-lg)] border-dashed">
          <div className="w-11 h-11 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-tertiary)]">
            <Icons.projects className="w-5 h-5" />
          </div>
          <Heading level={3} className="text-[15px] font-semibold">No projects found</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">Get started by creating a new project to organize your tasks.</Text>
          {canCreate && <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>}
        </div>
      )}

    </div>
  )
}

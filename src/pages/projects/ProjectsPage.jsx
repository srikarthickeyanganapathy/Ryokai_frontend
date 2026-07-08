import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { Input } from '@/shared/ui/Input'
import { useProjects, useCreateProject } from '@/features/projects/hooks/useProjects'
import { ProjectCard } from '@/widgets/projects/ProjectCard'
import { Modal, ModalContent } from '@/shared/ui/Modal'
import { ProjectForm } from '@/widgets/projects/ProjectForm'
import { useWorkspace } from '@/context/WorkspaceContext'

export function ProjectsPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  
  const { workspaceMode, activeOrganization } = useWorkspace()
  
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
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <Heading level={2} className="tracking-tight mb-1">Projects</Heading>
          <Text variant="muted">Organize work across your teams.</Text>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <Input 
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              placeholder="Search projects..." 
              className="pl-9 bg-[var(--bg-elevated)] border-transparent focus:border-[var(--color-border-default)]" 
            />
          </div>
          <Button className="shrink-0 gap-2" onClick={() => setIsCreateOpen(true)}>
            <Icons.projects className="w-4 h-4" />
            New Project
          </Button>
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
              teamId: '',
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-[var(--bg-subtle)] animate-pulse" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
            <Icons.x className="w-6 h-6" />
          </div>
          <Heading level={3}>Failed to load projects</Heading>
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
        <div className="text-center py-20 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl border-dashed">
          <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
            <Icons.projects className="w-6 h-6" />
          </div>
          <Heading level={3}>No projects found</Heading>
          <Text variant="muted" className="mt-2 mb-6 max-w-md mx-auto">Get started by creating a new project to organize your tasks.</Text>
          <Button onClick={() => setIsCreateOpen(true)}>Create Project</Button>
        </div>
      )}

    </div>
  )
}

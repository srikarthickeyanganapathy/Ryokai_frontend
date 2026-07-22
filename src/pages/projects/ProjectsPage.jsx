import React, { useState, useMemo } from 'react'
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
import { cn } from '@/shared/lib/cn'

export function ProjectsPage() {
  const [globalFilter, setGlobalFilter] = useState('')
  const [activeTab, setActiveTab] = useState('ALL')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const { workspaceMode, activeOrganization } = useWorkspace()
  const { canCreateProject } = usePermissions()
  const canCreate = workspaceMode === 'PERSONAL' || canCreateProject

  const { data: allProjects = [], isLoading, isError, error } = useProjects({ search: globalFilter })
  const createProjectMutation = useCreateProject()

  const projects = useMemo(() => {
    return allProjects.filter(p => {
      let modeMatch = false
      if (workspaceMode === 'PERSONAL') {
        modeMatch = !p.organizationId
      } else if (workspaceMode === 'CREWS') {
        modeMatch = !!p.crewId || (Array.isArray(p.sharedCrewIds) && p.sharedCrewIds.length > 0)
      } else if (workspaceMode === 'ORG') {
        modeMatch = p.organizationId === activeOrganization?.id
      }
      if (!modeMatch) return false
      if (activeTab === 'ACTIVE') return p.status !== 'COMPLETED' && p.status !== 'ARCHIVED'
      if (activeTab === 'COMPLETED') return p.status === 'COMPLETED'
      if (activeTab === 'ARCHIVED') return p.status === 'ARCHIVED'
      return true
    })
  }, [allProjects, workspaceMode, activeOrganization, activeTab])

  const stats = useMemo(() => {
    const total = projects.length
    const active = projects.filter(p => p.status !== 'COMPLETED' && p.status !== 'ARCHIVED').length
    const completed = projects.filter(p => p.status === 'COMPLETED').length
    return { total, active, completed }
  }, [projects])

  const handleCreateProject = (data) => {
    createProjectMutation.mutate(data, {
      onSuccess: () => setIsCreateOpen(false)
    })
  }

  return (
    <div className="flex flex-col min-h-full space-y-6" role="region" aria-label="Projects">

      {/* 📁 HERO STICKY HEADER & COMMAND BANNER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
              ORIENT / MANAGE
            </span>
            <span className="text-[11px] text-[var(--text-muted)]">• {stats.active} Active Projects</span>
          </div>
          <Heading level={1} className="tracking-tight text-[22px] font-semibold mb-0">Projects Directory</Heading>
          <Text variant="muted" className="text-[13px]">Manage strategic initiatives, milestones, and crew access.</Text>
        </div>

        <div className="flex items-center gap-3">
          {canCreate && (
            <Button size="sm" className="shrink-0 gap-1.5" onClick={() => setIsCreateOpen(true)}>
              <Icons.projects className="w-3.5 h-3.5" />
              New Project
            </Button>
          )}
        </div>
      </div>

      {/* SINGLE-LINE TOOLBAR (Tabs + Search) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-xl border border-[var(--color-border-subtle)] overflow-x-auto no-scrollbar">
          {['ALL', 'ACTIVE', 'COMPLETED', 'ARCHIVED'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 text-xs font-medium rounded-lg transition-colors capitalize whitespace-nowrap",
                activeTab === tab
                  ? "bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm font-semibold"
                  : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              )}
            >
              {tab.toLowerCase()}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Icons.search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-tertiary)]" aria-hidden="true" />
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search projects..."
            className="pl-8"
          />
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
            <div key={i} className="h-44 rounded-2xl bg-[var(--bg-subtle)] animate-pulse border border-[var(--color-border-subtle)]" />
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && isError && (
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl border-dashed">
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
            visible: { opacity: 1, transition: { staggerChildren: 0.08 } }
          }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
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
        <div className="text-center py-16 bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl border-dashed">
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

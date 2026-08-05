import React from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { ProjectCard } from '@/project/components/ProjectCard'
import { PermissionButton } from '../components/Shared'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { FolderPlus } from '@/shared/ui/Icons'

export function ProjectsTab({ teamProjects, canCreateProject, isReadOnly, onCreateProject }) {
  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level={3} className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Team Projects
          </Heading>
          <Text size="sm" variant="muted" className="mt-1">
            {teamProjects.length} active {teamProjects.length === 1 ? 'project' : 'projects'} linked to this team.
          </Text>
        </div>
        <PermissionButton 
          allowed={canCreateProject && !isReadOnly} 
          reason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."} 
          onClick={onCreateProject} 
          icon={Icons.plus}
          variant="outline"
          className="bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-sm font-medium h-9 px-4"
        >
          New Project
        </PermissionButton>
      </div>

      {teamProjects.length === 0 ? (
        <ImmersiveEmptyState
          icon={FolderPlus}
          title="No projects linked yet"
          description="Create a new project for this team to start tracking tasks, milestones, and collaborative work."
          action={canCreateProject && !isReadOnly ? <PermissionButton allowed={true} onClick={onCreateProject} icon={Icons.plus}>Create Project</PermissionButton> : null}
        />
      ) : (
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {teamProjects.map(project => (
            <motion.div
              key={project.id}
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
import React from 'react'
import { Heading } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { ProjectCard } from '@/project/sections/ProjectCard' // Using the shared component
import { PermissionButton, EmptyState, FolderIcon } from '../components/Shared'

export function ProjectsTab({ teamProjects, canCreateProject, isReadOnly, onCreateProject }) {
  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-[1400px] mx-auto">
      <div className="flex justify-between items-center">
        <Heading level={3} className="text-[14px] font-semibold tracking-tight">Team Projects</Heading>
        <PermissionButton allowed={canCreateProject && !isReadOnly} reason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."} onClick={onCreateProject} icon={Icons.plus}>New Project</PermissionButton>
      </div>
      {teamProjects.length === 0 ? (
        <EmptyState icon={FolderIcon} title="No Projects Yet" description="Create the first project for this team." actionLabel="Create Project" onAction={onCreateProject} actionAllowed={canCreateProject && !isReadOnly} actionReason={isReadOnly ? 'Observers cannot create projects.' : "You don't have permission to create projects."} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teamProjects.map(proj => (
            <ProjectCard key={proj.id} project={proj} />
          ))}
        </div>
      )}
    </div>
  )
}
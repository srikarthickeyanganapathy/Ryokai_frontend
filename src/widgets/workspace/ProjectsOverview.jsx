import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Text } from '@/shared/ui/Typography'
import { useProjects } from '@/features/projects/hooks/useProjects'

export function ProjectsOverview() {
  const { data: projects = [], isLoading } = useProjects()

  if (isLoading) return <Card className="animate-pulse h-[300px]" />

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Projects Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 space-y-4">
        {projects.length === 0 ? (
          <Text variant="muted" className="text-sm">No active projects.</Text>
        ) : (
          projects.map(project => (
            <div key={project.id} className="flex flex-col gap-2 p-3 rounded-lg border border-[var(--color-border-subtle)] bg-[var(--bg-base)] hover:border-[var(--accent-cyan)] transition-colors">
              <div className="flex items-center justify-between">
                <Text size="sm" className="font-medium text-[var(--text-primary)]">
                  {project.name}
                </Text>
                <span className="text-xs font-medium text-[var(--text-secondary)]">
                  {project.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[var(--accent-cyan)]"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

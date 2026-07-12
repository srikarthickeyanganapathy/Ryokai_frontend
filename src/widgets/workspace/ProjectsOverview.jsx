import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Text } from '@/shared/ui/Typography'
import { useProjects } from '@/features/projects/hooks/useProjects'

export function ProjectsOverview() {
  const { data: projects = [], isLoading } = useProjects()

  if (isLoading) return <Skeleton className="h-[300px] rounded-[var(--radius-lg)]" />

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Projects Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
        {projects.length === 0 ? (
          <Text variant="muted" className="text-sm">No active projects.</Text>
        ) : (
          projects.map(project => (
            <div key={project.id} className="flex flex-col gap-2 p-3 rounded-[var(--radius-md)] border border-transparent hover:border-[var(--color-border-subtle)] bg-[var(--bg-base)] hover:bg-[var(--bg-subtle)] transition-colors duration-[var(--duration-fast)]">
              <div className="flex items-center justify-between">
                <Text size="sm" className="font-medium text-[var(--text-primary)]">
                  {project.name}
                </Text>
                <span className="text-xs font-medium text-[var(--text-secondary)] tabular-nums">
                  {project.progress}%
                </span>
              </div>
              <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-[var(--accent)]"
                  initial={{ width: 0 }}
                  animate={{ width: `${project.progress}%` }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
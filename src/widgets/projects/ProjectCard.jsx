import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'

export function ProjectCard({ project }) {
  const { 
    id, 
    name, 
    description, 
    progress, 
    tasksTotal, 
    tasksCompleted, 
    dueDate, 
    status,
    updatedAt,
    createdBy,
    color 
  } = project

  const tasksLeft = tasksTotal - tasksCompleted
  const safeColor = color || 'var(--accent-cyan)'

  return (
    <Link to={`/app/projects/${id}`} className="block">
      <motion.div 
        whileHover={{ y: -2 }}
        className="group relative bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-6 transition-all hover:shadow-md hover:border-[var(--color-border-default)] h-full flex flex-col"
      >
        {/* Header (Project & Status) */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 shadow-sm"
              style={{ backgroundColor: `${safeColor}15`, color: safeColor }}
            >
              <Icons.projects className="w-5 h-5" />
            </div>
            <div>
              <Heading level={4} className="group-hover:text-[var(--accent-cyan)] transition-colors">
                {name}
              </Heading>
              <Text size="sm" variant="muted" className="mt-0.5 line-clamp-1">{description}</Text>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "shrink-0",
              status === 'ACTIVE' && "bg-[var(--accent-cyan)]/10 text-[var(--accent-cyan)] border-[var(--accent-cyan)]/20",
              status === 'COMPLETED' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
              status === 'ARCHIVED' && "bg-red-500/10 text-red-500 border-red-500/20"
            )}
          >
            {status}
          </Badge>
        </div>

        {/* Progress & Metrics */}
        <div className="mt-4 mb-6 flex-1">
          <div className="flex justify-between items-end mb-2">
            <Text size="sm" className="font-medium">{progress}% <span className="text-[var(--text-muted)] font-normal">Completed</span></Text>
            <Text size="sm" variant="muted">{tasksLeft} tasks left</Text>
          </div>
          <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: safeColor }}
            />
          </div>
        </div>

        {/* Footer (Created By, Due, Updated) */}
        <div className="flex items-center justify-between pt-4 border-t border-[var(--color-border-subtle)]">
          <Text size="xs" variant="muted">
            {createdBy || 'System'}
          </Text>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center text-[var(--text-secondary)] text-xs gap-1.5">
              <Icons.alert className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              Due {dueDate ? new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'No date'}
            </div>
            <Text size="xs" variant="muted">
              Updated {updatedAt ? new Date(updatedAt).toLocaleDateString() : '—'}
            </Text>
          </div>
        </div>

      </motion.div>
    </Link>
  )
}

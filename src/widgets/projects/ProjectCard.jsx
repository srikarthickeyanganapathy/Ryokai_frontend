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
  const safeColor = color || 'var(--accent)'

  return (
    <Link to={`/app/projects/${id}`} className="block">
      <motion.div 
        whileHover={{ y: -3 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="group relative bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] p-5 transition-[border-color,box-shadow] duration-[var(--duration-base)] ease-[var(--ease-out)] hover:border-[var(--accent-border)] hover:shadow-[var(--accent-glow)] h-full flex flex-col"
      >
        {/* Header (Project & Status) */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div 
              className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 transition-transform duration-[var(--duration-base)] ease-[var(--ease-spring)] group-hover:scale-110"
              style={{ backgroundColor: `${safeColor}18`, color: safeColor }}
            >
              <Icons.projects className="w-4 h-4" />
            </div>
            <div>
              <Heading level={4} className="text-[14px] font-semibold group-hover:text-[var(--accent)] transition-colors">
                {name}
              </Heading>
              <Text size="sm" variant="muted" className="text-[12px] mt-0.5 line-clamp-1">{description}</Text>
            </div>
          </div>
          <Badge 
            size="sm"
            className={cn(
              "shrink-0",
              status === 'ACTIVE' && "bg-[var(--accent-soft)] text-[var(--accent)]",
              status === 'COMPLETED' && "bg-[var(--success-soft)] text-[var(--success)]",
              status === 'ARCHIVED' && "bg-[var(--danger-soft)] text-[var(--danger)]"
            )}
          >
            {status}
          </Badge>
        </div>

        {/* Progress & Metrics */}
        <div className="mt-3 mb-5 flex-1">
          <div className="flex justify-between items-end mb-1.5">
            <Text size="sm" className="text-[12px] font-medium">{progress}% <span className="text-[var(--text-tertiary)] font-normal">Completed</span></Text>
            <Text size="sm" variant="muted" className="text-[12px]">{tasksLeft} tasks left</Text>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ backgroundColor: safeColor }}
            />
          </div>
        </div>

        {/* Footer (Created By, Due, Updated) */}
        <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
          <Text size="xs" variant="muted">
            {createdBy || 'System'}
          </Text>

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center text-[var(--text-secondary)] text-[11px] gap-1.5">
              <Icons.alert className="w-3 h-3 text-[var(--text-tertiary)]" />
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
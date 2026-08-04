import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Icons } from '@/shared/ui/Icons'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'

export function ProjectCard({ project }) {
  const { id, name, description, progress, tasksTotal, tasksCompleted, dueDate, status, createdBy, color } = project
  const tasksLeft = tasksTotal - tasksCompleted
  const safeColor = color || 'var(--accent)'

  return (
    <Link to={`/app/projects/${id}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -2 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 transition-all duration-200 hover:border-[var(--accent-border)] hover:shadow-sm h-full flex flex-col justify-between overflow-hidden"
      >
        <div 
          className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: safeColor }}
          aria-hidden="true"
        />

        <div className="space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
                style={{ backgroundColor: safeColor.startsWith('var(') ? 'var(--accent-soft)' : `${safeColor}1a`, color: safeColor }}
              >
                <Icons.projects className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <Heading level={4} className="text-[14px] font-semibold tracking-tight group-hover:text-[var(--accent)] transition-colors truncate">
                  {name}
                </Heading>
                <Text size="xs" variant="muted" className="text-[11px] line-clamp-1 mt-0.5">{description || 'No description provided.'}</Text>
              </div>
            </div>
            <Badge 
              variant="outline"
              className={cn(
                "shrink-0 font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded-full border font-semibold",
                status === 'ACTIVE' && "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]",
                status === 'COMPLETED' && "bg-[var(--success-soft)] text-[var(--success)] border-[var(--success-border)]",
                status === 'ARCHIVED' && "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]"
              )}
            >
              {status || 'ACTIVE'}
            </Badge>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 text-[11px] font-mono">
              <span className="font-semibold text-[var(--text-primary)]">{progress || 0}% <span className="text-[var(--text-muted)] font-normal">done</span></span>
              <span className="text-[var(--text-muted)]">{tasksLeft > 0 ? `${tasksLeft} left` : 'All done'}</span>
            </div>
            <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: safeColor }}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--border-subtle)] text-[10px] text-[var(--text-muted)] font-mono relative z-10">
          <span className="truncate max-w-[120px]">
            By {createdBy || 'System'}
          </span>
          <span className="flex items-center gap-1.5">
            <Icons.alert className="w-3 h-3 text-[var(--accent)] shrink-0" />
            {dueDate ? `Due ${new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'No deadline'}
          </span>
        </div>
      </motion.div>
    </Link>
  )
}
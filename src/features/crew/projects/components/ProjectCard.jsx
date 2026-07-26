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
    <Link to={`/app/projects/${id}`} className="block h-full">
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
        className="group relative bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-2xl p-5 transition-all duration-300 hover:border-[var(--accent-border)] hover:shadow-xl hover:shadow-[var(--accent)]/5 h-full flex flex-col justify-between overflow-hidden"
      >
        {/* Subtle Accent Glow Ring */}
        <div 
          className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none"
          style={{ backgroundColor: safeColor }}
        />

        {/* Top Header */}
        <div className="space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-inner font-bold text-sm transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: `${safeColor}18`, color: safeColor }}
              >
                <Icons.projects className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <Heading level={4} className="text-base font-bold tracking-tight group-hover:text-[var(--accent)] transition-colors truncate">
                  {name}
                </Heading>
                <Text size="xs" variant="muted" className="text-[12px] line-clamp-1 mt-0.5">{description || 'No project scope description.'}</Text>
              </div>
            </div>
            <Badge 
              size="sm"
              className={cn(
                "shrink-0 font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-semibold",
                status === 'ACTIVE' && "bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]",
                status === 'COMPLETED' && "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                status === 'ARCHIVED' && "bg-rose-500/10 text-rose-500 border-rose-500/30"
              )}
            >
              {status}
            </Badge>
          </div>

          {/* Progress Section */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-1.5 text-xs font-mono">
              <span className="font-semibold text-[var(--text-primary)]">{progress || 0}% <span className="text-[var(--text-muted)] font-normal">complete</span></span>
              <span className="text-[var(--text-muted)]">{tasksLeft || 0} tasks left</span>
            </div>
            <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden p-0.5 border border-[var(--color-border-subtle)]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress || 0}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ backgroundColor: safeColor }}
              />
            </div>
          </div>
        </div>

        {/* Footer Meta Details */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-[var(--color-border-subtle)] text-[11px] text-[var(--text-muted)] font-mono relative z-10">
          <span className="truncate max-w-[120px]">
            By {createdBy || 'System'}
          </span>

          <div className="flex items-center gap-1.5 text-right">
            <Icons.alert className="w-3 h-3 text-[var(--accent)] shrink-0" />
            <span>{dueDate ? `Due ${new Date(dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}` : 'No deadline'}</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
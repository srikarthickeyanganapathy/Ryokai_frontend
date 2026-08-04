import React from 'react'
import { Link } from 'react-router-dom'
import { Heading, Text } from '@/shared/ui/Typography'
import { ImmersivePanel, ImmersiveBadge } from '@/shared/ui/Immersive'
import { calculateHealthScore, getHealthStatus, formatRelativeDate } from '../features/utils/projectUtils'
import { cn } from '@/shared/lib/cn'

export function ProjectCard({ project }) {
  const { id, name, description, progress = 0, tasksTotal = 0, tasksCompleted = 0, dueDate, status } = project
  const tasksLeft = (tasksTotal || 0) - (tasksCompleted || 0)
  
  const healthScore = calculateHealthScore(project)
  const health = getHealthStatus(healthScore)
  const formattedDueDate = formatRelativeDate(dueDate)
  const isOverdue = formattedDueDate.includes('Overdue')

  // SVG Progress Ring Math
  const radius = 16
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - ((progress || 0) / 100) * circumference

  return (
    <Link to={`/app/projects/${id}`} className="block h-full group">
      <ImmersivePanel interactive className="h-full flex flex-col p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border",
              health.tone === 'success' && 'bg-green-500/10 text-green-500 border-green-500/20',
              health.tone === 'accent' && 'bg-blue-500/10 text-blue-500 border-blue-500/20',
              health.tone === 'warning' && 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
              health.tone === 'danger' && 'bg-red-500/10 text-red-500 border-red-500/20'
            )}>
              {health.label} {healthScore}
            </span>
          </div>
          <ImmersiveBadge tone={status === 'COMPLETED' ? 'success' : 'neutral'}>{status || 'ACTIVE'}</ImmersiveBadge>
        </div>

        <Heading level={4} className="text-[15px] font-semibold tracking-tight text-[var(--text-primary)] mb-1 group-hover:text-[var(--accent)] transition-colors truncate">
          {name}
        </Heading>
        <Text size="sm" variant="muted" className="text-[12px] leading-relaxed mb-4 line-clamp-2 min-h-[32px]">
          {description || 'No description provided.'}
        </Text>

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]/50">
          <div className="flex items-center gap-3">
            {/* Progress Ring */}
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="w-10 h-10 transform -rotate-90 absolute inset-0" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={radius} fill="none" stroke="var(--bg-subtle)" strokeWidth="3" />
                <circle 
                  cx="18" cy="18" r={radius} 
                  fill="none" 
                  stroke="var(--accent)" 
                  strokeWidth="3" 
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </svg>
              <span className="text-[10px] font-bold text-[var(--text-primary)]">{progress || 0}%</span>
            </div>
            <div className="text-[11px] text-[var(--text-muted)] font-medium">
              <div>{tasksCompleted || 0}/{tasksTotal || 0} Tasks</div>
              <div className="text-[var(--text-tertiary)]">{tasksLeft > 0 ? `${tasksLeft} left` : 'All done'}</div>
            </div>
          </div>
          
          {dueDate && (
            <span className={cn(
              "text-[11px] font-medium px-2 py-1 rounded-md",
              isOverdue ? "bg-red-500/10 text-red-500" : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            )}>
              {formattedDueDate}
            </span>
          )}
        </div>
      </ImmersivePanel>
    </Link>
  )
}
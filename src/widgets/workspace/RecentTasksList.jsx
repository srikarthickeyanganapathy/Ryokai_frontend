import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { IconButton } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { normalizePriority, PRIORITY_COLORS } from '@/shared/lib/priority'

const statusIcons = {
  'To Do':       <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />,
  'In Review':   <div className="w-4 h-4 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin-slow" />,
  'Done':        <Icons.check className="w-4 h-4 text-[var(--accent)]" />,
  'Needs Work':  <Icons.alert className="w-4 h-4 text-[var(--warning)]" />,
}

import { useNavigate } from 'react-router-dom'

export function RecentTasksList({ tasks = [], isLoading, onTaskClick }) {
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <Card className="h-full min-h-[350px]">
        <CardHeader className="pb-4 border-b border-[var(--color-border-subtle)]">
          <Skeleton className="h-5 w-40" />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="w-4 h-4 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/4" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col shadow-sm border-[var(--border-subtle)]">
      <CardHeader className="pb-3 pt-4 flex flex-row items-center justify-between border-b-0">
        <div>
          <CardTitle className="text-base font-semibold">Active Tasks</CardTitle>
          <Text variant="muted" size="sm" className="mt-0.5">Tasks needing your attention.</Text>
        </div>
        <IconButton variant="ghost" size="sm" onClick={() => navigate('/app/tasks')}>
          <Icons.search className="w-4 h-4" />
        </IconButton>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-y-auto custom-scrollbar">
        <div className="divide-y divide-transparent">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              onClick={() => onTaskClick?.(task)}
              className="flex items-start gap-4 px-5 py-3.5 hover:bg-[var(--bg-subtle)] transition-colors duration-[var(--duration-fast)] cursor-pointer group"
            >
              <div className="mt-1 text-[var(--text-secondary)]">
                {statusIcons[task.status]}
              </div>
              
              <div className="flex-1 min-w-0">
                <Text 
                  className={cn(
                    "font-medium truncate transition-colors",
                    (task.status === 'Done' || task.status === 'COMPLETED') && "line-through text-[var(--text-secondary)]"
                  )}
                >
                  {task.title}
                </Text>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)}>
                    {normalizePriority(task.priority)}
                  </Badge>
                  {task.due && (
                    <Text size="xs" variant="muted" className="flex items-center gap-1">
                      <Icons.alert className="w-3 h-3" />
                      {task.due}
                    </Text>
                  )}
                </div>
              </div>

              <div className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-[var(--duration-base)] ease-[var(--ease-out)]">
                <IconButton variant="ghost" size="sm" className="h-8 w-8" onClick={(e) => { e.stopPropagation(); onTaskClick?.(task) }}>
                  <Icons.chevronRight className="w-4 h-4" />
                </IconButton>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
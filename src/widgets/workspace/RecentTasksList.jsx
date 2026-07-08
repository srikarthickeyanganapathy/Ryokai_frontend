import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Heading, Text } from '@/shared/ui/Typography'
import { Badge } from '@/shared/ui/Badge'
import { Icons } from '@/shared/ui/Icons'
import { IconButton } from '@/shared/ui/Button'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'

const priorityColors = {
  URGENT: 'bg-red-500/10 text-red-600 border-red-500/20',
  HIGH: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
  NORMAL: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  LOW: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--color-border-subtle)]',
  NONE: 'bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--color-border-subtle)]',
}

const statusIcons = {
  'To Do':       <div className="w-4 h-4 rounded-full border-2 border-[var(--color-border-default)]" />,
  'In Review':   <div className="w-4 h-4 rounded-full border-2 border-[var(--accent-cyan)] border-t-transparent animate-spin-slow" />,
  'Done':        <Icons.check className="w-4 h-4 text-[var(--accent-cyan)]" />,
  'Needs Work':  <Icons.alert className="w-4 h-4 text-orange-500" />,
}

export function RecentTasksList({ tasks = [], isLoading }) {
  if (isLoading) {
    return (
      <Card className="h-full min-h-[350px] animate-pulse">
        <CardHeader className="pb-4 border-b border-[var(--color-border-subtle)]">
          <div className="h-5 w-40 bg-[var(--bg-subtle)] rounded" />
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-4 h-4 rounded-full bg-[var(--bg-subtle)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-[var(--bg-subtle)] rounded" />
                <div className="h-3 w-1/4 bg-[var(--bg-subtle)] rounded" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4 border-b border-[var(--color-border-subtle)] flex flex-row items-center justify-between">
        <div>
          <CardTitle>Active Tasks</CardTitle>
          <Text variant="muted" size="sm" className="mt-1">Tasks needing your attention.</Text>
        </div>
        <IconButton variant="ghost" size="sm">
          <Icons.search className="w-4 h-4" />
        </IconButton>
      </CardHeader>
      
      <CardContent className="flex-1 p-0 overflow-y-auto">
        <div className="divide-y divide-[var(--color-border-subtle)]">
          {tasks.map((task) => (
            <div 
              key={task.id} 
              className="flex items-start gap-4 p-4 hover:bg-[var(--bg-subtle)] transition-colors cursor-pointer group"
            >
              <div className="mt-1 text-[var(--text-secondary)]">
                {statusIcons[task.status]}
              </div>
              
              <div className="flex-1 min-w-0">
                <Text 
                  className={cn(
                    "font-medium truncate transition-colors",
                    task.status === 'Done' && "line-through text-[var(--text-secondary)]"
                  )}
                >
                  {task.title}
                </Text>
                <div className="flex items-center gap-3 mt-1.5">
                  <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", priorityColors[task.priority])}>
                    {normalizePriority(task.priority)}
                  </Badge>
                  <Text size="xs" variant="muted" className="flex items-center gap-1">
                    <Icons.alert className="w-3 h-3" />
                    {task.due}
                  </Text>
                </div>
              </div>

              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <IconButton variant="ghost" size="sm" className="h-8 w-8">
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

import React, { useMemo } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card'
import { Skeleton } from '@/shared/ui/Skeleton'
import { Text } from '@/shared/ui/Typography'
import { getSmartDate } from '@/shared/lib/date'
import { isBefore, parseISO, startOfToday } from 'date-fns'
import { cn } from '@/shared/lib/cn'

export function UpcomingDeadlines({ tasks = [], isLoading }) {
  const deadlines = useMemo(() => {
    const today = startOfToday()
    return tasks
      .filter(t => t.dueDate && t.status !== 'Done')
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 5)
  }, [tasks])

  if (isLoading) return <Skeleton className="h-[300px] rounded-[var(--radius-lg)]" />

  return (
    <Card className="h-full flex flex-col shadow-sm border-[var(--border-subtle)]">
      <CardHeader className="pb-3 pt-4 border-b-0">
        <CardTitle className="text-base font-semibold">Upcoming Deadlines</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 space-y-2.5 custom-scrollbar">
        {deadlines.length === 0 ? (
          <Text variant="muted" className="text-sm">No upcoming deadlines.</Text>
        ) : (
            deadlines.map(task => {
            const isOverdue = isBefore(parseISO(task.dueDate), startOfToday())
            return (
              <div key={task.id} className="flex flex-col gap-1 p-3 rounded-[var(--radius-md)] border border-transparent bg-[var(--bg-base)] hover:bg-[var(--bg-subtle)] hover:border-[var(--color-border-subtle)] transition-colors duration-[var(--duration-fast)]">
                <div className="flex items-start justify-between gap-2">
                  <Text size="sm" className="font-medium text-[var(--text-primary)] line-clamp-1">
                    {task.title}
                  </Text>
                  <span className={cn(
                    "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
                    isOverdue 
                      ? "bg-[var(--danger-soft)] text-[var(--danger)]" 
                      : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
                  )}>
                    {getSmartDate(task.dueDate)}
                  </span>
                </div>
                <Text size="xs" variant="muted">
                  Priority: {task.priority}
                </Text>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
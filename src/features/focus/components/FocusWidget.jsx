import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { isToday, parseISO } from 'date-fns'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { useTaskList } from '@/features/tasks/hooks/useTasks'
import { Play, ArrowRight } from 'lucide-react'

export function FocusWidget() {
  const { data: tasks = [] } = useTaskList()

  const { pendingCount, remainingTime } = useMemo(() => {
    const today = tasks.filter(t => t.dueDate && isToday(parseISO(t.dueDate)))
    const pending = today.filter(t => t.status !== 'Done' && t.status !== 'Canceled')
    const remainingTime = pending.reduce((acc, t) => acc + (t.timeEstimateMinutes || 60), 0)

    return {
      pendingCount: pending.length,
      remainingTime
    }
  }, [tasks])

  return (
    <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-subtle)] border border-[var(--accent-cyan)]/30 hover:border-[var(--accent-cyan)]/60 transition-colors shadow-lg group">
      
      {/* Background glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-[var(--accent-cyan)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent-cyan)]/20 transition-colors" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Heading level={3} className="text-[var(--text-primary)] mb-2 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent-cyan)] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent-cyan)]"></span>
            </span>
            Ready to focus?
          </Heading>
          <Text variant="muted" className="text-sm">
            You have <span className="text-[var(--text-primary)] font-medium">{pendingCount} tasks</span> pending today, estimated at <span className="text-[var(--text-primary)] font-medium">{Math.floor(remainingTime / 60)}h {remainingTime % 60}m</span>.
          </Text>
        </div>

        <Button asChild size="lg" className="shrink-0 bg-[var(--text-primary)] text-[var(--bg-base)] hover:bg-[var(--text-secondary)] rounded-full px-8">
          <Link to="/app/focus">
            Enter Focus Mode
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  )
}

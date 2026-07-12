import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { useTaskList } from '@/features/tasks/hooks/useTasks'
import { FocusWidget } from '@/features/focus/components/FocusWidget'
import { ProjectsOverview } from '@/widgets/workspace/ProjectsOverview'
import { UpcomingDeadlines } from '@/widgets/workspace/UpcomingDeadlines'
import { RecentTasksList } from '@/widgets/workspace/RecentTasksList'
import { WorkloadMatrix } from '@/features/analytics/components/Charts'
import { selectWorkloadMatrix, selectCompletionRate } from '@/features/analytics/lib/selectors'
import { MiniCalendarWidget } from '@/widgets/workspace/MiniCalendarWidget'

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export function DashboardPage() {
  const { user } = useAuth()
  const { data: tasks = [], isLoading: isTasksLoading } = useTaskList()

  // Derive recent tasks from the real tasks array (sorted by updatedAt desc, top 4)
  const recentTasks = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    return [...tasks]
      .sort((a, b) => new Date(b.updatedAt || b.createdAt || 0).getTime() - new Date(a.updatedAt || a.createdAt || 0).getTime())
      .slice(0, 4)
      .map(t => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, due: t.dueDate || 'No date' }));
  }, [tasks]);

  const stats = useMemo(() => {
    const safeTasks = tasks || []
    return {
      completionRate: selectCompletionRate(safeTasks),
      workloadData: selectWorkloadMatrix(safeTasks)
    }
  }, [tasks])

  return (
    <motion.div 
      className="space-y-5 md:space-y-6 pb-12 mesh-bg"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-0.5">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}.
        </Heading>
        <Text variant="muted" className="text-[13px]">Here's what's happening with your workspace today.</Text>
      </motion.div>

      {/* Top Grid Row: Progress, Focus & Calendar */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-3 gap-4 md:gap-5">
        <div className="xl:col-span-2 flex flex-col gap-4 md:gap-5">
          {/* Today's Progress */}
          <div className="glass-panel mesh-bg p-4 rounded-[var(--radius-lg)]">
            <div className="flex justify-between items-end mb-3">
              <Text variant="muted" className="uppercase tracking-wider text-[11px] font-semibold">
                Today's Progress
              </Text>
              <Text className="text-lg font-medium text-[var(--text-primary)] tabular-nums">
                {stats.completionRate}%
              </Text>
            </div>
            <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${stats.completionRate}%` }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full bg-[var(--accent)] shadow-[0_0_12px_var(--accent)]"
              />
            </div>
          </div>

          {/* Focus Widget */}
          <FocusWidget />
        </div>

        <div className="xl:col-span-1 h-full min-h-[300px]">
          <MiniCalendarWidget tasks={tasks} />
        </div>
      </motion.div>

      {/* First Grid Row: Projects & Deadlines */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        <div className="h-[320px]">
          <ProjectsOverview />
        </div>
        <div className="h-[320px]">
          <UpcomingDeadlines tasks={tasks} isLoading={isTasksLoading} />
        </div>
      </motion.div>

      {/* Second Grid Row: Recent Activity & Workload */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-5">
        <div className="h-[320px]">
          <RecentTasksList tasks={recentTasks} isLoading={isTasksLoading} />
        </div>
        <div className="h-[320px]">
          <WorkloadMatrix data={stats.workloadData} />
        </div>
      </motion.div>

    </motion.div>
  )
}
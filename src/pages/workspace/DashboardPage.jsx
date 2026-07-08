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
      className="space-y-6 md:space-y-8 pb-12 pr-2"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-1">
        <Heading level={2} className="tracking-tight">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}.
        </Heading>
        <Text variant="muted">Here is what's happening with your workspace today.</Text>
      </motion.div>

      {/* Today's Progress */}
      <motion.div variants={itemVariants} className="bg-[var(--bg-elevated)] p-6 rounded-2xl border border-[var(--color-border-subtle)] shadow-sm">
        <div className="flex justify-between items-end mb-4">
          <Text variant="muted" className="uppercase tracking-widest text-xs font-semibold">
            Today's Progress
          </Text>
          <Text className="text-2xl font-light text-[var(--text-primary)]">
            {stats.completionRate}%
          </Text>
        </div>
        <div className="h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-[var(--accent-cyan)] shadow-[0_0_10px_var(--accent-cyan)]"
          />
        </div>
      </motion.div>

      {/* Focus Widget */}
      <motion.div variants={itemVariants}>
        <FocusWidget />
      </motion.div>

      {/* First Grid Row: Projects & Deadlines */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="h-[350px]">
          <ProjectsOverview />
        </div>
        <div className="h-[350px]">
          <UpcomingDeadlines tasks={tasks} isLoading={isTasksLoading} />
        </div>
      </motion.div>

      {/* Second Grid Row: Recent Activity & Workload */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
        <div className="h-[350px]">
          <RecentTasksList tasks={recentTasks} isLoading={isTasksLoading} />
        </div>
        <div className="h-[350px]">
          <WorkloadMatrix data={stats.workloadData} />
        </div>
      </motion.div>

    </motion.div>
  )
}

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Spinner } from '@/shared/ui/Spinner'
import { useDashboardStats } from '@/features/analytics/hooks/useDashboard'
import { StatCard } from '@/features/analytics/components/StatCard'
import { CompletionChart, PriorityChart } from '@/features/analytics/components/Charts'
import { CheckCircle2, TrendingUp, PlusCircle, AlertCircle, Clock, ShieldAlert, Timer, BarChart3, LayoutDashboard } from 'lucide-react'

// Animation configurations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function AnalyticsPage() {
  const { data: rawStats, isLoading, isError } = useDashboardStats()

  const stats = useMemo(() => {
    if (!rawStats) return null

    return {
      completionRate: rawStats.myCompletionRate || rawStats.completionRate || 0,
      totalTasks: rawStats.totalTasks || 0,
      doneCount: rawStats.doneCount || 0,
      overdueCount: rawStats.overdueCount || 0,
      todoCount: rawStats.todoCount || 0,
      inReviewCount: rawStats.inReviewCount || 0,
      revisionsCount: rawStats.revisionsCount || 0,
      assignedToMe: rawStats.assignedToMeCount || 0,
      priorityData: (rawStats.statusBreakdown || []).map((s) => ({
        name: s.status,
        value: s.count,
        color: s.color,
      })),
      // Mocked historical data for the chart since the backend doesn't provide it yet
      historicalData: [
        { name: 'Mon', completed: Math.round((rawStats.doneCount || 0) * 0.2) },
        { name: 'Tue', completed: Math.round((rawStats.doneCount || 0) * 0.5) },
        { name: 'Wed', completed: Math.round((rawStats.doneCount || 0) * 0.4) },
        { name: 'Thu', completed: Math.round((rawStats.doneCount || 0) * 0.8) },
        { name: 'Fri', completed: Math.round((rawStats.doneCount || 0) * 0.9) },
        { name: 'Sat', completed: Math.round((rawStats.doneCount || 0) * 1.0) },
        { name: 'Sun', completed: rawStats.doneCount || 0 },
      ]
    }
  }, [rawStats])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-8">
          <Heading level={2} className="tracking-tight text-[24px] font-semibold mb-1.5 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
            Analytics Engine
          </Heading>
          <Text variant="muted" className="text-[14px]">Fetching real-time metrics and progress insights.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <Spinner size="xl" className="text-[var(--accent)]" />
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-8">
          <Heading level={2} className="tracking-tight text-[24px] font-semibold mb-1.5 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
            Analytics Engine
          </Heading>
          <Text variant="muted" className="text-[14px]">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-lg rounded-[var(--radius-xl)] p-12 max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-5 text-[var(--danger)]">
              <AlertCircle className="w-7 h-7" />
            </div>
            <Heading level={3} className="text-[18px]">Failed to sync data</Heading>
            <Text variant="muted" className="mt-2 text-[14px] leading-relaxed">
              Unable to reach the analytics server. Please check your connection and try again.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalTasks === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-100px)]">
        <div className="mb-8">
          <Heading level={2} className="tracking-tight text-[24px] font-semibold mb-1.5 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" />
            Analytics Engine
          </Heading>
          <Text variant="muted" className="text-[14px]">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 backdrop-blur-xl shadow-lg rounded-[var(--radius-xl)] p-12 max-w-md">
            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-5 text-[var(--text-muted)]">
              <BarChart3 className="w-7 h-7" />
            </div>
            <Heading level={3} className="text-[18px]">No metrics available</Heading>
            <Text variant="muted" className="mt-2 text-[14px] leading-relaxed">
              Create and complete tasks in this workspace to start generating real-time analytics.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-12" role="region" aria-label="Analytics">

      <div className="mb-8">
        <Heading level={1} className="tracking-tight text-[24px] font-semibold mb-1.5 flex items-center gap-2">
          <LayoutDashboard className="w-5 h-5 text-[var(--accent)]" aria-hidden="true" />
          Analytics Engine
        </Heading>
        <Text variant="muted" className="text-[14px]">Measure your progress. Optimize your workflow.</Text>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8"
      >
        <motion.div variants={itemVariants}>
          <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle2} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Total Workload" value={stats.totalTasks} icon={PlusCircle} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Assigned to Me" value={stats.assignedToMe} icon={Clock} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="In Review" value={stats.inReviewCount} icon={TrendingUp} />
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <StatCard
            title="Overdue Tasks"
            value={stats.overdueCount}
            icon={AlertCircle}
            trend={stats.overdueCount > 0 ? -1 : 0}
            description="Needs attention"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Revisions Needed" value={stats.revisionsCount} icon={ShieldAlert} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Active To-Do" value={stats.todoCount} icon={Timer} />
        </motion.div>
        <motion.div variants={itemVariants}>
          <StatCard title="Successfully Done" value={stats.doneCount} icon={CheckCircle2} />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <CompletionChart data={stats.historicalData} />
        </div>
        <div className="lg:col-span-1">
          <PriorityChart data={stats.priorityData} />
        </div>
      </motion.div>

    </div>
  )
}
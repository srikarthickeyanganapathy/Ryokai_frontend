import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Spinner } from '@/shared/ui/Spinner'
import { useDashboardStats } from '@/features/analytics/hooks/useDashboard'
import { StatCard } from '@/features/analytics/components/StatCard'
import { CompletionChart, PriorityChart } from '@/features/analytics/components/Charts'
import { CheckCircle2, TrendingUp, PlusCircle, AlertCircle, Clock, ShieldAlert, Timer, BarChart3 } from 'lucide-react'

// Status colors are provided directly by the backend (DashboardStatsDTO.statusBreakdown[].color)
// so the chart stays in sync with whatever palette the API defines, instead of guessing locally.
export function AnalyticsPage() {
  const { data: rawStats, isLoading, isError } = useDashboardStats()

  const stats = useMemo(() => {
    if (!rawStats) return null

    return {
      completionRate: rawStats.myCompletionRate || 0,
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
    }
  }, [rawStats])

  if (isLoading) {
    return (
      <div className="flex flex-col pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Analytics</Heading>
          <Text variant="muted" className="text-[13px]">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-3">
            <Spinner size="lg" />
            <Text variant="muted" className="text-[13px]">Loading analytics...</Text>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Analytics</Heading>
          <Text variant="muted" className="text-[13px]">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-12 max-w-md">
            <div className="w-12 h-12 rounded-full bg-[var(--danger-soft)] flex items-center justify-center mx-auto mb-4 text-[var(--danger)]">
              <AlertCircle className="w-6 h-6" />
            </div>
            <Heading level={3}>Failed to load analytics</Heading>
            <Text variant="muted" className="mt-2 text-[13px]">
              Unable to fetch task data. Please check your connection and try again.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalTasks === 0) {
    return (
      <div className="flex flex-col pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Analytics</Heading>
          <Text variant="muted" className="text-[13px]">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-[var(--radius-lg)] p-12 max-w-md">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <Heading level={3}>No data yet</Heading>
            <Text variant="muted" className="mt-2 text-[13px]">
              Create some tasks to start seeing your analytics and progress insights.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col pb-10">

      <div className="mb-6">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold mb-1">Analytics</Heading>
        <Text variant="muted" className="text-[13px]">Measure your progress. Optimize your workflow.</Text>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        <StatCard title="Completion Rate" value={`${stats.completionRate}%`} icon={CheckCircle2} />
        <StatCard title="Total Tasks" value={stats.totalTasks} icon={PlusCircle} />
        <StatCard title="Assigned to Me" value={stats.assignedToMe} icon={Clock} />
        <StatCard title="In Review" value={stats.inReviewCount} icon={TrendingUp} />
        <StatCard
          title="Overdue"
          value={stats.overdueCount}
          icon={AlertCircle}
          trend={stats.overdueCount > 0 ? -1 : 0}
        />
        <StatCard title="Needs Work" value={stats.revisionsCount} icon={ShieldAlert} />
        <StatCard title="To Do" value={stats.todoCount} icon={Timer} />
        <StatCard title="Done" value={stats.doneCount} icon={CheckCircle2} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2">
          <CompletionChart rate={stats.completionRate} />
        </div>
        <div className="lg:col-span-1">
          <PriorityChart data={stats.priorityData} />
        </div>
      </motion.div>

    </div>
  )
}
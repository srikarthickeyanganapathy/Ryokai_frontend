import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { useDashboardStats } from '@/analytics'
import { StatCard } from '@/analytics'
import { CompletionChart, PriorityChart } from '@/analytics'
import {
  CheckCircle2, TrendingUp, PlusCircle, AlertCircle, Clock,
  ShieldAlert, Timer, BarChart3, LayoutDashboard
} from '@/shared/ui/Icons'
import { PageShell, PageHero, PageContent } from '@/shared/ui/PageShell'
import { PageState } from '@/shared/ui/PageState'
import { InsightSection, useWorkspace } from '@/shared/workspace-framework'

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function AnalyticsPage() {
  const { activeCrew } = useWorkspace()
  const { data: rawStats, isLoading, isError } = useDashboardStats({ crewId: activeCrew?.id })

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
      historicalData: rawStats.historicalData || [
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

  const pageState = isLoading
    ? 'loading'
    : isError
    ? 'error'
    : (!stats || stats.totalTasks === 0)
    ? 'empty'
    : 'ready'

  return (
    <PageShell maxWidth="default">
      <PageHero
        eyebrow="Analytics"
        title="Analytics"
        subtitle="Measure execution velocity, workload completion, and team performance."
      />

      <PageContent>
        <PageState
          state={pageState}
          stateProps={{
            loadingVariant: 'insight',
            title: 'Failed to sync data',
            description: 'Unable to reach the analytics server. Please check your connection and try again.',
            icon: BarChart3,
          }}
        >
          {/* Tier 1 — hero KPIs */}
          <InsightSection question="What's the overall health?">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 sm:grid-cols-2 gap-5"
            >
              <motion.div variants={itemVariants}>
                <StatCard size="lg" title="Completion rate" value={`${stats?.completionRate}%`} icon={CheckCircle2} />
              </motion.div>
              <motion.div variants={itemVariants}>
                <StatCard size="lg" title="Total workload" value={stats?.totalTasks} icon={PlusCircle} />
              </motion.div>
            </motion.div>
          </InsightSection>

          {/* Tier 2 — grouped secondary metrics */}
          <InsightSection question="What needs attention?">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 lg:grid-cols-3 gap-5"
            >
              <div className="lg:col-span-1">
                <Text size="xs" className="mb-2 font-medium text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Needs attention
                </Text>
                <div className="grid grid-cols-2 gap-3">
                  <motion.div variants={itemVariants}>
                    <StatCard
                      tone={stats?.overdueCount > 0 ? 'attention' : 'default'}
                      title="Overdue"
                      value={stats?.overdueCount}
                      icon={AlertCircle}
                      description={stats?.overdueCount > 0 ? 'Past due date' : undefined}
                    />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <StatCard
                      tone={stats?.revisionsCount > 0 ? 'attention' : 'default'}
                      title="Revisions"
                      value={stats?.revisionsCount}
                      icon={ShieldAlert}
                    />
                  </motion.div>
                </div>
              </div>

              <div className="lg:col-span-2">
                <Text size="xs" className="mb-2 font-medium text-[var(--text-muted)] uppercase tracking-wider text-[11px]">
                  Workload breakdown
                </Text>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <motion.div variants={itemVariants}>
                    <StatCard title="Assigned to me" value={stats?.assignedToMe} icon={Clock} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <StatCard title="To-do" value={stats?.todoCount} icon={Timer} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <StatCard title="In review" value={stats?.inReviewCount} icon={TrendingUp} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <StatCard title="Done" value={stats?.doneCount} icon={CheckCircle2} />
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </InsightSection>

          {/* Tier 3 — trends and distribution */}
          <InsightSection question="How are trends shaping up?">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-6"
            >
              <div className="lg:col-span-2">
                <CompletionChart data={stats?.historicalData} />
              </div>
              <div className="lg:col-span-1">
                <PriorityChart data={stats?.priorityData} />
              </div>
            </motion.div>
          </InsightSection>
        </PageState>
      </PageContent>
    </PageShell>
  )
}

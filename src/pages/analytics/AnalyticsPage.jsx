import React, { useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { useDashboardStats } from '@/features/analytics/hooks/useDashboard'
import { StatCard } from '@/features/analytics/components/StatCard'
import { 
  CompletionChart, 
  PriorityChart, 
  ProductivityChart 
} from '@/features/analytics/components/Charts'
import { CheckCircle2, TrendingUp, PlusCircle, AlertCircle, Clock, ShieldAlert, Timer, BarChart3 } from 'lucide-react'

export function AnalyticsPage() {
  const { data: rawStats, isLoading, isError } = useDashboardStats()

  const stats = useMemo(() => {
    if (!rawStats) return null

    // Mapping DashboardStatsDTO from backend to UI expected format
    return {
      completionRate: rawStats.myCompletionRate || 0,
      velocity: rawStats.doneCount || 0, // Using doneCount as proxy for velocity for now
      created: rawStats.totalTasks || 0,
      finished: rawStats.doneCount || 0,
      overdue: rawStats.overdueCount || 0,
      dueToday: rawStats.todoCount || 0, // Mocking dueToday with todoCount
      blocked: rawStats.revisionsCount || 0, // Using revisionsCount for blocked proxy
      avgTime: 0, // Backend doesn't provide this yet
      
      // Formatting status breakdown for priority chart (mock mapping)
      priorityData: rawStats.statusBreakdown ? rawStats.statusBreakdown.map(s => ({
        name: s.status,
        value: s.count
      })) : [],
      
      // Empty mock for weekly data since backend doesn't provide it yet
      weeklyData: []
    }
  }, [rawStats])

  if (isLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight mb-1">Analytics</Heading>
          <Text variant="muted">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center space-y-3">
            <div className="w-8 h-8 border-2 border-[var(--accent-cyan)] border-t-transparent rounded-full animate-spin mx-auto" />
            <Text variant="muted">Loading analytics...</Text>
          </div>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight mb-1">Analytics</Heading>
          <Text variant="muted">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-12 max-w-md">
            <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4 text-red-500">
              <AlertCircle className="w-6 h-6" />
            </div>
            <Heading level={3}>Failed to load analytics</Heading>
            <Text variant="muted" className="mt-2">
              Unable to fetch task data. Please check your connection and try again.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  if (!stats || stats.created === 0) {
    return (
      <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10">
        <div className="mb-6">
          <Heading level={2} className="tracking-tight mb-1">Analytics</Heading>
          <Text variant="muted">Measure your progress. Optimize your workflow.</Text>
        </div>
        <div className="flex items-center justify-center flex-1">
          <div className="text-center bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] rounded-xl p-12 max-w-md">
            <div className="w-12 h-12 rounded-full bg-[var(--bg-subtle)] flex items-center justify-center mx-auto mb-4 text-[var(--text-muted)]">
              <BarChart3 className="w-6 h-6" />
            </div>
            <Heading level={3}>No data yet</Heading>
            <Text variant="muted" className="mt-2">
              Create some tasks to start seeing your analytics and progress insights.
            </Text>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] overflow-y-auto pr-2 pb-10">
      
      {/* Header */}
      <div className="mb-6">
        <Heading level={2} className="tracking-tight mb-1">Analytics</Heading>
        <Text variant="muted">Measure your progress. Optimize your workflow.</Text>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard 
          title="Completion Rate" 
          value={`${stats.completionRate}%`} 
          icon={CheckCircle2} 
          trend={+5} 
        />
        <StatCard 
          title="Velocity (Total Done)" 
          value={stats.velocity} 
          icon={TrendingUp} 
          trend={+12} 
        />
        <StatCard 
          title="Average Time" 
          value={`${stats.avgTime}h`} 
          icon={Timer} 
          trend={0} 
        />
        <StatCard 
          title="Assigned" 
          value={stats.dueToday} 
          icon={Clock} 
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats.overdue} 
          icon={AlertCircle} 
          trend={stats.overdue > 0 ? -1 : 0} 
        />
        <StatCard 
          title="Rejected" 
          value={stats.blocked} 
          icon={ShieldAlert} 
        />
        <StatCard 
          title="Tasks Created" 
          value={stats.created} 
          icon={PlusCircle} 
        />
        <StatCard 
          title="Tasks Finished" 
          value={stats.finished} 
          icon={CheckCircle2} 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompletionChart />
        </div>
        <div className="lg:col-span-1">
          <PriorityChart data={stats.priorityData} />
        </div>
        <div className="lg:col-span-3">
          <ProductivityChart data={stats.weeklyData} />
        </div>
      </div>
      
    </div>
  )
}

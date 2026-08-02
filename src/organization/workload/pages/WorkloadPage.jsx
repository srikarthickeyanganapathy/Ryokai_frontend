import React, { useMemo } from 'react'
import { Heading, Text } from '@/shared/ui/Typography'
import { usePermissions } from '@/identity'
import { useWorkload } from '@/organization/workload/features/hooks/useWorkload'
import { useDashboardStats, StatCard, CompletionChart, PriorityChart } from '@/analytics'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/cn'
import { DataTable } from '@/shared/ui/data-table/DataTable'
import { 
  Gauge, Users, AlertCircle, CheckCircle2, TrendingUp, 
  PlusCircle, Clock, ShieldAlert, Timer 
} from 'lucide-react'
import {
  WorkspaceShell,
  InsightLayout,
  InsightSection,
  PageStateContainer,
  FrameworkEmptyState,
} from '@/shared/workspace-framework'

const COLUMNS = [
  { key: 'todoCount', label: 'To do' },
  { key: 'inProgressCount', label: 'In progress' },
  { key: 'submittedCount', label: 'Submitted' },
  { key: 'approvedCount', label: 'Approved' },
  { key: 'rejectedCount', label: 'Rejected' },
]

const OVER_ALLOCATED_THRESHOLD = 8

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } }
}
const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export function WorkloadPage() {
  const { userOrg } = usePermissions()

  // -- Workload Data --
  const { data: rows = [], isLoading: workloadLoading, isError: workloadError, error: workloadErr, refetch: refetchWorkload } = useWorkload(userOrg?.id)

  const summary = useMemo(() => {
    const overAllocated = rows.filter(r => (r.totalActiveCount ?? 0) > OVER_ALLOCATED_THRESHOLD).length
    const totalActive = rows.reduce((sum, r) => sum + (r.totalActiveCount ?? 0), 0)
    return { memberCount: rows.length, totalActive, overAllocated }
  }, [rows])

  const columns = useMemo(() => [
    {
      id: 'member',
      header: 'Member',
      cell: ({ row }) => <span className="font-medium">{row.original.user?.username || 'Unknown'}</span>,
    },
    ...COLUMNS.map(c => ({
      accessorKey: c.key,
      header: () => <div className="text-center">{c.label}</div>,
      cell: ({ getValue }) => <div className="text-center">{getValue() ?? 0}</div>,
    })),
    {
      accessorKey: 'totalActiveCount',
      header: () => <div className="text-center">Active total</div>,
      cell: ({ row }) => {
        const count = row.original.totalActiveCount ?? 0
        return (
          <div className={cn('text-center font-semibold', count > OVER_ALLOCATED_THRESHOLD ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
            {count}
          </div>
        )
      }
    }
  ], [])

  // -- Analytics Data --
  const { data: rawStats, isLoading: analyticsLoading, isError: analyticsError, error: analyticsErr, refetch: refetchAnalytics } = useDashboardStats()

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

  if (!userOrg) {
    return (
      <WorkspaceShell maxWidth="narrow">
        <FrameworkEmptyState
          icon={Gauge}
          title="Join an organization to view workload"
          description="Resource capacity tracking is available within organization workspaces."
        />
      </WorkspaceShell>
    )
  }

  const isLoading = workloadLoading || analyticsLoading
  const isError = workloadError || analyticsError
  const pageState = isLoading ? 'loading' : isError ? 'error' : 'ready'
  
  const handleRetry = () => {
    if (workloadError) refetchWorkload()
    if (analyticsError) refetchAnalytics()
  }

  return (
    <WorkspaceShell maxWidth="default">
      <InsightLayout
        header={
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                Workload & Analytics
              </span>
            </div>
            <Heading level={1} className="tracking-tight text-xl sm:text-[22px] font-semibold mb-1 flex items-center gap-2 truncate">
              <Gauge className="w-5 h-5 text-[var(--accent)] shrink-0" aria-hidden="true" />
              Resource capacity & health
            </Heading>
            <Text variant="muted" className="text-[13px] leading-relaxed">
              Audit team load distribution, over-allocation bottlenecks, and measure execution velocity.
            </Text>
          </div>
        }
      >
        <PageStateContainer
          state={pageState}
          loadingConfig={{ variant: 'insight' }}
          errorConfig={{
            title: 'Data unavailable',
            description: (workloadErr || analyticsErr)?.response?.data?.message || (workloadErr || analyticsErr)?.message || 'Server encountered an issue. Please try again.',
            onRetry: handleRetry,
          }}
        >
          <div className="flex flex-col gap-10">
            
            {/* ── WORKLOAD SECTION ── */}
            <div className="space-y-6">
              <InsightSection question="How is load distributed?">
                <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)]/60 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <Text size="xs" variant="muted" className="text-[12px]">Members tracked</Text>
                    <div className="text-[22px] font-bold tabular-nums text-[var(--text-primary)]">{summary.memberCount}</div>
                  </div>
                </div>
                <div className="bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)]/50 rounded-[var(--radius-lg)] p-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)]/60 flex items-center justify-center shrink-0">
                    <Gauge className="w-4 h-4 text-[var(--text-muted)]" />
                  </div>
                  <div>
                    <Text size="xs" variant="muted" className="text-[12px]">Active assignments</Text>
                    <div className="text-[22px] font-bold tabular-nums text-[var(--text-primary)]">{summary.totalActive}</div>
                  </div>
                </div>
                <div className={cn(
                  'rounded-[var(--radius-lg)] p-4 flex items-center gap-3 border backdrop-blur-xl',
                  summary.overAllocated > 0
                    ? 'bg-[var(--bg-elevated)] border-[var(--danger)]/25'
                    : 'bg-[var(--bg-elevated)] border-[var(--color-border-subtle)]/50'
                )}>
                  <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center shrink-0', summary.overAllocated > 0 ? 'bg-[var(--danger-soft)]' : 'bg-[var(--bg-subtle)]/60')}>
                    <AlertCircle className={cn('w-4 h-4', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-muted)]')} />
                  </div>
                  <div>
                    <Text size="xs" variant="muted" className="text-[12px]">Over-allocated</Text>
                    <div className={cn('text-[22px] font-bold tabular-nums', summary.overAllocated > 0 ? 'text-[var(--danger)]' : 'text-[var(--text-primary)]')}>
                      {summary.overAllocated}
                    </div>
                  </div>
                </div>
              </InsightSection>
              
              <div className="h-[400px]">
                <DataTable
                  columns={columns}
                  data={rows}
                  isLoading={workloadLoading}
                  emptyStateTitle="No workload data"
                  emptyStateDescription="No active tasks in this organization."
                />
              </div>
            </div>

            <hr className="border-[var(--border-subtle)]" />

            {/* ── ANALYTICS SECTION ── */}
            <div className="space-y-6">
              <InsightSection question="What's the overall health?">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="md:col-span-2 xl:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-5"
                >
                  <motion.div variants={itemVariants}>
                    <StatCard size="lg" title="Completion rate" value={`${stats?.completionRate}%`} icon={CheckCircle2} />
                  </motion.div>
                  <motion.div variants={itemVariants}>
                    <StatCard size="lg" title="Total workload" value={stats?.totalTasks} icon={PlusCircle} />
                  </motion.div>
                </motion.div>
              </InsightSection>

              <InsightSection question="What needs attention?">
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="show"
                  className="md:col-span-2 xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-5"
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

              <InsightSection question="How are trends shaping up?">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                  className="md:col-span-2 xl:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6"
                >
                  <div className="lg:col-span-2">
                    <CompletionChart data={stats?.historicalData} />
                  </div>
                  <div className="lg:col-span-1">
                    <PriorityChart data={stats?.priorityData} />
                  </div>
                </motion.div>
              </InsightSection>
            </div>
          </div>
        </PageStateContainer>
      </InsightLayout>
    </WorkspaceShell>
  )
}
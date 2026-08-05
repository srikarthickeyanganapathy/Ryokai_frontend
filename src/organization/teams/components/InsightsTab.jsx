import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { FolderIcon, CheckCircle2, AlertCircle, Users } from 'lucide-react'

// Minimalist SVG Donut Chart for Task Status
function StatusDonut({ completed, total }) {
  const radius = 60;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const percentage = total > 0 ? (completed / total) * 100 : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 150 150">
        <circle cx="75" cy="75" r={radius} stroke="var(--bg-subtle)" strokeWidth={strokeWidth} fill="none" />
        <circle
          cx="75" cy="75" r={radius} stroke="var(--success)" strokeWidth={strokeWidth}
          strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
          strokeLinecap="round" fill="none" className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-3xl font-extrabold tracking-tight tabular-nums text-[var(--text-primary)]">{Math.round(percentage)}%</span>
        <span className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Completed</span>
      </div>
    </div>
  );
}

export function InsightsTab({ teamTasks, teamProjects, insights }) {
  // Calculate priority breakdown safely
  const priorityBreakdown = useMemo(() => {
    const counts = teamTasks.reduce((acc, t) => {
      if (t.status === 'Done' || t.archived) return acc;
      const p = normalizePriority(t.priority) || 'Medium';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    
    const order = ['Urgent', 'High', 'Medium', 'Low'].filter(p => counts[p]);
    const max = order.length > 0 ? Math.max(...order.map(p => counts[p])) : 1;
    
    return order.map(p => ({ name: p, count: counts[p], pct: Math.round((counts[p] / max) * 100) }));
  }, [teamTasks]);

  const isDataEmpty = teamTasks.length === 0 && teamProjects.length === 0;

  if (isDataEmpty) {
    return (
      <div className="px-6 py-16 max-w-4xl mx-auto">
        <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border-subtle)] rounded-2xl p-10 text-center">
          <AlertCircle className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-4" />
          <Heading level={4} className="text-[var(--text-secondary)] mb-2">No Analytics Available</Heading>
          <Text variant="muted" className="text-sm">Start adding tasks and projects to generate team insights.</Text>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto space-y-6">
      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Card 1: Completion Donut (Large) */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center lg:col-span-1"
        >
          <Heading level={4} className="text-[14px] font-bold tracking-tight mb-6">Task Completion</Heading>
          <StatusDonut completed={insights.doneCount} total={insights.total} />
          <div className="flex items-center gap-4 mt-6 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--success)]"></span>
              <Text size="xs" variant="muted">{insights.doneCount} Done</Text>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[var(--bg-subtle)]"></span>
              <Text size="xs" variant="muted">{insights.activeCount} Active</Text>
            </div>
          </div>
        </motion.div>

        {/* Card 2: Key Metrics Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm lg:col-span-2"
        >
          <Heading level={4} className="text-[14px] font-bold tracking-tight mb-6">Team Summary</Heading>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <CheckCircle2 className="w-3 h-3" /> <span className="text-[10px] font-medium uppercase tracking-wider">Total Tasks</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{insights.total}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <AlertCircle className="w-3 h-3 text-amber-500" /> <span className="text-[10px] font-medium uppercase tracking-wider">High Priority</span>
              </div>
              <div className="text-2xl font-bold text-amber-500 tabular-nums">{insights.highPriorityCount}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <FolderIcon className="w-3 h-3 text-blue-500" /> <span className="text-[10px] font-medium uppercase tracking-wider">Active Projects</span>
              </div>
              <div className="text-2xl font-bold text-[var(--text-primary)] tabular-nums">{insights.activeProjectsCount}</div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                <Users className="w-3 h-3 text-[var(--accent)]" /> <span className="text-[10px] font-medium uppercase tracking-wider">Busiest Member</span>
              </div>
              <div className="text-md font-bold text-[var(--text-primary)] truncate">{insights.busiestMember || '—'}</div>
            </div>
          </div>
        </motion.div>

        {/* Card 3: Priority Breakdown */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm lg:col-span-2"
        >
          <Heading level={4} className="text-[14px] font-bold tracking-tight mb-6">Active Tasks by Priority</Heading>
          
          {priorityBreakdown.length === 0 ? (
            <Text size="sm" variant="muted" className="italic py-4 block">No active tasks to break down.</Text>
          ) : (
            <div className="space-y-4">
              {priorityBreakdown.map(p => {
                const colors = {
                  Urgent: { bar: 'bg-red-500', text: 'text-red-500' },
                  High: { bar: 'bg-orange-500', text: 'text-orange-500' },
                  Medium: { bar: 'bg-yellow-500', text: 'text-yellow-500' },
                  Low: { bar: 'bg-blue-500', text: 'text-blue-500' }
                };
                const c = colors[p.name] || colors.Medium;

                return (
                  <div key={p.name}>
                    <div className="flex items-center justify-between text-[11px] mb-1.5">
                      <span className={cn("font-semibold uppercase tracking-wider", c.text)}>{p.name}</span>
                      <span className="text-[var(--text-muted)] tabular-nums font-medium">{p.count}</span>
                    </div>
                    <div className="h-2 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${p.pct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className={cn("h-full rounded-full", c.bar)} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        {/* Card 4: Workload Balance */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-6 shadow-sm flex flex-col justify-center items-center text-center lg:col-span-1"
        >
          <Heading level={4} className="text-[14px] font-bold tracking-tight mb-4">Workload Balance</Heading>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="var(--bg-subtle)" strokeWidth="10" fill="none" />
              <circle 
                cx="50" cy="50" r="40" 
                stroke={insights.balanceScore > 70 ? 'var(--success)' : 'var(--warning)'} 
                strokeWidth="10" fill="none" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 40}`} 
                strokeDashoffset={`${2 * Math.PI * 40 - (insights.balanceScore / 100) * 2 * Math.PI * 40}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-primary)]">{insights.balanceScore}%</span>
            </div>
          </div>
          <Text size="xs" variant="muted" className="mt-4 max-w-[180px]">
            {insights.balanceScore > 70 ? 'Tasks are evenly distributed across the team.' : 'Workload is slightly imbalanced. Consider reassigning tasks.'}
          </Text>
        </motion.div>

      </div>
    </div>
  );
}
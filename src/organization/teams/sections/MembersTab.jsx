import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Heading, Text } from '@/shared/ui/Typography'
import { Button } from '@/shared/ui/Button'
import { Icons } from '@/shared/ui/Icons'
import { cn } from '@/shared/lib/cn'
import { PermissionButton } from '../components/Shared'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { Users } from 'lucide-react'

export function MembersTab({ team, workload, teamTasks, hasProjectIdOnTasks, hasTaskTimestamps, canManage, onManageMembers }) {
  const members = team?.members || [];
  
  // Calculate max workload to normalize progress bars
  const maxWorkload = useMemo(() => {
    const values = Object.values(workload);
    return values.length > 0 ? Math.max(...values, 1) : 1;
  }, [workload]);

  if (members.length === 0) {
    return (
      <div className="py-16">
        <ImmersiveEmptyState
          icon={Users}
          title="No members in this team yet"
          description="Invite members from your organization to start collaborating on tasks and projects."
          action={canManage ? <Button onClick={onManageMembers}>Manage Members</Button> : null}
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1200px] mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Heading level={3} className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
            Team Roster
          </Heading>
          <Text size="sm" variant="muted" className="mt-1">
            {members.length} member{members.length === 1 ? '' : 's'} currently assigned to this team.
          </Text>
        </div>
        <PermissionButton 
          allowed={canManage} 
          reason="You don't have permission to manage team members." 
          onClick={onManageMembers} 
          icon={Icons.users}
          variant="outline"
          className="bg-[var(--bg-card)] hover:bg-[var(--bg-subtle)] border-[var(--border-subtle)] text-sm font-medium h-9 px-4"
        >
          Manage Roster
        </PermissionButton>
      </div>

      <motion.div 
        initial="hidden" 
        animate="visible" 
        variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
      >
        {members.map(m => {
          const taskCount = workload[m.username] || 0;
          const workloadPct = Math.min(100, Math.round((taskCount / maxWorkload) * 100));
          
          // Determine tone based on task count
          const tone = taskCount > 5 ? 'danger' : taskCount > 3 ? 'warning' : 'accent';
          const barColor = tone === 'danger' ? 'bg-red-500' : tone === 'warning' ? 'bg-amber-500' : 'bg-[var(--accent)]';
          const textColor = tone === 'danger' ? 'text-red-500' : tone === 'warning' ? 'text-amber-500' : 'text-[var(--text-muted)]';

          // Generate soft avatar background
          const hash = m.username?.split('').reduce((acc, char) => char.charCodeAt(0) + ((acc << 5) - acc), 0) || 0;
          const hue1 = Math.abs(hash) % 360;
          const hue2 = (hue1 + 40) % 360;

          return (
            <motion.div
              key={m.id}
              variants={{ hidden: { opacity: 0, y: 15 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } } }}
              className="group relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl p-5 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-300 flex flex-col"
            >
              <div className="flex items-center gap-4 mb-4">
                {/* Soft Gradient Avatar */}
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white shadow-sm ring-1 ring-black/5 shrink-0"
                  style={{ background: `linear-gradient(135deg, hsl(${hue1} 70% 60%), hsl(${hue2} 70% 45%))` }}
                >
                  {m.username?.charAt(0).toUpperCase() || '?'}
                </div>
                
                <div className="min-w-0 flex-1">
                  <Heading level={4} className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                    {m.username}
                  </Heading>
                  <Text size="xs" variant="muted" className="capitalize">
                    {m.orgRole?.toLowerCase() || 'team member'}
                  </Text>
                </div>
              </div>

              {/* Workload Visualization */}
              <div className="mt-auto pt-4 border-t border-[var(--border-subtle)]/50">
                <div className="flex items-center justify-between mb-1.5">
                  <Text size="xs" variant="muted" className="font-medium uppercase tracking-wider">
                    Active Workload
                  </Text>
                  <Text size="xs" className={cn("font-semibold tabular-nums", textColor)}>
                    {taskCount} {taskCount === 1 ? 'Task' : 'Tasks'}
                  </Text>
                </div>
                <div className="h-1.5 w-full bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${workloadPct}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={cn("h-full rounded-full", barColor)} 
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
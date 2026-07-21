import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useTaskList, useCompletePersonalTask, useSubmitTask } from '@/features/tasks/hooks/useTasks';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { EmptyDashboardState } from '@/widgets/workspace/EmptyDashboardState';
import { selectWorkloadMatrix } from '@/features/analytics/lib/selectors';
import { useDashboardWidgets } from './useDashboardWidgets.jsx';
import { cn } from '@/shared/lib/cn';
import { useCreateOrganization } from '@/features/organizations/hooks/useOrganizations';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { OrganizationForm } from '@/widgets/organizations/OrganizationForm';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Icons } from '@/shared/ui/Icons';
import { Play, ArrowRight, CheckCircle2, Sparkles, Plus, Clock, Target } from 'lucide-react';
import { isToday, parseISO } from 'date-fns';
import { isDoneStatus } from '@/shared/lib/status';
import { TaskPanel } from '@/widgets/tasks/TaskPanel';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 24 }
  }
};

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export function DashboardPage() {
  const { user } = useAuth();
  const { workspaceMode, activeOrganization, organizations } = useWorkspace();
  const { data: tasks = [], isLoading: isTasksLoading } = useTaskList();
  const navigate = useNavigate();
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const createOrgMutation = useCreateOrganization();
  const completePersonalTask = useCompletePersonalTask();
  const submitTask = useSubmitTask();

  const handleCreateOrg = (data) => {
    createOrgMutation.mutate(data, {
      onSuccess: () => setIsCreateOpen(false),
    });
  };

  // Compute Next Best Action Task (Top Priority / Due Today / In Progress)
  const { activeHeroTask, pendingCount, todayCount } = useMemo(() => {
    if (!tasks || tasks.length === 0) return { activeHeroTask: null, pendingCount: 0, todayCount: 0 };
    
    const pending = tasks.filter(t => !isDoneStatus(t.status) && t.status !== 'Canceled');
    const today = pending.filter(t => t.dueDate && isToday(parseISO(t.dueDate)));

    // Pick top priority active task
    const sorted = [...pending].sort((a, b) => {
      if (a.status === 'In Progress' && b.status !== 'In Progress') return -1;
      if (a.status !== 'In Progress' && b.status === 'In Progress') return 1;
      if (a.priority === 'URGENT' && b.priority !== 'URGENT') return -1;
      if (a.priority === 'HIGH' && b.priority !== 'HIGH') return -1;
      return 0;
    });

    return {
      activeHeroTask: sorted[0] || null,
      pendingCount: pending.length,
      todayCount: today.length
    };
  }, [tasks]);

  // Redirect to Crews dashboard if in CREWS mode
  if (workspaceMode === 'CREWS') {
    return <Navigate to="/app/crews" replace />;
  }

  const modeBadgeText = workspaceMode === 'ORG' && activeOrganization
    ? `Organization: ${activeOrganization.name}`
    : 'Personal Workspace';

  const widgetProps = {
    tasks,
    isLoading: isTasksLoading,
    data: workspaceMode === 'ORG' ? selectWorkloadMatrix(tasks) : undefined,
    onTaskClick: setSelectedTask
  };

  const widgets = useDashboardWidgets(workspaceMode);

  return (
    <motion.div 
      className="space-y-6 pb-12 max-w-7xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* 🧭 ORIENT MODE STICKY HEADER BAR */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--color-border-subtle)]">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Badge variant="outline" className="text-[10px] font-mono uppercase tracking-wider bg-[var(--accent-soft)] text-[var(--accent)] border-[var(--accent-border)]">
              {modeBadgeText}
            </Badge>
            <span className="text-[11px] text-[var(--text-muted)]">• Orient Mode</span>
          </div>
          <Heading level={2} className="tracking-tight text-[22px] font-semibold">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}.
          </Heading>
        </div>

        <div className="flex items-center gap-2">
          {workspaceMode === 'PERSONAL' && organizations?.length === 0 && (
            <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(true)} className="gap-1.5 text-xs">
              <Icons.workspace className="w-3.5 h-3.5" />
              Create Org
            </Button>
          )}
          <Button size="sm" className="gap-1.5" onClick={() => document.dispatchEvent(new CustomEvent('open-task-form'))}>
            <Plus className="w-4 h-4" />
            New Task
          </Button>
        </div>
      </motion.div>

      {/* ⚡ PROACTIVE HERO ACTION CARD ("See → Decide → Act") */}
      <motion.div variants={itemVariants} className="relative overflow-hidden p-6 rounded-2xl glass-panel border border-[var(--color-border-subtle)] bg-gradient-to-br from-[var(--bg-elevated)]/90 via-[var(--bg-elevated)]/60 to-[var(--bg-subtle)]/40 shadow-sm group">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-[var(--accent)]/10 rounded-full blur-3xl group-hover:bg-[var(--accent)]/20 transition-colors duration-[var(--duration-slow)] pointer-events-none" />

        {activeHeroTask ? (
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)] uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next Best Action</span>
                {todayCount > 0 && <span className="text-[var(--text-muted)]">• {todayCount} due today</span>}
              </div>
              <Heading level={3} className="text-xl font-semibold tracking-tight text-[var(--text-primary)]">
                {activeHeroTask.title}
              </Heading>
              <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)]">
                <Badge variant="outline" className="text-[10px] uppercase font-mono">{activeHeroTask.priority}</Badge>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  {activeHeroTask.timeEstimateMinutes ? `${activeHeroTask.timeEstimateMinutes}m estimate` : 'No estimate'}
                </span>
                {activeHeroTask.assignedTo && <span>Assignee: @{activeHeroTask.assignedTo}</span>}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full md:w-auto">
              <Button
                size="md"
                className="bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white rounded-xl gap-2 font-medium px-5 flex-1 md:flex-initial"
                onClick={() => navigate('/app/focus')}
              >
                <Play className="w-4 h-4 fill-current" />
                Resume in Focus
              </Button>
              <Button
                size="md"
                variant="outline"
                className="gap-2 rounded-xl text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 flex-1 md:flex-initial"
                onClick={() => {
                  if (activeHeroTask.isPersonal) {
                    completePersonalTask.mutate(activeHeroTask.id);
                  } else {
                    submitTask.mutate(activeHeroTask.id);
                  }
                }}
              >
                <CheckCircle2 className="w-4 h-4" />
                {activeHeroTask.isPersonal ? 'Complete' : 'Submit'}
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div>
              <Heading level={4} className="text-base font-semibold text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[var(--accent)]" />
                All caught up!
              </Heading>
              <Text variant="muted" className="text-xs mt-1">No active pending tasks. Create a new task or explore active projects.</Text>
            </div>
            <Button size="sm" onClick={() => document.dispatchEvent(new CustomEvent('open-task-form'))} className="gap-1.5">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>
        )}
      </motion.div>

      {/* 📊 ACTION CANVAS & TELEMETRY RAIL (70% Canvas / 30% Telemetry) */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Canvas (2 Columns on Large Screens) */}
        <div className="lg:col-span-2 space-y-6">
          {widgets.filter(w => ['recent', 'timeline', 'projects'].includes(w.id)).map(({ id, Component }) => (
            <div key={id} className="min-h-[220px]">
              <Component {...widgetProps} />
            </div>
          ))}
        </div>

        {/* Telemetry Rail (1 Column) */}
        <div className="space-y-6">
          {widgets.filter(w => ['progress', 'deadlines', 'workload', 'checklist', 'focus'].includes(w.id)).map(({ id, Component }) => (
            <div key={id}>
              <Component {...widgetProps} />
            </div>
          ))}
        </div>

      </motion.div>

      {/* Task Inspection Drawer */}
      <TaskPanel
        task={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />

      {/* Organization Creation Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create Organization</Heading>
          <OrganizationForm
            onSubmit={handleCreateOrg}
            isLoading={createOrgMutation.isPending}
          />
        </ModalContent>
      </Modal>
    </motion.div>
  );
}


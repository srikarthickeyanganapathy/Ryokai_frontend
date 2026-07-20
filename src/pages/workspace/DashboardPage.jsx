import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useWorkspace } from '@/app/providers/WorkspaceProvider';
import { useTaskList } from '@/features/tasks/hooks/useTasks';
import { Navigate } from 'react-router-dom';
import { EmptyDashboardState } from '@/widgets/workspace/EmptyDashboardState';
import { selectWorkloadMatrix, selectCompletionRate } from '@/features/analytics/lib/selectors';
import { useDashboardWidgets } from './useDashboardWidgets.jsx';
import { cn } from '@/shared/lib/cn';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
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
  const { workspaceMode, activeOrganization } = useWorkspace();
  const { data: tasks = [], isLoading: isTasksLoading } = useTaskList();
  
  const widgets = useDashboardWidgets(workspaceMode);

  // If user is in CREWS mode, redirect to the Crews Dashboard
  if (workspaceMode === 'CREWS') {
    return <Navigate to="/app/crews" replace />;
  }

  const subtitle = workspaceMode === 'ORG' && activeOrganization
    ? `Here's what's happening at ${activeOrganization.name} today.`
    : "Here's what's happening with your workspace today.";

  const hasTasks = tasks && tasks.length > 0;
  
  // We can inject common props to all widgets
  const widgetProps = {
    tasks,
    isLoading: isTasksLoading,
    data: workspaceMode === 'ORG' ? selectWorkloadMatrix(tasks) : undefined
  };

  return (
    <motion.div 
      className="space-y-5 md:space-y-6 pb-12 mesh-bg min-h-screen"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="space-y-0.5">
        <Heading level={2} className="tracking-tight text-[20px] font-semibold">
          {getGreeting()}, {user?.name?.split(' ')[0] || 'there'}.
        </Heading>
        <Text variant="muted" className="text-[13px]">{subtitle}</Text>
      </motion.div>

      {/* Main Grid Layout */}
      {!hasTasks && workspaceMode === 'PERSONAL' && !isTasksLoading ? (
        <EmptyDashboardState onAddTask={() => document.dispatchEvent(new CustomEvent('open-task-form'))} />
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5 auto-rows-max">
          {widgets.map(({ id, Component, span }) => (
            <div key={id} className={cn(span, "min-h-[200px]")}>
              <Component {...widgetProps} />
            </div>
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
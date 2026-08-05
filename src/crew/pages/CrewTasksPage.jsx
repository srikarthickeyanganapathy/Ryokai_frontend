import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { useTaskList, useCompleteCrewTask, useDeleteTask } from '@/task';
import { TasksTable } from '@/task';
import { TaskPanel } from '@/task';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/ui/PageHeader';
import {
  WorkspaceShell,
  ManagementLayout,
} from '@/shared/workspace-framework';
import { 
  ListTodo, 
  CheckCircle2, 
  AlertTriangle, 
  Activity, 
  Trash2, 
  CheckCheck, 
  X,
  Layers,
  Clock
} from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';

export function CrewTasksPage() {
  const { data: rawTasks = [], isLoading } = useTaskList({ scope: 'crew' });
  
  const tasks = useMemo(() => {
    if (!Array.isArray(rawTasks)) return [];
    return rawTasks.filter(t => !(!t.crewId && !t.crew));
  }, [rawTasks]);
  
  const [rowSelection, setRowSelection] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  
  const completeCrewTaskMutation = useCompleteCrewTask();
  const deleteTaskMutation = useDeleteTask();

  const handleQuickComplete = (task) => {
    const current = (task.currentStatus || task.status || '').toUpperCase().replace(/\s+/g, '_');
    if (current === 'COMPLETED' || current === 'DONE' || current === 'APPROVED') {
      toast.info('Task is already completed');
    } else {
      completeCrewTaskMutation.mutate(task.id);
    }
  };

  const handleQuickDelete = (task) => {
    deleteTaskMutation.mutate(task.id, {
      onSuccess: () => toast.success(`Task deleted.`)
    });
  };

  const analytics = useMemo(() => {
    const total = tasks.length;
    const done = tasks.filter(t => {
      const status = (t.currentStatus || t.status || '').toUpperCase();
      return status === 'DONE' || status === 'COMPLETED' || status === 'APPROVED';
    }).length;
    
    const claimed = tasks.filter(t => {
      const status = (t.currentStatus || t.status || '').toUpperCase();
      const isDone = status === 'DONE' || status === 'COMPLETED' || status === 'APPROVED';
      return !isDone && (t.assignee || t.assigneeId || status.includes('CLAIM') || status.includes('PROGRESS'));
    }).length;

    const overdue = tasks.filter(t => {
      const status = (t.currentStatus || t.status || '').toUpperCase();
      const isDone = status === 'DONE' || status === 'COMPLETED' || status === 'APPROVED';
      return t.dueDate && new Date(t.dueDate) < new Date() && !isDone;
    }).length;

    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;
    
    return { total, done, claimed, inProgress: claimed, overdue, completionRate };
  }, [tasks]);

  const selectedCount = Object.keys(rowSelection).length;

  const handleBulkComplete = () => {
    Object.keys(rowSelection).forEach(taskId => {
      const task = tasks.find(t => String(t.id) === taskId);
      if (task) handleQuickComplete(task);
    });
    setRowSelection({});
  };

  const handleBulkDelete = () => {
    Object.keys(rowSelection).forEach(taskId => {
      const task = tasks.find(t => String(t.id) === taskId);
      if (task) handleQuickDelete(task);
    });
    setRowSelection({});
  };

  return (
    <WorkspaceShell maxWidth="default">
      <ManagementLayout
        header={
          <div className="space-y-4 pb-4 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] font-mono text-[10px] uppercase tracking-wider font-semibold">
                Operations
              </span>
              <span className="text-[12px] text-[var(--text-muted)] font-medium flex items-center gap-1.5">
                <Layers className="w-3 h-3 text-[var(--accent)]" /> All Crews Overview
              </span>
            </div>
            <Heading level={1} className="tracking-tight text-[18px] font-semibold mb-1 text-[var(--text-primary)]">
              Crew Tasks Center
            </Heading>
            <Text variant="muted" className="text-[13px] leading-relaxed">
              Central execution table for tasks assigned across all your active crews.
            </Text>
          </div>
        }
      >
        <div className="flex flex-col min-h-full relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 pb-2">
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-subtle)]">
                <ListTodo className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[18px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{analytics.total}</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Total Tasks</div>
              </div>
            </div>
            
            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--success-soft)] flex items-center justify-center text-[var(--success)] border border-[var(--success)]/20">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[18px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{analytics.done}</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Completed</div>
              </div>
            </div>

            <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[var(--info-soft)] flex items-center justify-center text-[var(--info)] border border-[var(--info)]/20">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[18px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{analytics.claimed}</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Claimed</div>
              </div>
            </div>

            <div className={cn(
              "bg-[var(--bg-card)] border rounded-xl p-4 flex items-center gap-3",
              analytics.overdue > 0 ? "border-[var(--danger)]/30" : "border-[var(--border-subtle)]"
            )}>
              <div className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center border",
                analytics.overdue > 0 ? "bg-[var(--danger-soft)] text-[var(--danger)] border-[var(--danger)]/20" : "bg-[var(--bg-subtle)] text-[var(--text-muted)] border-[var(--border-subtle)]"
              )}>
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <div className="text-[18px] font-bold text-[var(--text-primary)] leading-none tabular-nums">{analytics.overdue}</div>
                <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Overdue</div>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-5 mb-6 mt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)]">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <Heading level={4} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">Mission Completion</Heading>
                  <Text variant="muted" className="text-[11px]">Overall squad execution status</Text>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[18px] font-bold text-[var(--text-primary)] tabular-nums">{analytics.completionRate}%</span>
              </div>
            </div>
            <div className="relative w-full h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div 
                style={{ width: `${analytics.completionRate}%` }}
                className="h-full bg-[var(--accent)] rounded-full transition-[width] duration-500"
              />
            </div>
          </div>

          <div className="flex-1 min-h-0 relative bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
            <div className="flex-1 min-h-0 relative">
              <TasksTable 
                tasks={tasks} 
                isLoading={isLoading} 
                rowSelection={rowSelection}
                setRowSelection={setRowSelection}
                onTaskClick={setSelectedTask}
                onQuickComplete={handleQuickComplete}
                onQuickDelete={handleQuickDelete}
              />
            </div>
          </div>

          <AnimatePresence>
            {selectedCount > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-[var(--bg-card)] border border-[var(--border-subtle)] shadow-xl rounded-xl p-2 flex items-center gap-2"
              >
                <div className="px-3 py-1 flex items-center gap-1.5 border-r border-[var(--border-subtle)]">
                  <span className="text-[12px] font-bold text-[var(--text-primary)] tabular-nums">{selectedCount}</span>
                  <span className="text-[11px] text-[var(--text-muted)] font-medium">selected</span>
                </div>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1.5 h-8 px-2.5 text-[12px] font-medium text-[var(--success)] hover:bg-[var(--success-soft)]"
                  onClick={handleBulkComplete}
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Complete
                </Button>
                
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="gap-1.5 h-8 px-2.5 text-[12px] font-medium text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                  onClick={handleBulkDelete}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>

                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-[var(--text-muted)] hover:bg-[var(--bg-hover)]"
                  onClick={() => setRowSelection({})}
                  title="Clear selection"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <TaskPanel
            task={selectedTask}
            isOpen={!!selectedTask}
            onClose={() => setSelectedTask(null)}
          />
        </div>
      </ManagementLayout>
    </WorkspaceShell>
  );
}

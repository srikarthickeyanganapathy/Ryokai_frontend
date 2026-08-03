import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Icons } from '@/shared/ui/Icons';
import { Input } from '@/shared/ui/Input';
import { Textarea } from '@/shared/ui/Textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { useCreateCrewTask } from '@/crew/features/hooks/useCrews';
import { useCompleteCrewTask, TaskPanel } from '@/task';
import { useClaimTask } from '@/task/entities/hooks/useTasks';
import { cn } from '@/shared/lib/cn';
import { PRIORITY_COLORS, normalizePriority } from '@/shared/lib/priority';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  User,
  ListTodo,
  Filter,
  ArrowRight,
  Sparkles,
  CheckCheck
} from 'lucide-react';

function CrewTaskColumn({ title, tasks, tone, onClaim, onComplete, onTaskClick }) {
  const toneStyles = {
    warning: { dot: 'bg-[var(--warning)]', text: 'text-[var(--warning)]', soft: 'bg-[var(--warning-soft)]' },
    info: { dot: 'bg-[var(--info)]', text: 'text-[var(--info)]', soft: 'bg-[var(--info-soft)]' },
    accent: { dot: 'bg-[var(--accent)]', text: 'text-[var(--accent)]', soft: 'bg-[var(--accent-soft)]' },
    muted: { dot: 'bg-[var(--text-muted)]', text: 'text-[var(--text-muted)]', soft: 'bg-[var(--bg-subtle)]' },
  }[tone];

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl flex flex-col overflow-hidden min-w-[280px] w-full max-w-[340px] shadow-sm">
      <div className="px-4 py-2.5 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-base)]/50 backdrop-blur-sm sticky top-0 z-10">
        <span className="flex items-center gap-2 text-[12px] font-semibold text-[var(--text-primary)] uppercase tracking-wider">
          <span className={cn('w-2 h-2 rounded-full', toneStyles.dot)} />
          {title}
        </span>
        <span className={cn("text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold", toneStyles.soft, toneStyles.text)}>
          {tasks.length}
        </span>
      </div>

      <div className="p-2.5 space-y-2 flex-1 overflow-y-auto custom-scrollbar min-h-[150px]">
        <AnimatePresence>
          {tasks.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <Circle className="w-5 h-5 text-[var(--text-muted)] opacity-30 mb-2" />
              <Text size="xs" variant="muted" className="italic text-[11px]">No tasks here</Text>
            </motion.div>
          ) : (
            tasks.map(task => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                whileHover={{ y: -2 }}
                onClick={() => onTaskClick(task)}
                className="p-3 rounded-lg bg-[var(--bg-subtle)]/40 border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:bg-[var(--bg-card)] hover:shadow-sm transition-all cursor-pointer group relative"
              >
                <div className={cn("absolute left-0 top-3 bottom-3 w-[3px] rounded-r-full", PRIORITY_COLORS[task.priority]?.split(' ')[0] || 'bg-transparent')}></div>

                <div className="pl-2">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <Text className={cn('font-semibold text-[13px] leading-tight group-hover:text-[var(--accent)] transition-colors', task.status === 'Done' && 'line-through text-[var(--text-muted)]')}>
                      {task.title}
                    </Text>
                    <span className={cn("text-[9px] font-mono font-semibold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0", PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.MEDIUM)}>
                      {normalizePriority(task.priority)}
                    </span>
                  </div>

                  {task.description && (
                    <Text variant="muted" className="text-[11px] line-clamp-2 mb-2.5 leading-relaxed">
                      {task.description}
                    </Text>
                  )}

                  <div className="flex items-center justify-between gap-2 pt-2 mt-auto border-t border-[var(--border-subtle)]/60">
                    <div className="flex items-center gap-2.5 text-[11px] text-[var(--text-muted)] font-medium">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}

                      {task.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 rounded-full bg-[var(--accent)] text-white text-[8px] font-bold flex items-center justify-center">
                            {task.assignee.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="truncate max-w-[60px]">@{task.assignee.username}</span>
                        </div>
                      ) : (
                        !task.assignee && task.status !== 'Done' && (
                          <span className="flex items-center gap-1 text-[var(--warning)]">
                            <User className="w-3 h-3" /> Unassigned
                          </span>
                        )
                      )}
                    </div>

                    <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                      {!task.assignee && task.status !== 'Done' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-6 text-[10px] px-2 font-semibold hover:bg-[var(--accent-soft)] hover:border-[var(--accent-border)] hover:text-[var(--accent)] transition-colors"
                          onClick={() => onClaim(task.id)}
                        >
                          Claim
                        </Button>
                      )}
                      {task.status !== 'Done' && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-[var(--success)] hover:bg-[var(--success-soft)]"
                          onClick={() => onComplete(task.id)}
                          title="Mark Complete"
                        >
                          <CheckCheck className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function TasksTab({ crewId, tasks }) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');

  const createTaskMutation = useCreateCrewTask(crewId);
  const claimTaskMutation = useClaimTask();
  const completeTaskMutation = useCompleteCrewTask();

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    createTaskMutation.mutate({ title, description, priority, dueDate: dueDate || null }, {
      onSuccess: () => { setIsCreateOpen(false); setTitle(''); setDescription(''); setPriority('MEDIUM'); setDueDate(''); }
    });
  };

  const taskBoard = useMemo(() => {
    const filtered = activeFilter === 'ALL' ? tasks : tasks.filter(t => normalizePriority(t.priority) === activeFilter);

    const unassigned = [], inProgress = [], review = [], completed = [];
    filtered.forEach(t => {
      if (t.status === 'Done') completed.push(t);
      else if (!t.assignee) unassigned.push(t);
      else if ((t.status || '').toLowerCase().includes('review')) review.push(t);
      else inProgress.push(t);
    });
    return { unassigned, inProgress, review, completed };
  }, [tasks, activeFilter]);

  const stats = useMemo(() => ({
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'Done').length,
    urgent: tasks.filter(t => normalizePriority(t.priority) === 'URGENT').length,
  }), [tasks]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto relative min-h-[calc(100vh-200px)]">
      {/* Header & Analytics */}
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)]">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)] mb-0">Crew Tasks Board</Heading>
              <Text variant="muted" className="text-[12px] mt-0.5">Flat execution board for squad members.</Text>
            </div>
          </div>

          <Button size="sm" className="gap-1.5 h-8 px-3 text-[12px] font-semibold shadow-sm" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Add Task
          </Button>
        </div>

        {/* Analytics Strip */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center text-[var(--text-muted)]">
              <ListTodo className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-[var(--text-primary)] leading-none">{stats.total}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Total Tasks</div>
            </div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--success-soft)] flex items-center justify-center text-[var(--success)]">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-[var(--text-primary)] leading-none">{stats.completed}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Completed</div>
            </div>
          </div>
          <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-3 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--danger-soft)] flex items-center justify-center text-[var(--danger)]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[16px] font-bold text-[var(--text-primary)] leading-none">{stats.urgent}</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mt-1">Urgent</div>
            </div>
          </div>
        </div>

        {/* Quick Filters */}
        <div className="flex items-center gap-1 bg-[var(--bg-subtle)] p-1 rounded-lg border border-[var(--border-subtle)] w-fit">
          <Filter className="w-3.5 h-3.5 text-[var(--text-muted)] ml-2 mr-1" />
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all uppercase tracking-wider cursor-pointer",
                activeFilter === filter
                  ? "bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              )}
            >
              {filter === 'ALL' ? 'All' : filter.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban Board */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)]">
          <ListTodo className="w-8 h-8 text-[var(--text-muted)] mb-3" />
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] mb-1">No Tasks Yet</Heading>
          <Text variant="muted" className="text-[12px] mb-4 max-w-xs">
            Create a flat task for the crew to claim and execute. Tasks are shared across all members.
          </Text>
          <Button size="sm" variant="outline" className="gap-1.5 h-8 text-[12px]" onClick={() => setIsCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5" /> Create Task
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-20">
          <CrewTaskColumn title="Unassigned" tasks={taskBoard.unassigned} tone="warning" onClaim={claimTaskMutation.mutate} onComplete={completeTaskMutation.mutate} onTaskClick={setSelectedTask} />
          <CrewTaskColumn title="In Progress" tasks={taskBoard.inProgress} tone="info" onClaim={claimTaskMutation.mutate} onComplete={completeTaskMutation.mutate} onTaskClick={setSelectedTask} />
          <CrewTaskColumn title="Review" tasks={taskBoard.review} tone="accent" onClaim={claimTaskMutation.mutate} onComplete={completeTaskMutation.mutate} onTaskClick={setSelectedTask} />
          <CrewTaskColumn title="Completed" tasks={taskBoard.completed} tone="muted" onClaim={claimTaskMutation.mutate} onComplete={completeTaskMutation.mutate} onTaskClick={setSelectedTask} />
        </div>
      )}

      {/* Floating Action Button (Mobile/Sticky) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsCreateOpen(true)}
        className="fixed bottom-8 right-8 w-11 h-11 rounded-full bg-[var(--accent)] text-white shadow-lg flex items-center justify-center hover:shadow-xl transition-shadow z-30"
        style={{ display: tasks.length > 0 ? 'flex' : 'none' }}
      >
        <Plus className="w-5 h-5" />
      </motion.button>

      {/* Create Task Modal */}
      <Modal open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <ModalContent className="sm:max-w-lg !bg-[var(--bg-card)] !backdrop-blur-xl border border-[var(--border-subtle)] shadow-xl rounded-xl p-6">
          <div className="flex flex-col space-y-1 mb-5 text-center">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-2 mx-auto border border-[var(--accent-border)]">
              <ListTodo className="w-5 h-5" />
            </div>
            <Heading level={3} className="text-[16px] font-semibold tracking-tight text-[var(--text-primary)]">Create Crew Task</Heading>
            <Text variant="muted" className="text-[12px]">Define a clear, actionable objective for the squad.</Text>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Task Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Deploy v1.2 to production..."
                required
                className="h-9 text-[13px] rounded-md font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context, links, or acceptance criteria..."
                className="min-h-[80px] text-[13px] rounded-md font-medium resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 text-[13px] rounded-md font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Due Date</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="h-9 text-[13px] rounded-md font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-5 border-t border-[var(--border-subtle)] mt-5">
              <Button type="button" variant="outline" size="sm" className="h-8 px-4 text-[12px] font-medium" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="default" className="h-10 px-5 text-[13px] font-medium shadow-sm" isLoading={createTaskMutation.isPending}>
                Create Task
              </Button>
            </div>
          </form>
        </ModalContent>
      </Modal>

      {selectedTask && (
        <TaskPanel
          task={selectedTask}
          isOpen={!!selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </div>
  );
}

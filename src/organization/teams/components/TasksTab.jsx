import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Text } from '@/shared/ui/Typography'
import { cn } from '@/shared/lib/cn'
import { normalizePriority } from '@/shared/lib/priority'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/Popover'
import { ImmersiveEmptyState } from '@/shared/ui/Immersive'
import { CheckCheckIcon, Calendar, MoreHorizontal } from '@/shared/ui/Icons'

const COLUMN_CONFIG = {
  unassigned: { title: 'To Do', tone: 'bg-[var(--text-muted)]', statusTarget: 'TODO' },
  inProgress: { title: 'In Progress', tone: 'bg-blue-400', statusTarget: 'IN_PROGRESS' },
  review: { title: 'In Review', tone: 'bg-purple-400', statusTarget: 'REVIEW' },
  completed: { title: 'Done', tone: 'bg-emerald-400', statusTarget: 'DONE' }
};

// Simple priority colors for the subtle dot
const PRIORITY_COLORS = {
  URGENT: 'bg-red-500',
  HIGH: 'bg-orange-500',
  MEDIUM: 'bg-yellow-500',
  LOW: 'bg-blue-500'
};

export function TasksTab({ teamTasks, taskBoard, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask, onUpdateTaskStatus }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleDragStart = (e, task) => {
    if (isReadOnly) return;
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    if (draggedTask && onUpdateTaskStatus) {
      const targetStatus = COLUMN_CONFIG[columnId].statusTarget;
      if (draggedTask.status !== targetStatus && !(columnId === 'completed' && draggedTask.status === 'Done')) {
        onUpdateTaskStatus(draggedTask.id, targetStatus);
      }
    }
    setDraggedTask(null);
    setDragOverCol(null);
  };

  if (teamTasks.length === 0) {
    return (
      <div className="py-16">
        <ImmersiveEmptyState
          icon={CheckCheckIcon}
          title="No tasks yet"
          description="Tasks assigned to this team will appear here. Drag and drop cards to update their status."
        />
      </div>
    );
  }

  return (
    <div className="px-6 py-8 max-w-[1400px] mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {Object.keys(COLUMN_CONFIG).map((colKey) => {
          const config = COLUMN_CONFIG[colKey];
          const tasks = taskBoard[colKey] || [];
          const isDragOver = dragOverCol === colKey;

          return (
            <div 
              key={colKey}
              onDragOver={(e) => { e.preventDefault(); setDragOverCol(colKey); }}
              onDrop={(e) => handleDrop(e, colKey)}
              onDragLeave={() => setDragOverCol(null)}
              className={cn(
                "flex flex-col gap-3 p-3 rounded-2xl transition-colors min-h-[200px]",
                isDragOver && !isReadOnly ? "bg-[var(--accent-soft)]/30" : "bg-[var(--bg-subtle)]/30"
              )}
            >
              {/* Clean Column Header */}
              <div className="flex items-center justify-between px-2 pb-2 border-b border-[var(--border-subtle)]">
                <div className="flex items-center gap-2">
                  <span className={cn("w-1.5 h-1.5 rounded-full", config.tone)} />
                  <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
                    {config.title}
                  </Text>
                </div>
                <Text className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-card)] px-1.5 py-0.5 rounded-full border border-[var(--border-subtle)]">{tasks.length}</Text>
              </div>

              {/* Task Cards */}
              <div className="space-y-3 flex-1">
                <AnimatePresence>
                  {tasks.map(task => (
                    <KanbanCard 
                      key={task.id} 
                      task={task} 
                      team={team}
                      canAssignTask={canAssignTask}
                      isReadOnly={isReadOnly}
                      assigningTaskId={assigningTaskId}
                      setAssigningTaskId={setAssigningTaskId}
                      handleAssignTask={handleAssignTask}
                      onDragStart={(e) => handleDragStart(e, task)}
                      isDragging={draggedTask?.id === task.id}
                    />
                  ))}
                </AnimatePresence>
                
                {tasks.length === 0 && (
                  <div className="flex items-center justify-center h-20 border border-dashed border-[var(--border-subtle)] rounded-xl">
                    <Text size="xs" variant="muted" className="italic opacity-50">Drop here</Text>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({ task, team, canAssignTask, isReadOnly, assigningTaskId, setAssigningTaskId, handleAssignTask, onDragStart, isDragging }) {
  const priority = normalizePriority(task.priority);
  const priorityColor = PRIORITY_COLORS[priority?.toUpperCase()] || 'bg-gray-400';
  const isDone = task.status === 'Done' || task.status === 'COMPLETED';
  
  const formattedDueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : null;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !isDone;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      draggable={!isReadOnly}
      onDragStart={onDragStart}
      className={cn(
        "group relative p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-[var(--accent-border)] hover:shadow-md transition-all cursor-grab active:cursor-grabbing",
        isDone && "opacity-60"
      )}
    >
      {/* Priority Dot */}
      <div className={cn("absolute top-4 right-4 w-2 h-2 rounded-full", priorityColor)} title={`${priority} priority`} />

      <Text className={cn("block text-sm font-medium text-[var(--text-primary)] mb-3 pr-6", isDone && "line-through text-[var(--text-muted)]")}>
        {task.title}
      </Text>

      <div className="flex items-center justify-between">
        {/* Date */}
        {formattedDueDate && (
          <span className={cn("text-[11px] font-medium flex items-center gap-1.5", isOverdue ? "text-red-500" : "text-[var(--text-muted)]")}>
            <Calendar className="w-3 h-3" />
            {formattedDueDate}
          </span>
        )}

        {/* Assignee */}
        {task.assignedTo ? (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[10px] font-bold shrink-0 border border-[var(--accent-border)]">
              {task.assignedTo.charAt(0).toUpperCase()}
            </div>
          </div>
        ) : (
          <Popover open={assigningTaskId === task.id} onOpenChange={open => setAssigningTaskId(open ? task.id : null)}>
            <PopoverTrigger asChild>
              <button 
                disabled={!canAssignTask || isReadOnly} 
                className="ml-auto text-[11px] font-medium text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors flex items-center gap-1"
              >
                <MoreHorizontal className="w-3.5 h-3.5" /> Assign
              </button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48 p-1.5">
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {team.members?.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => handleAssignTask(task.id, m.id, m.username)} 
                    className="w-full flex items-center gap-2 px-2 py-1.5 text-xs rounded-md hover:bg-[var(--bg-subtle)] transition-colors text-left"
                  >
                    <div className="w-5 h-5 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[9px] font-bold shrink-0">
                      {m.username.charAt(0).toUpperCase()}
                    </div>
                    <span className="truncate text-[var(--text-primary)]">{m.username}</span>
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    </motion.div>
  );
}
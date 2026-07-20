import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday
} from 'date-fns';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/shared/ui/Tooltip';
import { Text, Heading } from '@/shared/ui/Typography';
import { cn } from '@/shared/lib/cn';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { TaskForm } from '@/widgets/tasks/TaskForm';
import { useCreateTask } from '@/features/tasks/hooks/useTasks';
import { Button } from '@/shared/ui/Button';

export function MiniCalendarWidget({ tasks = [] }) {
  const currentDate = new Date();
  
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [selectedDateForNewTask, setSelectedDateForNewTask] = useState('');
  const createTaskMutation = useCreateTask();

  const handleCreateTask = (payload) => {
    createTaskMutation.mutate(payload, {
      onSuccess: () => setIsQuickCreateOpen(false)
    });
  };

  const handleAddClick = (e, date) => {
    e.preventDefault();
    e.stopPropagation();
    // format to datetime-local expected format: YYYY-MM-DDThh:mm
    const dateStr = format(date, `yyyy-MM-dd'T'${format(new Date(), 'HH:mm')}`);
    setSelectedDateForNewTask(dateStr);
    setIsQuickCreateOpen(true);
  };

  // 1. Memoize tasks grouped by date for O(1) lookup
  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach(task => {
      if (!task.dueDate) return;
      // Convert to YYYY-MM-DD
      const dateStr = format(new Date(task.dueDate), 'yyyy-MM-dd');
      if (!map[dateStr]) map[dateStr] = { urgent: [], high: [], other: [] };
      
      if (task.priority === 'URGENT') map[dateStr].urgent.push(task);
      else if (task.priority === 'HIGH') map[dateStr].high.push(task);
      else map[dateStr].other.push(task);
    });
    return map;
  }, [tasks]);

  // 2. Generate calendar days
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  return (
    <div className="glass-panel mesh-bg p-4 rounded-[var(--radius-lg)] h-full flex flex-col border border-[var(--border-subtle)] relative overflow-hidden">
      
      {/* Decorative background glow for arena feel */}
      <div className="absolute top-[-50px] right-[-50px] w-[150px] h-[150px] bg-[var(--danger)]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex justify-between items-center mb-4 relative z-10">
        <Text className="font-semibold text-[15px] tracking-tight">{format(currentDate, 'MMMM yyyy')}</Text>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shadow-[0_0_8px_var(--danger)]" />
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">Urgent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent)]" />
            <span className="text-[9px] text-[var(--text-tertiary)] uppercase font-bold tracking-wider">High</span>
          </div>
        </div>
      </div>

      <TooltipProvider delayDuration={150}>
        <div className="grid grid-cols-7 gap-y-1.5 gap-x-1 flex-1 content-start relative z-10">
          {/* Weekday headers */}
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <div key={i} className="text-center pb-2">
              <Text variant="muted" className="text-[10px] uppercase font-bold tracking-wider opacity-70">{day}</Text>
            </div>
          ))}

          {/* Days */}
          {days.map((day, i) => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayTasks = tasksByDate[dateStr];
            const hasUrgent = dayTasks?.urgent?.length > 0;
            const hasHigh = dayTasks?.high?.length > 0;
            const isCurrentMonth = isSameMonth(day, monthStart);
            const isTodayDate = isToday(day);

            return (
              <Tooltip key={dateStr}>
                <TooltipTrigger asChild>
                  <div className="relative aspect-square flex items-center justify-center p-0.5 group/cell">
                    <motion.div
                      whileHover={{ scale: 1.15 }}
                      className={cn(
                        "w-full h-full rounded-full flex items-center justify-center text-[12px] font-medium cursor-default relative z-10 transition-colors",
                        isTodayDate ? "bg-[var(--text-primary)] text-[var(--bg-base)] shadow-md" 
                          : isCurrentMonth ? "text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]" 
                          : "text-[var(--text-tertiary)] opacity-40"
                      )}
                    >
                      {format(day, 'd')}
                    </motion.div>

                    {/* Hover Plus Icon */}
                    <Button 
                      onClick={(e) => handleAddClick(e, day)}
                      className="absolute -top-1 -right-1 bg-[var(--bg-elevated)] border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] rounded-full p-0.5 opacity-0 group-hover/cell:opacity-100 transition-all z-20 shadow-sm"
                    >
                      <Plus className="w-2.5 h-2.5" strokeWidth={3} />
                    </Button>

                    {/* Urgent Indicator (Fast pulse) */}
                    {hasUrgent && (
                      <motion.div 
                        className="absolute inset-[1px] rounded-full border border-[var(--danger)] z-0"
                        animate={{ 
                          boxShadow: ["0 0 0px var(--danger)", "0 0 12px var(--danger)", "0 0 0px var(--danger)"],
                          opacity: [0.6, 1, 0.6],
                          scale: [1, 1.05, 1]
                        }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}

                    {/* High Indicator (Slow pulse) */}
                    {!hasUrgent && hasHigh && (
                      <motion.div 
                        className="absolute inset-[2px] rounded-full border border-[var(--accent)] z-0"
                        animate={{ 
                          boxShadow: ["0 0 0px var(--accent)", "0 0 8px var(--accent)", "0 0 0px var(--accent)"],
                          opacity: [0.4, 0.8, 0.4],
                          scale: [1, 1.02, 1]
                        }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                      />
                    )}
                  </div>
                </TooltipTrigger>
                
                {dayTasks && (hasUrgent || hasHigh) && (
                  <TooltipContent side="top" className="p-3 max-w-[240px] bg-[var(--bg-elevated)] border border-[var(--border-default)] shadow-2xl z-50 rounded-[var(--radius-md)] backdrop-blur-md">
                    <div className="space-y-2.5">
                      <div className="border-b border-[var(--border-subtle)] pb-1.5 mb-2">
                        <Text className="font-semibold text-[13px] text-[var(--text-primary)]">
                          {format(day, 'MMM d, yyyy')}
                        </Text>
                      </div>
                      
                      {dayTasks.urgent.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--danger)] shadow-[0_0_5px_var(--danger)] mt-1.5 shrink-0" />
                          <Text className="text-[12px] leading-tight line-clamp-2 text-[var(--text-primary)] font-medium">{t.title}</Text>
                        </div>
                      ))}
                      
                      {dayTasks.high.map(t => (
                        <div key={t.id} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] shadow-[0_0_5px_var(--accent)] mt-1.5 shrink-0" />
                          <Text className="text-[12px] leading-tight line-clamp-2 text-[var(--text-secondary)]">{t.title}</Text>
                        </div>
                      ))}
                    </div>
                  </TooltipContent>
                )}
              </Tooltip>
            )
          })}
        </div>
      </TooltipProvider>

      {/* Quick Create Modal */}
      <Modal open={isQuickCreateOpen} onOpenChange={setIsQuickCreateOpen}>
        <ModalContent className="sm:max-w-xl">
          <Heading level={3} className="mb-4">Create New Task</Heading>
          <TaskForm 
            onSubmit={handleCreateTask} 
            isLoading={createTaskMutation.isPending} 
            defaultValues={{
              title: '',
              description: '',
              assigneeUsername: '',
              priority: 'MEDIUM',
              dueDate: selectedDateForNewTask,
              tags: '',
              teamId: '',
            }}
          />
        </ModalContent>
      </Modal>
    </div>
  )
}

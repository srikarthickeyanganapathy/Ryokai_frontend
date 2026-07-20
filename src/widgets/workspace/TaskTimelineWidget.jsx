import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { Skeleton } from '@/shared/ui/Skeleton';
import { Text } from '@/shared/ui/Typography';
import { getSmartDate } from '@/shared/lib/date';
import { isBefore, parseISO, startOfToday, isToday, isThisWeek, isAfter, endOfWeek } from 'date-fns';
import { cn } from '@/shared/lib/cn';
import { Lock } from 'lucide-react';

export function TaskTimelineWidget({ tasks = [], isLoading }) {
  const [filter, setFilter] = useState('All'); // All, Today, Week

  const groupedTasks = useMemo(() => {
    const today = startOfToday();
    const endWeek = endOfWeek(today, { weekStartsOn: 1 });

    const filtered = tasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED');

    const groups = {
      Overdue: [],
      Today: [],
      ThisWeek: [],
      Later: [],
      Someday: []
    };

    filtered.forEach(task => {
      if (!task.dueDate) {
        groups.Someday.push(task);
        return;
      }
      const date = parseISO(task.dueDate);
      if (isBefore(date, today)) {
        groups.Overdue.push(task);
      } else if (isToday(date)) {
        groups.Today.push(task);
      } else if (isThisWeek(date, { weekStartsOn: 1 }) || isBefore(date, endWeek)) {
        groups.ThisWeek.push(task);
      } else {
        groups.Later.push(task);
      }
    });

    // Sort each group ascending
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    });

    return groups;
  }, [tasks]);

  if (isLoading) return <Skeleton className="h-[400px] rounded-[var(--radius-lg)]" />;

  const hasTasks = tasks.filter(t => t.status !== 'Done' && t.status !== 'COMPLETED').length > 0;

  if (!hasTasks) {
    return (
      <Card className="h-[400px] flex flex-col shadow-sm border-[var(--border-subtle)]">
        <CardHeader className="pb-3 pt-4 border-b-0">
          <CardTitle className="text-base font-semibold">Your Timeline</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center">
           <Text variant="muted" className="text-sm">No upcoming tasks.</Text>
        </CardContent>
      </Card>
    );
  }

  const renderTask = (task, isOverdue = false) => {
    // Check if task is blocked (simulate with blocks/blockedBy or just status)
    const isBlocked = task.blockedBy && task.blockedBy.length > 0;
    
    return (
      <div 
        key={task.id} 
        className={cn(
          "flex flex-col gap-1 p-3 rounded-[var(--radius-md)] border border-transparent bg-[var(--bg-base)] transition-colors duration-[var(--duration-fast)]",
          isBlocked ? "opacity-60 bg-[var(--bg-subtle)]" : "hover:bg-[var(--bg-subtle)] hover:border-[var(--color-border-subtle)]"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <Text size="sm" className="font-medium text-[var(--text-primary)] line-clamp-1 truncate">
              {task.title}
            </Text>
          </div>
          {task.dueDate && (
            <span className={cn(
              "shrink-0 text-[10px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap",
              isOverdue 
                ? "bg-[var(--danger-soft)] text-[var(--danger)]" 
                : "bg-[var(--bg-subtle)] text-[var(--text-secondary)]"
            )}>
              {getSmartDate(task.dueDate)}
            </span>
          )}
        </div>
        
        {isBlocked ? (
          <div className="flex items-center gap-1.5 text-[var(--text-muted)] mt-1">
            <Lock size={12} />
            <Text size="xs" variant="muted" className="truncate">
              Blocked by "{task.blockedBy[0]?.title || 'another task'}"
            </Text>
          </div>
        ) : (
          <Text size="xs" variant="muted" className="mt-1">
            Priority: {task.priority || 'Normal'}
          </Text>
        )}
      </div>
    );
  };

  const renderSection = (title, items, isOverdue = false) => {
    if (items.length === 0) return null;
    if (filter === 'Today' && title !== 'Today' && title !== 'Overdue') return null;
    if (filter === 'Week' && title !== 'Today' && title !== 'Overdue' && title !== 'ThisWeek') return null;

    return (
      <div className="mb-4">
        <Text variant="muted" className="text-xs uppercase tracking-wider font-semibold mb-2 px-1">
          {title} <span className="opacity-60 ml-1">({items.length})</span>
        </Text>
        <div className="space-y-2">
          {items.map(t => renderTask(t, isOverdue))}
        </div>
      </div>
    );
  };

  return (
    <Card className="h-[400px] flex flex-col shadow-sm border-[var(--border-subtle)]">
      <CardHeader className="pb-3 pt-4 border-b-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold">Your Timeline</CardTitle>
        <div className="flex bg-[var(--bg-subtle)] p-0.5 rounded-md text-[11px] font-medium">
          {['All', 'Today', 'Week'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-2.5 py-1 rounded-sm transition-colors",
                filter === f ? "bg-[var(--bg-base)] shadow-sm text-[var(--text-primary)]" : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {renderSection('Overdue', groupedTasks.Overdue, true)}
        {renderSection('Today', groupedTasks.Today, false)}
        {renderSection('This Week', groupedTasks.ThisWeek, false)}
        {renderSection('Later', groupedTasks.Later, false)}
        {renderSection('Someday', groupedTasks.Someday, false)}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { useDrawerManager } from '@/shared/workspace-framework';
import { CheckCircle2, Clock, MoreHorizontal, Calendar } from '@/shared/ui/Icons';

export function ExecutionQueue({ queueOrdering }) {
  const { open } = useDrawerManager();

  if (!queueOrdering || queueOrdering.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-xl border-default text-tertiary">
        <CheckCircle2 size={48} className="mb-4 text-tertiary/50" />
        <h3 className="text-lg font-medium text-primary">Queue Empty</h3>
        <p className="text-sm">No remaining tasks in this context.</p>
      </div>
    );
  }

  // Remove the focus task from the queue display since it's in the Focus Panel
  const displayQueue = queueOrdering.slice(1);

  if (displayQueue.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold tracking-wider text-tertiary uppercase">Up Next</h3>
      
      <div className="space-y-2">
        {displayQueue.map((task, index) => (
          <Card 
            key={task.id}
            variant="interactive"
            className="group flex items-center justify-between p-4"
            onClick={() => open('task', { taskId: task.id })}
          >
            <div className="flex items-center gap-4">
              <span className="text-tertiary font-mono text-sm w-6 text-center">
                {index + 1}
              </span>
              
              <button 
                className="w-5 h-5 rounded border border-subtle group-hover:border-accent flex items-center justify-center text-transparent hover:text-accent transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Trigger completion
                }}
              >
                <CheckCircle2 size={16} />
              </button>
              
              <div className="flex flex-col">
                <span className="text-sm font-medium text-primary group-hover:text-accent transition-colors">
                  {task.title}
                </span>
                <div className="flex items-center gap-3 text-xs text-secondary mt-1">
                  {task.project && (
                    <span>{task.project.name}</span>
                  )}
                  {task.dueDate && (
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {task.dueDate}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {task.priority || 'Normal'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-secondary hover:text-primary">
                <MoreHorizontal size={16} />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

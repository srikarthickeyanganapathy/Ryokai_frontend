import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';

export function ExecutionQueue({ queueGroups }) {
  const states = ['NOW', 'NEXT', 'BLOCKED', 'WAITING', 'SCHEDULED', 'BACKLOG'];
  
  return (
    <div className="p-4 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--bg-elevated)] h-full">
      <Heading level={4} className="mb-4">Execution Queue</Heading>
      <div className="space-y-4">
        {states.map(state => {
          const tasks = queueGroups[state] || [];
          if (tasks.length === 0) return null;
          
          return (
            <div key={state}>
              <Badge variant="outline" className="mb-2 text-[10px]">{state}</Badge>
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="p-2 border border-[var(--color-border-subtle)] rounded-lg text-sm">
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

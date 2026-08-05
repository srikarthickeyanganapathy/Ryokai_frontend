import React from 'react';
import { Card, CardContent } from '@/shared/ui/Card';
import { Badge } from '@/shared/ui/Badge';
import { AlertCircle, FileText, CheckSquare, MessageSquare } from '@/shared/ui/Icons';
import { useDrawerManager } from '@/shared/workspace-framework';

export function SignalStrip({ interrupts }) {
  const { open } = useDrawerManager();

  if (!interrupts || interrupts.length === 0) {
    return null;
  }

  const getIcon = (type) => {
    switch (type) {
      case 'APPROVAL_REQUIRED': return <CheckSquare className="h-4 w-4 text-amber-500" />;
      case 'MENTION': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'BLOCKED': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertCircle className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold tracking-wider text-[var(--text-tertiary)] uppercase">Signals</h3>
        <Badge variant="danger" className="text-xs">
          {interrupts.length} Action{interrupts.length !== 1 ? 's' : ''} Required
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {interrupts.map((signal) => (
          <Card 
            key={signal.id} 
            variant="interactive"
            className="!border-l-4 !border-l-[var(--warning)]"
            onClick={() => {
              if (signal.taskId) {
                open('task', { taskId: signal.taskId });
              } else {
                open('signal', { signalId: signal.id, signal: signal });
              }
            }}
          >
            <CardContent className="p-4 flex gap-3 items-start">
              <div className="mt-0.5 bg-[var(--bg-subtle)] p-2 rounded-md">
                {getIcon(signal.type)}
              </div>
              <div>
                <h4 className="text-sm font-medium text-[var(--text-primary)] line-clamp-1">
                  {signal.title}
                </h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2">
                  {signal.message}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { useDrawerManager } from '@/shared/workspace-framework';
import { useMarkRead } from '@/platform/notifications/hooks/useNotifications';
import { 
  AlertTriangle, CheckSquare, MessageSquare, Megaphone, 
  ExternalLink, Clock, Bell, ArrowRight, User 
} from '@/shared/ui/Icons';

const SIGNAL_CONFIG = {
  TASK_BLOCKED: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Blocked',
    badgeVariant: 'destructive',
  },
  APPROVAL_REQUIRED: {
    icon: CheckSquare,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Approval Required',
    badgeVariant: 'warning',
  },
  TASK_SUBMITTED: {
    icon: CheckSquare,
    iconColor: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    label: 'Submitted for Review',
    badgeVariant: 'warning',
  },
  TASK_IN_PROGRESS: {
    icon: User,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Assigned to You',
    badgeVariant: 'secondary',
  },
  TASK_DUE_SOON: {
    icon: Clock,
    iconColor: 'text-orange-500',
    bgColor: 'bg-orange-500/10',
    label: 'Due Soon',
    badgeVariant: 'warning',
  },
  TASK_OVERDUE: {
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    bgColor: 'bg-red-500/10',
    label: 'Overdue',
    badgeVariant: 'destructive',
  },
  TASK_COMMENTED: {
    icon: MessageSquare,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Comment',
    badgeVariant: 'secondary',
  },
  MENTION: {
    icon: MessageSquare,
    iconColor: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    label: 'Mentioned You',
    badgeVariant: 'secondary',
  },
  ANNOUNCEMENT_CREATED: {
    icon: Megaphone,
    iconColor: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    label: 'Announcement',
    badgeVariant: 'secondary',
  },
};

const DEFAULT_CONFIG = {
  icon: Bell,
  iconColor: 'text-slate-500',
  bgColor: 'bg-slate-500/10',
  label: 'Signal',
  badgeVariant: 'secondary',
};

export function SignalDrawer({ payload, onClose }) {
  const { open } = useDrawerManager();
  const markRead = useMarkRead();
  const displaySignal = payload?.signal;

  if (!displaySignal) {
    return <div className="p-6 text-[var(--text-tertiary)]">Signal not found.</div>;
  }

  const config = SIGNAL_CONFIG[displaySignal.type] || DEFAULT_CONFIG;
  const Icon = config.icon;

  const handleViewTask = () => {
    if (displaySignal.taskId) {
      open('task', { taskId: displaySignal.taskId });
    }
  };

  const handleMarkResolved = () => {
    if (displaySignal.id) {
      markRead.mutate(displaySignal.id);
    }
    onClose?.();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-[var(--color-border-subtle)]">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl ${config.bgColor} flex items-center justify-center shrink-0`}>
            <Icon className={`h-5 w-5 ${config.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="text-[10px] px-2 py-0.5">
                {config.label}
              </Badge>
              {displaySignal.relativeTime && (
                <span className="text-[11px] text-[var(--text-tertiary)]">{displaySignal.relativeTime}</span>
              )}
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] leading-tight">
              {displaySignal.title}
            </h2>
          </div>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Message */}
        <div className="bg-[var(--bg-subtle)] p-4 rounded-xl border border-[var(--color-border-subtle)]">
          <p className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {displaySignal.message}
          </p>
        </div>

        {/* Actor info */}
        {displaySignal.actorUsername && (
          <div className="flex items-center gap-3 px-1">
            <div className="w-7 h-7 rounded-full bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center text-[11px] font-bold">
              {displaySignal.actorUsername.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-[var(--text-primary)]">{displaySignal.actorUsername}</p>
              <p className="text-[10px] text-[var(--text-tertiary)]">Triggered this signal</p>
            </div>
          </div>
        )}

        {/* Related task */}
        {displaySignal.taskId && (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Related Task</h3>
            <button
              onClick={handleViewTask}
              className="w-full flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border-subtle)] hover:bg-[var(--bg-hover)] transition-colors text-left"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                  {displaySignal.taskTitleSnapshot || 'View Task'}
                </p>
                <p className="text-[11px] text-[var(--text-tertiary)]">Click to open task details</p>
              </div>
              <ExternalLink className="h-4 w-4 text-[var(--text-tertiary)] shrink-0" />
            </button>
          </div>
        )}

        {/* Type-specific actions */}
        {(displaySignal.type === 'APPROVAL_REQUIRED' || displaySignal.type === 'TASK_SUBMITTED') && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Required Action</h3>
            <div className="flex gap-3">
              <Button 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleViewTask}
              >
                <CheckSquare className="h-4 w-4 mr-2" />
                Review & Approve
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleViewTask}>
                View Task
              </Button>
            </div>
          </div>
        )}

        {(displaySignal.type === 'TASK_BLOCKED') && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Action Required</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              This task is blocked and needs your attention to unblock progress.
            </p>
            <Button onClick={handleViewTask} className="w-full">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Resolve Blocker
            </Button>
          </div>
        )}

        {(displaySignal.type === 'TASK_OVERDUE' || displaySignal.type === 'TASK_DUE_SOON') && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Deadline Alert</h3>
            <Button onClick={handleViewTask} className="w-full">
              <ArrowRight className="h-4 w-4 mr-2" />
              Open Task
            </Button>
          </div>
        )}

        {displaySignal.type === 'ANNOUNCEMENT_CREATED' && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Organization Announcement</h3>
            <p className="text-xs text-[var(--text-secondary)]">
              This announcement was broadcasted to your workspace.
            </p>
          </div>
        )}

        {(displaySignal.type === 'MENTION' || displaySignal.type === 'TASK_COMMENTED') && displaySignal.taskId && (
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Conversation</h3>
            <Button onClick={handleViewTask} variant="outline" className="w-full">
              <MessageSquare className="h-4 w-4 mr-2" />
              Go to Thread
            </Button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--color-border-subtle)] flex justify-end gap-3 bg-[var(--bg-subtle)]">
        <Button variant="outline" size="sm" onClick={onClose}>Close</Button>
        <Button size="sm" onClick={handleMarkResolved}>
          Mark as Resolved
        </Button>
      </div>
    </div>
  );
}

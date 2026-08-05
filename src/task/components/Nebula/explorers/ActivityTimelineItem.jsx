import React from 'react';
import { cn } from '@/shared/lib/cn';
import { formatDistanceToNow } from 'date-fns';
import { 
  CheckCircle2, 
  CircleDashed, 
  PlayCircle, 
  UserPlus, 
  FileEdit,
  XCircle,
  MessageSquare,
  AlertCircle,
  ArrowRightLeft
} from '@/shared/ui/Icons';

const getEventIcon = (type, toStatus) => {
  switch (type) {
    case 'CREATED':
    case 'TASK_CREATED':
      return <CircleDashed size={14} className="text-cyan-500" />;
    case 'STATUS_CHANGED':
      if (toStatus === 'COMPLETED' || toStatus === 'DONE') {
        return <CheckCircle2 size={14} className="text-emerald-500" />;
      }
      if (toStatus === 'IN_PROGRESS') {
        return <PlayCircle size={14} className="text-blue-500" />;
      }
      return <ArrowRightLeft size={14} className="text-amber-500" />;
    case 'IN_PROGRESS':
      return <UserPlus size={14} className="text-purple-500" />;
    case 'REJECTED':
      return <XCircle size={14} className="text-rose-500" />;
    case 'UPDATED':
      return <FileEdit size={14} className="text-slate-400" />;
    case 'COMMENT_ADDED':
      return <MessageSquare size={14} className="text-indigo-400" />;
    default:
      return <AlertCircle size={14} className="text-slate-500" />;
  }
};

const formatRelativeTime = (date) => {
  if (!date) return '';
  try {
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (e) {
    return '';
  }
};

export default function ActivityTimelineItem({ event }) {
  const icon = getEventIcon(event.type, event.toStatus);
  const relativeTime = event.relativeTime || formatRelativeTime(event.timestamp || event.occurredAt || event.createdAt);

  const renderContent = () => {
    switch (event.type) {
      case 'CREATED':
      case 'TASK_CREATED':
        return <span>Task created</span>;
      case 'STATUS_CHANGED':
        return (
          <span>
            Changed status from <span className="font-medium text-[var(--text-primary)]">{event.fromStatus || 'None'}</span> to <span className="font-medium text-[var(--text-primary)]">{event.toStatus}</span>
          </span>
        );
      case 'IN_PROGRESS':
        return <span>Assigned task</span>;
      case 'REJECTED':
        return <span>Rejected task</span>;
      default:
        return <span>{(event.type || 'activity').replace(/_/g, ' ').toLowerCase()}</span>;
    }
  };

  const actorName = event.actor?.fullName || event.actor?.username || event.performedBy || 'User';
  const displayDate = event.timestamp || event.occurredAt || event.createdAt;

  return (
    <div className="relative pl-6 py-1.5">
      {/* Icon node */}
      <div className="absolute left-[-5px] top-2 w-6 h-6 rounded-full bg-[var(--bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center z-10 shadow-sm">
        {icon}
      </div>
      
      <div className="text-[10px] text-[var(--text-tertiary)] font-mono mb-0.5 flex items-center gap-2">
        <span>{displayDate ? new Date(displayDate).toLocaleDateString() : ''}</span>
        {relativeTime && <span className="text-[var(--text-muted)]">{relativeTime}</span>}
      </div>
      
      <div className="text-xs text-[var(--text-secondary)] leading-normal">
        <span className="font-semibold text-[var(--text-primary)] mr-1">{actorName}</span>
        {renderContent()}
      </div>

      {event.reason && (
        <div className="mt-1.5 p-2 rounded bg-[var(--bg-subtle)] border border-[var(--color-border-subtle)] text-xs text-[var(--text-primary)] italic border-l-2 border-l-rose-500">
          "{event.reason}"
        </div>
      )}
    </div>
  );
}

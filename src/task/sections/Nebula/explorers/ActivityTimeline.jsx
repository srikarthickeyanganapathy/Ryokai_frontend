import React, { useState } from 'react';
import { useTaskHistory } from '../../../entities/hooks/useTasks';
import ActivityTimelineItem from './ActivityTimelineItem';
import { Loader2 } from 'lucide-react';

export default function ActivityTimeline({ taskId }) {
  const [page, setPage] = useState(0);
  const size = 20;

  const { data: pageData, isLoading, isError } = useTaskHistory(taskId, { page, size, sort: 'occurredAt,desc' });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6 text-[var(--text-muted)]">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--accent)]" />
      </div>
    );
  }

  if (isError) {
    return <div className="text-sm text-[var(--danger)] p-4">Failed to load activity history.</div>;
  }

  const events = pageData?.content || [];

  if (events.length === 0) {
    return <div className="text-xs text-[var(--text-muted)] italic p-4">No activity recorded yet.</div>;
  }

  return (
    <div className="space-y-0 relative">
      {/* Vertical line connecting the timeline items */}
      <div className="absolute left-[7px] top-4 bottom-0 w-px bg-[var(--color-border-subtle)] z-0" />
      
      {events.map((event, index) => (
        <ActivityTimelineItem key={event.id || index} event={event} />
      ))}

      {pageData?.hasNext && (
        <div className="pt-4 flex justify-center relative z-10">
          <button 
            onClick={() => setPage(p => p + 1)}
            className="text-[11px] uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors bg-[var(--bg-elevated)] px-3 py-1 border border-[var(--color-border-subtle)] rounded-full font-mono"
          >
            Load Older
          </button>
        </div>
      )}
      
      {page > 0 && !pageData?.hasNext && (
        <div className="pt-4 flex justify-center relative z-10">
          <span className="text-[10px] text-[var(--text-tertiary)] bg-[var(--bg-elevated)] px-2 py-1 font-mono">End of history</span>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/Card';
import { useNotificationList } from '@/platform/notifications/hooks/useNotifications';
import { Inbox, ArrowRight } from '@/shared/ui/Icons';
import { useNavigate } from 'react-router-dom';
import { useDrawerManager } from '@/shared/workspace-framework';

export function InboxWidget() {
  // Use the existing notification hook instead of raw api.get
  const { data: notifications = [], isLoading } = useNotificationList({ page: 0, size: 5 });
  const navigate = useNavigate();
  const { open } = useDrawerManager();

  return (
    <Card className="group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Inbox className="h-4 w-4 text-[var(--accent)]" />
            Inbox
          </CardTitle>
          <button 
            onClick={() => navigate('/app/inbox')}
            className="text-xs text-[var(--text-tertiary)] hover:text-[var(--accent)] flex items-center gap-1 transition-colors"
          >
            View All <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="h-8 rounded-lg bg-[var(--bg-subtle)] animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-4">
            <Inbox className="h-8 w-8 mx-auto text-[var(--text-tertiary)] mb-2 opacity-40" />
            <p className="text-xs text-[var(--text-tertiary)]">Inbox is clear</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {notifications.slice(0, 5).map(msg => (
              <div 
                key={msg.id} 
                className="flex items-start gap-2.5 px-3 py-2 rounded-lg hover:bg-[var(--bg-hover)] cursor-pointer transition-colors"
                onClick={() => open('signal', { signalId: msg.id, signal: msg })}
              >
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${msg.isRead ? 'bg-transparent' : 'bg-[var(--accent)]'}`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-[var(--text-primary)] truncate">{msg.title}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)]">{msg.relativeTime}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { Hash, Pin } from '@/shared/ui/Icons';

/* Channel header bar with pinned announcements trigger. */
export function ChannelHeader({ channel, pinnedCount, onOpenPinnedDrawer }) {
  return (
    <div className="px-5 py-3 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-card)] shadow-xs">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
          <Hash className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight truncate mb-0">
              #{channel.name}
            </Heading>
            <Badge variant="primary" size="xs">{channel.type === 'VOICE' ? 'Voice' : 'Text'}</Badge>
          </div>
          <Text variant="muted" className="text-[11px] truncate">Squad communication stream</Text>
        </div>
      </div>

      {/* Pinned announcements trigger button */}
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="h-8 px-2.5 text-[12px] gap-1.5 rounded-lg border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--accent)] hover:bg-[var(--accent-soft)]"
          onClick={onOpenPinnedDrawer}
          title="View Pinned Announcements"
        >
          <Pin className="w-3.5 h-3.5 text-[var(--warning)] fill-[var(--warning-soft)]" />
          <span className="hidden sm:inline font-medium">Pinned</span>
          {pinnedCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[var(--warning-soft)] text-[var(--warning)] text-[10px] font-bold font-mono">
              {pinnedCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

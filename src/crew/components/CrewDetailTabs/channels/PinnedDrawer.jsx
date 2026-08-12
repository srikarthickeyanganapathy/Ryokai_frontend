import React, { useMemo } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription } from '@/shared/ui/Drawer';
import { Pin } from '@/shared/ui/Icons';
import { useChannelMessages } from '../../../features/hooks/useCrews';

/* Pinned messages drawer: lists pinned announcements for a channel. */
export function PinnedDrawer({ open, onOpenChange, channelName, pinnedIds, crewId, channelId, onUnpin }) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent side="right" className="sm:max-w-md bg-[var(--bg-card)] p-5 border-l border-[var(--border-subtle)] flex flex-col h-full">
        <DrawerHeader className="border-b border-[var(--border-subtle)] pb-3 mb-3 text-left">
          <DrawerTitle className="text-[15px] font-semibold flex items-center gap-2">
            <Pin className="w-4 h-4 text-[var(--warning)] fill-[var(--warning-soft)]" /> Pinned Announcements
          </DrawerTitle>
          <DrawerDescription className="text-[12px]">
            Pinned messages in #{channelName}
          </DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
          {pinnedIds?.length > 0 ? (
            <PinnedMessagesList 
              crewId={crewId} 
              channelId={channelId} 
              pinnedIds={pinnedIds}
              onUnpin={onUnpin} 
            />
          ) : (
            <div className="text-center py-12 text-[12px] text-[var(--text-muted)] italic">
              No pinned messages in this channel yet.
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function PinnedMessagesList({ crewId, channelId, pinnedIds, onUnpin }) {
  const { data: messages = [] } = useChannelMessages(crewId, channelId);
  const pinnedMessages = useMemo(() => {
    return messages.filter(m => pinnedIds.includes(m.id));
  }, [messages, pinnedIds]);

  return (
    <div className="space-y-2">
      {pinnedMessages.map((msg) => (
        <div key={msg.id} className="group flex items-start gap-2.5 p-2.5 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)] text-[11px]">
          <Pin className="w-3 h-3 text-[var(--warning)] shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <span className="text-[11px] font-semibold text-[var(--text-primary)] truncate">@{msg.authorUsername}</span>
              <button 
                onClick={() => onUnpin(msg.id)} 
                className="text-[10px] text-[var(--danger)] hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                Unpin
              </button>
            </div>
            <p className="text-[12px] text-[var(--text-secondary)] leading-relaxed">{msg.content}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

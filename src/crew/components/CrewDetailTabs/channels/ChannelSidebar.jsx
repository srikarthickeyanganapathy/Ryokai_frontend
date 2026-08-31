import React, { useState, useMemo } from 'react';
import { Button } from '@/shared/ui/Button';
import { SearchInput } from '@/shared/ui/SearchInput';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { Hash, Volume2, Plus, Trash2 } from '@/shared/ui/Icons';

/* Column 1: Channels sidebar -- search, text channels, voice rooms. */
export function ChannelSidebar({ channels, activeChannel, isCreator, unreadCounts, onSelectChannel, onDeleteChannel, onOpenCreate }) {
  const [channelSearch, setChannelSearch] = useState('');

  // Filter channels based on search
  const filteredChannels = useMemo(() => {
    if (!channelSearch.trim()) return channels;
    return channels.filter(c => c.name.toLowerCase().includes(channelSearch.toLowerCase()));
  }, [channels, channelSearch]);

  const textChannels = useMemo(() => filteredChannels.filter(c => c.type !== 'VOICE'), [filteredChannels]);
  const voiceChannels = useMemo(() => filteredChannels.filter(c => c.type === 'VOICE'), [filteredChannels]);

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Channel Header & Filter */}
      <div className="p-3.5 border-b border-[var(--border-subtle)] shrink-0 space-y-3 bg-[var(--bg-subtle)]/40">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
              <Hash className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight truncate">Channels</p>
              <p className="text-[10px] text-[var(--text-muted)] leading-tight truncate">Text & voice for the squad</p>
            </div>
          </div>
          {isCreator ? (
            <Button 
              size="sm" 
              variant="ghost" 
              className="gap-1 h-7 px-2 text-[11px] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)] rounded-lg transition-colors shrink-0" 
              onClick={onOpenCreate} 
              title="Create New Channel"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </Button>
          ) : (
            <Badge variant="default" size="xs">Read-only</Badge>
          )}
        </div>

        {/* Search Input */}
        <SearchInput
          value={channelSearch}
          onChange={setChannelSearch}
          placeholder="Search channels..."
          debounceMs={0}
        />
      </div>

      {/* Channels List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-4">
        {/* Text Channels Category */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center justify-between">
            <span>Text Channels</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-sans">{textChannels.length}</span>
          </div>
          <div className="space-y-1">
            {textChannels.map((chan) => {
              const isActive = activeChannel?.id === chan.id;
              const unread = unreadCounts[chan.id] || 0;
              return (
                <div 
                  key={chan.id} 
                  onClick={() => onSelectChannel(chan)} 
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium relative", 
                    isActive 
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-xs" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Hash className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                    <span className="truncate">{chan.name}</span>
                  </span>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {unread > 0 && !isActive && (
                      <Badge variant="primary" size="xs" className="font-mono font-bold animate-pulse">
                        {unread}
                      </Badge>
                    )}
                    {isCreator && (
                      <button 
                        onClick={(e) => onDeleteChannel(chan.id, e)} 
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", 
                          isActive && "opacity-100"
                        )}
                        title="Delete channel"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {textChannels.length === 0 && (
              <div className="text-center py-5 px-3 border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-subtle)]/30">
                <p className="text-[11px] text-[var(--text-muted)] italic mb-2">No matching text channels.</p>
                {isCreator && (
                  <Button size="sm" variant="outline" onClick={onOpenCreate} className="h-7 text-[11px] w-full rounded-lg">
                    + Create Channel
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Voice Rooms Category */}
        <div>
          <div className="px-2 pb-1.5 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center justify-between">
            <span>Voice Rooms</span>
            <span className="text-[10px] text-[var(--text-tertiary)] font-sans">{voiceChannels.length}</span>
          </div>
          <div className="space-y-1">
            {voiceChannels.map((chan) => {
              const isActive = activeChannel?.id === chan.id;
              return (
                <div 
                  key={chan.id} 
                  onClick={() => onSelectChannel(chan)} 
                  className={cn(
                    "group flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all text-[13px] font-medium", 
                    isActive 
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] shadow-xs" 
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent"
                  )}
                >
                  <span className="flex items-center gap-2 min-w-0">
                    <Volume2 className={cn("w-4 h-4 shrink-0", isActive ? "text-[var(--accent)]" : "text-[var(--text-muted)]")} />
                    <span className="truncate">{chan.name}</span>
                  </span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="w-2 h-2 rounded-full bg-[var(--success)] animate-pulse" />
                    {isCreator && (
                      <button 
                        onClick={(e) => onDeleteChannel(chan.id, e)} 
                        className={cn(
                          "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:text-[var(--danger)] hover:bg-[var(--danger-soft)]", 
                          isActive && "opacity-100"
                        )}
                        title="Delete voice room"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {voiceChannels.length === 0 && (
              <p className="text-[11px] text-[var(--text-muted)] italic px-2 py-1">No active voice rooms.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

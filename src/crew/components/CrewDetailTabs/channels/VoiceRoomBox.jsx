import React, { useState } from 'react';
import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { Volume2, Mic, MicOff, PhoneOff } from '@/shared/ui/Icons';
import { getAvatarGradient } from './utils';

/* Voice room stage: join/leave/mute UI with active speakers. */
export function VoiceRoomBox({ crewId, channel, members }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  return (
    <div className="flex flex-col h-full items-center justify-center p-8 text-center bg-[var(--bg-base)]">
      <div className="w-16 h-16 rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center mb-5 border border-[var(--accent-border)] shadow-xs">
        <Volume2 className="w-8 h-8" />
      </div>
      <Heading level={3} className="text-[16px] font-semibold text-[var(--text-primary)] tracking-tight">
        Voice Stage: {channel.name}
      </Heading>
      <Text variant="muted" className="text-[13px] max-w-sm mt-1 mb-6">
        Real-time audio stage for squad standups, pair programming, and quick huddles.
      </Text>

      <div className="w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 mb-6 shadow-xs">
        <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider font-semibold text-[var(--text-muted)] border-b border-[var(--border-subtle)] pb-2.5 mb-3.5">
          <span>Active Speakers</span>
          <Badge variant={isConnected ? "success" : "default"} size="xs">
            {isConnected ? '1 Connected' : '0 Connected'}
          </Badge>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {members.slice(0, 6).map((m) => (
            <div key={m.userId} className={cn(
              "flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all", 
              isConnected ? "bg-[var(--accent-soft)]/40 border-[var(--accent-border)]" : "bg-[var(--bg-subtle)] border-[var(--border-subtle)]"
            )}>
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-bold text-white shadow-sm"
                style={{ background: getAvatarGradient(m.username) }}
              >
                {(m.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="text-[11px] font-semibold truncate text-[var(--text-primary)]">@{m.username}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        {isConnected ? (
          <>
            <Button 
              size="sm" 
              variant={isMuted ? "outline" : "secondary"} 
              className={cn("h-10 w-10 p-0 rounded-full shadow-xs", isMuted && "text-[var(--danger)] border-[var(--danger)]/30")} 
              onClick={() => setIsMuted(!isMuted)}
              title={isMuted ? "Unmute Mic" : "Mute Mic"}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-10 px-5 text-[12px] font-semibold text-[var(--danger)] border-[var(--danger)]/30 hover:bg-[var(--danger-soft)] rounded-full gap-2" 
              onClick={() => setIsConnected(false)}
            >
              <PhoneOff className="w-4 h-4" /> Leave Stage
            </Button>
          </>
        ) : (
          <Button size="sm" className="h-10 px-6 text-[13px] font-semibold gap-2 shadow-xs rounded-full" onClick={() => setIsConnected(true)}>
            <Volume2 className="w-4 h-4" /> Join Voice Stage
          </Button>
        )}
      </div>
    </div>
  );
}

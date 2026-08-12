import React from 'react';
import { Badge } from '@/shared/ui/Badge';
import { UsersIcon } from '@/shared/ui/Icons';
import { getAvatarGradient } from './utils';

/* Column 3: Squad members sidebar. */
export function MembersSidebar({ members }) {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="px-3.5 py-3 border-b border-[var(--border-subtle)] shrink-0 bg-[var(--bg-subtle)]/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <UsersIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-[var(--text-primary)] leading-tight">Active Squad</p>
            <p className="text-[10px] text-[var(--text-muted)] leading-tight">Who's in the room</p>
          </div>
          <Badge variant="secondary" size="xs" className="font-mono">{members.length}</Badge>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
        {members.map((m) => (
          <div key={m.userId} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--bg-hover)] transition-colors cursor-pointer group">
            <div className="relative shrink-0">
              <div 
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-bold text-white shadow-sm"
                style={{ background: getAvatarGradient(m.username) }}
              >
                {(m.username || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[var(--success)] ring-2 ring-[var(--bg-card)]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[13px] font-semibold text-[var(--text-primary)] truncate group-hover:text-[var(--accent)] transition-colors">@{m.username}</span>
                {m.role === 'CREATOR' && <span className="text-[var(--warning)] text-[11px]" title="Crew Owner">👑</span>}
              </div>
              <span className="text-[10px] text-[var(--text-muted)] block truncate font-medium">
                {m.role === 'CREATOR' ? 'Crew Owner' : 'Squad Member'}
              </span>
            </div>
          </div>
        ))}

        {members.length === 0 && (
          <div className="p-4 text-center text-[12px] text-[var(--text-muted)] italic">
            No members found.
          </div>
        )}
      </div>
    </div>
  );
}

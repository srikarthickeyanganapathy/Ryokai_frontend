import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/shared/ui/Badge';
import { Text } from '@/shared/ui/Typography';
import { TrendingUp, ChevronDown, ChevronUp, UserPlus } from '@/shared/ui/Icons';
import { hashHue, timeAgo } from './directoryUtils';

// ───────── Recent Activity Feed ─────────
// Collapsible feed showing recently joined members + role-change history.
// Expansion state is controlled by the parent (`expanded` / `onToggleExpanded`).

export function RecentActivityFeed({ recentlyJoined, expanded, onToggleExpanded, onSelectMember }) {
  return (
    <div className="mt-8 border border-[var(--border-subtle)] rounded-xl bg-[var(--bg-elevated)] overflow-hidden">
      <button
        type="button"
        onClick={onToggleExpanded}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-subtle)]/50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <TrendingUp className="w-4 h-4 text-[var(--accent)]" />
          <span className="text-sm font-semibold text-[var(--text-primary)]">Recent Activity</span>
          <Badge variant="outline" className="text-[10px]">
            {recentlyJoined.length > 0 ? `${recentlyJoined.length} joined` : 'All caught up'}
          </Badge>
        </div>
        {expanded
          ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
          : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        }
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              {/* Recently Joined */}
              <div className="space-y-2">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Recently Joined (last 30 days)
                </Text>
                {recentlyJoined.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {recentlyJoined.slice(0, 6).map(member => {
                      const joinedDate = member.joinedAt || member.createdAt;
                      return (
                        <div
                          key={member.userId}
                          className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] cursor-pointer hover:border-[var(--accent-border)] transition-colors"
                          onClick={() => onSelectMember(member)}
                        >
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-sm shrink-0"
                            style={{ background: `linear-gradient(135deg, hsl(${hashHue(member.username || '?')} 60% 46%), hsl(${(hashHue(member.username || '?') + 45) % 360} 65% 36%))` }}
                          >
                            {member.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-[var(--text-primary)] truncate">{member.username}</div>
                            <div className="flex items-center gap-2 text-[10px] text-[var(--text-muted)]">
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0">{member.orgRole}</Badge>
                              {joinedDate && <span>{timeAgo(new Date(joinedDate))}</span>}
                            </div>
                          </div>
                          <UserPlus className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                    No new members joined in the last 30 days
                  </div>
                )}
              </div>

              {/* Role Changes */}
              <div className="space-y-2">
                <Text className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                  Role Changes (this week)
                </Text>
                <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                  No role changes recorded this week
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Modal, ModalContent } from '@/shared/ui/Modal';
import { Heading, Text } from '@/shared/ui/Typography';
import { IconButton } from '@/shared/ui/Button';
import { X, GitCompare, Users } from '@/shared/ui/Icons';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { hashHue } from './directoryUtils';

// --- Member Compare Modal ---
// Side-by-side comparison of two selected members (teams, tasks, priority,
// last active, workload bars, shared teams). Fully controlled by the parent.

export function MemberCompareModal({ open, onOpenChange, compareMembers }) {
  return (
    <Modal open={open} onOpenChange={onOpenChange}>
      {compareMembers && (
        <ModalContent className="max-w-2xl p-0 gap-0 overflow-hidden">
          {/* Modal header */}
          <div className="flex items-center justify-between p-5 border-b border-[var(--border-subtle)]">
            <div className="flex items-center gap-2.5">
              <GitCompare className="w-5 h-5 text-[var(--accent)]" />
              <Heading level={2} className="text-[15px] font-semibold text-[var(--text-primary)]">
                Member Comparison
              </Heading>
            </div>
            <IconButton
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="h-8 w-8"
              aria-label="Close comparison"
            >
              <X className="w-4 h-4" />
            </IconButton>
          </div>

          {/* Modal body -- side-by-side comparison */}
          <div className="p-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Member A */}
              {[compareMembers.memberA, compareMembers.memberB].map((m, idx) => {
                const hue = hashHue(m.username || '?');
                return (
                  <div key={m.userId} className="space-y-3 p-4 rounded-xl bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)]">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm shrink-0 relative"
                        style={{ background: `linear-gradient(135deg, hsl(${hue} 60% 46%), hsl(${(hue + 45) % 360} 65% 36%))` }}
                      >
                        {m.username?.charAt(0).toUpperCase() || '?'}
                        {m.isActiveNow && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[var(--success)] border-2 border-[var(--bg-elevated)] rounded-full" title="Active now" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-[var(--text-primary)] truncate">{m.username}</div>
                        <Badge variant="outline" className="text-[9px]">{m.orgRole}</Badge>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Teams</span>
                        <span className="font-semibold text-[var(--text-primary)]">{m.teamsCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Tasks</span>
                        <span className="font-semibold text-[var(--text-primary)]">{m.tasksCount}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Priority</span>
                        <span className="font-semibold text-[var(--text-primary)]">#{m.rolePriority ?? 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--text-muted)]">Last active</span>
                        <span className="font-semibold text-[var(--text-primary)]">{m.lastActive || 'No activity'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Task count bar comparison */}
            <div className="space-y-2">
              <Text className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Task Workload Comparison
              </Text>
              <div className="space-y-2">
                {[
                  { label: compareMembers.memberA.username, count: compareMembers.memberA.tasksCount, color: 'bg-[var(--accent)]' },
                  { label: compareMembers.memberB.username, count: compareMembers.memberB.tasksCount, color: 'bg-[var(--accent)]' },
                ].map(item => {
                  const maxTasks = Math.max(compareMembers.memberA.tasksCount, compareMembers.memberB.tasksCount, 1);
                  const pct = Math.round((item.count / maxTasks) * 100);
                  return (
                    <div key={item.label} className="flex items-center gap-3">
                      <span className="text-[11px] text-[var(--text-secondary)] w-24 truncate">{item.label}</span>
                      <div className="flex-1 h-2 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className={cn("h-full rounded-full", item.color)}
                        />
                      </div>
                      <span className="text-[11px] font-mono font-semibold text-[var(--text-primary)] w-6 text-right">{item.count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Team overlap */}
            <div className="space-y-2">
              <Text className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Shared Teams ({compareMembers.sharedTeams.length})
              </Text>
              {compareMembers.sharedTeams.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {compareMembers.sharedTeams.map(team => (
                    <Badge key={team.id || team.name} variant="outline" className="text-[10px] bg-[var(--bg-card)]">
                      <Users className="w-2.5 h-2.5 mr-1 text-[var(--accent)]" />
                      {team.name}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[var(--text-muted)] italic p-2 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                  These members don't share any teams
                </div>
              )}
            </div>
          </div>
        </ModalContent>
      )}
    </Modal>
  );
}

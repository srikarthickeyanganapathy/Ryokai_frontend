import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { Trash2 } from '@/shared/ui/Icons';
import { MemberAvatar, RoleBadge } from './MemberAvatar';
import { PRESENCE_CONFIG, formatJoinDate, getMemberPresence, highlightText } from './utils';

// --- Compact Table View Component ---
export function MemberTable({ members, isCreator, searchQuery, getWorkload, onSelect, onTransfer, onRemove }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[var(--bg-subtle)]/70 border-b border-[var(--border-subtle)]">
            <tr>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Member</th>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Role</th>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Presence</th>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Workload</th>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Joined</th>
              <th className="py-3 px-4 text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {members.map((member) => {
              const workload = getWorkload(member.username);
              const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';
              const presence = getMemberPresence(member);
              const presenceCfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.active;

              return (
                <tr
                  key={member.userId || member.username}
                  onClick={() => onSelect(member)}
                  className="hover:bg-[var(--bg-subtle)]/50 transition-colors cursor-pointer group"
                >
                  {/* Member Name & Email */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <MemberAvatar member={member} size="sm" />
                      <div className="min-w-0">
                        <span className="font-semibold text-[var(--text-primary)] block truncate text-[13px]">
                          {highlightText(member.username || 'Unknown', searchQuery)}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block truncate">
                          {highlightText(member.email || 'No email', searchQuery)}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="py-3.5 px-4">
                    <RoleBadge member={member} />
                  </td>

                  {/* Presence Status */}
                  <td className="py-3.5 px-4">
                    <span className={cn('inline-flex items-center gap-1.5 text-[12px] font-medium', presenceCfg.textColor)}>
                      <span className={cn('w-2 h-2 rounded-full shrink-0', presenceCfg.dotBg)} />
                      <span>{presenceCfg.label}</span>
                    </span>
                  </td>

                  {/* Workload Indicator */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 max-w-[130px]">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
                          {workload.active} Active
                        </span>
                        <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 font-semibold', workload.badgeClass)}>
                          {workload.level}
                        </Badge>
                      </div>
                      <div className="w-full h-1 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                        <div
                          className={cn('h-full rounded-full', workload.colorClass)}
                          style={{ width: `${Math.min(100, Math.max(10, (workload.active / 6) * 100))}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 text-[12px] text-[var(--text-muted)]">
                    {formatJoinDate(member.joinedAt, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 text-[12px] px-2 font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
                        onClick={() => onSelect(member)}
                      >
                        Details
                      </Button>

                      {isCreator && !isOwner && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[11px] px-2 font-semibold"
                            onClick={() => onTransfer(member.userId)}
                          >
                            Transfer Owner
                          </Button>
                          <IconButton
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                            title="Remove member"
                            aria-label="Remove member"
                            onClick={() => onRemove(member.userId)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </IconButton>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

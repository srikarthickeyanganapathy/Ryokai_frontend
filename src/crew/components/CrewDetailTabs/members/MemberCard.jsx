import { motion } from 'framer-motion';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { cn } from '@/shared/lib/cn';
import { Mail, Briefcase, CalendarDays, ChevronRight, Trash2 } from '@/shared/ui/Icons';
import { RoleBadge, PresenceChip, MemberAvatar } from './MemberAvatar';
import { formatJoinDate, getMemberPresence, highlightText } from './utils';

// --- Minimalist Member Grid Card Component (teams design language) ---
export function MemberCard({ member, isCreator, index, searchQuery, workload, onSelect, onTransfer, onRemove }) {
  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';
  const presence = getMemberPresence(member);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03, duration: 0.2 }}
      onClick={() => onSelect(member)}
      className="group bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 hover:border-[var(--accent-border)] hover:shadow-sm transition-all duration-200 cursor-pointer flex flex-col justify-between"
    >
      <div>
        {/* Card Header: Role Badge & Presence Status */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <RoleBadge member={member} />
          <PresenceChip presence={presence} />
        </div>

        {/* Member Identity */}
        <div className="flex items-center gap-3 mb-3">
          <MemberAvatar member={member} size="md" />
          <div className="min-w-0 flex-1">
            <div className="text-[14px] font-semibold text-[var(--text-primary)] tracking-tight truncate">
              {highlightText(member.username || 'Unknown', searchQuery)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-[var(--text-muted)] font-medium mt-0.5 truncate">
              <Mail className="w-3 h-3 shrink-0" />
              <span className="truncate">
                {highlightText(member.email || 'No email registered', searchQuery)}
              </span>
            </div>
          </div>
        </div>

        {/* Workload Progress Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1">
              <Briefcase className="w-3 h-3 text-[var(--accent)]" />
              Active Workload
            </span>
            <Badge variant="outline" className={cn('text-[9px] px-1.5 py-0 font-semibold', workload.badgeClass)}>
              {workload.level}
            </Badge>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', workload.colorClass)}
              style={{ width: `${Math.min(100, Math.max(10, (workload.active / 6) * 100))}%` }}
            />
          </div>
        </div>

        {/* Workload Stat Cells */}
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
            <div className="text-sm font-bold text-[var(--text-primary)] tabular-nums">{workload.total}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Total</div>
          </div>
          <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
            <div className="text-sm font-bold text-[var(--accent)] tabular-nums">{workload.active}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Active</div>
          </div>
          <div className="text-center bg-[var(--bg-subtle)] rounded-lg py-1.5">
            <div className="text-sm font-bold text-[var(--success)] tabular-nums">{workload.completed}</div>
            <div className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider">Done</div>
          </div>
        </div>
      </div>

      {/* Card Footer: Metadata & Actions */}
      <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] font-medium">
          <CalendarDays className="w-3 h-3" />
          Joined {formatJoinDate(member.joinedAt, { month: 'short', year: 'numeric' })}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-[12px] px-2 font-medium text-[var(--accent)] hover:bg-[var(--accent-soft)]"
            onClick={() => onSelect(member)}
          >
            Profile
            <ChevronRight className="w-3 h-3 ml-0.5" />
          </Button>

          {isCreator && !isOwner && (
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[11px] px-2 font-semibold border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--warning)]"
                title="Transfer Crew Ownership"
                onClick={() => onTransfer(member.userId)}
              >
                Owner
              </Button>
              <IconButton
                variant="ghost"
                size="sm"
                className="h-8 w-8 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                title="Remove Member"
                aria-label="Remove member"
                onClick={() => onRemove(member.userId)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </IconButton>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}


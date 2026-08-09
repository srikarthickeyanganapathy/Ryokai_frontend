import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heading, Text, Label } from '@/shared/ui/Typography';
import { Button, IconButton } from '@/shared/ui/Button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/shared/ui/Select';
import { Input } from '@/shared/ui/Input';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { toast } from 'sonner';
import { useConfirmDialog } from '@/shared/ui/ConfirmDialog';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/shared/ui/Modal';
import { Drawer, DrawerContent } from '@/shared/ui/Drawer';
import { EmptyState } from '@/shared/ui/EmptyState';
import { ErrorState } from '@/shared/ui/ErrorState';
import {
  useCrewMembers,
  useInviteCrewMember,
  useCreateCrewInviteLink,
  useRemoveCrewMember,
  useTransferCrewOwnership,
} from '@/crew';
import { useTaskList } from '@/task';
import {
  Search,
  UserPlus,
  Link2,
  Copy,
  Check,
  Mail,
  Trash2,
  Crown,
  ShieldCheck,
  CalendarDays,
  Activity,
  Users,
  LayoutGrid,
  List,
  Sparkles,
  Briefcase,
  CheckCircle2,
  X,
  Zap,
  Flame,
  UserCheck,
  Info,
  ChevronRight,
} from '@/shared/ui/Icons';

// --- Presence Configurations (standard app tokens) ---
const PRESENCE_CONFIG = {
  active: {
    label: 'Active',
    dotBg: 'bg-[var(--success)]',
    textColor: 'text-[var(--success)]',
  },
  offline: {
    label: 'Offline',
    dotBg: 'bg-[var(--text-tertiary)]',
    textColor: 'text-[var(--text-muted)]',
  },
};

// Stable fallback timestamp — module scope keeps render pure (React Compiler)
const FALLBACK_NOW = Date.now();

// Deterministic hue for avatar gradients (teams design language)
function hashHue(str) {
  return Math.abs((str || '').split('').reduce((acc, c) => c.charCodeAt(0) + ((acc << 5) - acc), 0)) % 360;
}

function formatJoinDate(joinedAt, options) {
  return new Date(joinedAt || FALLBACK_NOW).toLocaleDateString(undefined, options);
}

function getMemberInitial(member) {
  return (member?.username || 'U').charAt(0).toUpperCase();
}

function getAvatarGradient(member) {
  const hue = hashHue(member?.username || member?.email || '');
  return `linear-gradient(135deg, hsl(${hue} 70% 55%), hsl(${(hue + 35) % 360} 65% 40%))`;
}

function getMemberPresence(member) {
  if (!member) return 'offline';
  if (member.isOnline !== undefined) return member.isOnline ? 'active' : 'offline';
  if (member.presenceStatus) {
    const status = String(member.presenceStatus).toLowerCase();
    return status === 'active' || status === 'online' ? 'active' : 'offline';
  }
  return 'offline';
}

// Workload metrics calculation based on assigned tasks
function getMemberWorkload(username, tasks = []) {
  const memberTasks = tasks.filter(
    (t) =>
      t.assignedTo === username ||
      t.assigneeUsername === username ||
      t.assignee?.username === username ||
      t.userId === username
  );
  const activeTasks = memberTasks.filter(
    (t) => t.status !== 'Done' && t.status !== 'COMPLETED' && t.status !== 'CLOSED'
  );
  const completedTasks = memberTasks.filter(
    (t) => t.status === 'Done' || t.status === 'COMPLETED'
  );

  const count = activeTasks.length;
  let level = 'Low';
  let colorClass = 'bg-[var(--accent)]';
  let badgeClass = 'bg-[var(--accent-soft)] text-[var(--accent)] border-transparent';

  if (count >= 5) {
    level = 'High';
    colorClass = 'bg-rose-500';
    badgeClass = 'bg-rose-500/10 text-rose-500 border-rose-500/20';
  } else if (count >= 3) {
    level = 'Medium';
    colorClass = 'bg-[var(--warning)]';
    badgeClass = 'bg-[var(--warning-soft)] text-[var(--warning)] border-[var(--warning-border)]';
  }

  return {
    total: memberTasks.length,
    active: count,
    completed: completedTasks.length,
    level,
    colorClass,
    badgeClass,
    memberTasks,
  };
}

// Member badges helper
function getMemberBadges(member, workload) {
  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';
  const isAdmin = member.role === 'ADMIN';

  const badges = [];
  if (isOwner) {
    badges.push({
      label: 'Owner',
      icon: Crown,
      class: 'bg-[var(--warning-soft)] text-[var(--warning)] border-transparent',
    });
  } else if (isAdmin) {
    badges.push({
      label: 'Admin',
      icon: ShieldCheck,
      class: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    });
  } else {
    badges.push({
      label: 'Member',
      icon: UserCheck,
      class: 'bg-[var(--bg-subtle)] text-[var(--text-secondary)] border-[var(--border-subtle)]',
    });
  }

  if (workload.completed >= 3) {
    badges.push({
      label: 'Top Contributor',
      icon: Flame,
      class: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    });
  }

  if (getMemberPresence(member) === 'focus') {
    badges.push({
      label: 'Deep Work',
      icon: Zap,
      class: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    });
  }

  return badges;
}

// Helper to highlight search results safely
const highlightText = (text, query) => {
  if (!query || typeof text !== 'string') return text;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark key={i} className="bg-[var(--accent-soft)] text-[var(--accent)] px-0.5 rounded font-medium">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

/* ══════════════════════════════════════════════════════
   Presentational primitives — hoisted to module scope
   (React Compiler: no components defined during render)
   ══════════════════════════════════════════════════════ */

// Role badge chip (shared Badge component — teams design language)
function RoleBadge({ member }) {
  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';

  if (isOwner) {
    return (
      <Badge variant="warning" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <Crown className="w-3 h-3" />
        Owner
      </Badge>
    );
  }
  if (member.role === 'ADMIN') {
    return (
      <Badge variant="primary" size="xs" className="gap-1 font-mono uppercase tracking-wider">
        <ShieldCheck className="w-3 h-3" />
        Admin
      </Badge>
    );
  }
  return (
    <Badge variant="outline" size="xs" className="gap-1 font-mono uppercase tracking-wider text-[var(--text-secondary)]">
      <UserCheck className="w-3 h-3" />
      Member
    </Badge>
  );
}

// Presence status dot + label
function PresenceChip({ presence }) {
  const cfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.offline;
  return (
    <span className={cn('inline-flex items-center gap-1.5 text-[10px] font-medium', cfg.textColor)}>
      <span className={cn('w-2 h-2 rounded-full', cfg.dotBg)} />
      {cfg.label}
    </span>
  );
}

// Hue-gradient avatar with presence dot (teams design language)
function MemberAvatar({ member, size = 'md', className }) {
  const presence = getMemberPresence(member);
  const cfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.offline;

  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-16 h-16 text-xl',
  };
  const dotSizes = {
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <div className={cn('relative shrink-0', className)}>
      <div
        className={cn(
          'rounded-xl flex items-center justify-center font-bold text-white shadow-sm border border-white/10',
          sizes[size]
        )}
        style={{ background: getAvatarGradient(member) }}
      >
        {getMemberInitial(member)}
      </div>
      <span
        className={cn(
          'absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-[var(--bg-card)]',
          dotSizes[size],
          cfg.dotBg
        )}
      />
    </div>
  );
}

// --- Minimalist Member Grid Card Component (teams design language) ---
function MemberCard({ member, isCreator, index, searchQuery, workload, onSelect, onTransfer, onRemove }) {
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
            <div className="text-sm font-bold text-emerald-500 tabular-nums">{workload.completed}</div>
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
                className="h-8 text-[11px] px-2 font-semibold border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-amber-500"
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

// --- Compact Table View Component ---
function MemberTable({ members, isCreator, searchQuery, getWorkload, onSelect, onTransfer, onRemove }) {
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

// --- Interactive Slide-Over Member Detail Drawer ---
function MemberDetailDrawer({ member, isOpen, onClose, workload, isCreator, onTransfer, onRemove }) {
  if (!member) return null;

  const isOwner = member.role === 'CREATOR' || member.role === 'OWNER';
  const presence = getMemberPresence(member);
  const presenceCfg = PRESENCE_CONFIG[presence] || PRESENCE_CONFIG.active;
  const badges = getMemberBadges(member, workload);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent side="right" className="sm:max-w-md w-full flex flex-col h-full bg-[var(--bg-card)] border-l border-[var(--border-subtle)] p-0">
        {/* Drawer Header Banner */}
        <div className="p-5 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/50 relative">
          <div className="flex items-start gap-4">
            <MemberAvatar member={member} size="lg" />

            <div className="min-w-0 flex-1">
              <Heading level={3} className="text-[16px] font-semibold text-[var(--text-primary)] truncate mb-1">
                {member.username || 'Unknown Member'}
              </Heading>

              <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-2">
                <Mail className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{member.email || 'No email provided'}</span>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                {badges.map((b, idx) => {
                  const IconComp = b.icon;
                  return (
                    <span key={idx} className={cn('text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md uppercase flex items-center gap-1 border', b.class)}>
                      <IconComp className="w-3 h-3" />
                      {b.label}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Body Details */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Presence & Focus Card */}
          <div className="space-y-2">
            <Text variant="muted" className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Current Focus & Presence
            </Text>
            <div className="bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)] rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)] font-medium">Status</span>
                <span className={cn('text-xs font-semibold flex items-center gap-1.5', presenceCfg.textColor)}>
                  <span className={cn('w-2 h-2 rounded-full', presenceCfg.dotBg)} />
                  {presenceCfg.label}
                </span>
              </div>
              <div className="pt-2 border-t border-[var(--border-subtle)] flex items-start gap-2">
                <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-muted)]">Active status updated recently</p>
              </div>
            </div>
          </div>

          {/* Workload Metrics Summary */}
          <div className="space-y-2">
            <Text variant="muted" className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Workload Metrics
            </Text>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-xl font-bold text-[var(--text-primary)] block tabular-nums">{workload.total}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Total</span>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-xl font-bold text-[var(--accent)] block tabular-nums">{workload.active}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">In Progress</span>
              </div>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] p-3 text-center">
                <span className="text-xl font-bold text-emerald-500 block tabular-nums">{workload.completed}</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Completed</span>
              </div>
            </div>
          </div>

          {/* Assigned Tasks List */}
          <div className="space-y-3">
            <Text variant="muted" className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Assigned Tasks ({workload.memberTasks.length})
            </Text>

            {workload.memberTasks.length > 0 ? (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {workload.memberTasks.map((t) => (
                  <div key={t.id} className="bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)] rounded-lg p-3 flex items-center justify-between gap-2 hover:border-[var(--border-default)] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{t.title}</p>
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--text-muted)]">
                        <span className="uppercase font-mono">{t.priority || 'Medium'}</span>
                        <span>•</span>
                        <span>{t.dueDate ? new Date(t.dueDate).toLocaleDateString() : 'No due date'}</span>
                      </div>
                    </div>
                    <Badge variant={t.status === 'COMPLETED' || t.status === 'Done' ? 'success' : 'outline'} className="text-[10px]">
                      {t.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-[var(--bg-subtle)]/40 border border-dashed border-[var(--border-subtle)] rounded-xl text-center">
                <Text variant="muted" size="xs">No tasks currently assigned in this crew.</Text>
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="space-y-3">
            <Text variant="muted" className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">
              Recent Activity
            </Text>
            <div className="space-y-2 text-xs text-[var(--text-secondary)]">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
                <Activity className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                <span className="truncate">Joined crew on {formatJoinDate(member.joinedAt)}</span>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg bg-[var(--bg-subtle)]/60 border border-[var(--border-subtle)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate">Completed {workload.completed} tasks in workspace</span>
              </div>
            </div>
          </div>
        </div>

        {/* Drawer Action Footer */}
        <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30 space-y-2">
          {isCreator && !isOwner && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[12px] gap-1.5"
                onClick={() => {
                  onClose();
                  onTransfer(member.userId);
                }}
              >
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                Make Owner
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full h-8 text-[12px] gap-1.5 text-[var(--danger)] hover:bg-[var(--danger-soft)]"
                onClick={() => {
                  onClose();
                  onRemove(member.userId);
                }}
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remove
              </Button>
            </div>
          )}
          <Button variant="outline" className="w-full h-8 text-[12px]" onClick={onClose}>
            Close Profile
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

// --- Main Living Team Directory Component ---
export function MembersTab({ crewId, members = [], memberCap = 10, isCreator = false, isLoading = false, isError = false, refetch }) {
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL'); // 'ALL' | 'OWNER' | 'ADMIN' | 'MEMBER'
  const [presenceFilter, setPresenceFilter] = useState('ALL'); // 'ALL' | 'ACTIVE' | 'FOCUS' | 'AWAY'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteLink, setInviteLink] = useState('');
  const [isLinkCopied, setIsLinkCopied] = useState(false);

  const { confirm, dialog: confirmDialog } = useConfirmDialog();

  // Queries & Mutations
  const { data: fetchedMembers, isLoading: isMembersLoading, isError: isMembersError, refetch: refetchMembers } = useCrewMembers(crewId);
  const { data: { tasks: rawCrewTasks = [] } = {} } = useTaskList({ crewId });

  const inviteMutation = useInviteCrewMember(crewId);
  const inviteLinkMutation = useCreateCrewInviteLink(crewId);
  const removeMutation = useRemoveCrewMember(crewId);
  const transferOwnershipMutation = useTransferCrewOwnership(crewId);

  // Resolved Member Roster
  const actualMembers = useMemo(() => {
    if (members && members.length > 0) return members;
    return fetchedMembers || [];
  }, [members, fetchedMembers]);

  const activeLoading = isLoading || isMembersLoading;
  const activeError = isError || isMembersError;

  // Workload calculator helper
  const getWorkload = (username) => getMemberWorkload(username, rawCrewTasks);

  // Filtered Roster
  const filteredMembers = useMemo(() => {
    return actualMembers.filter((m) => {
      const matchSearch =
        !searchQuery ||
        m.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.role?.toLowerCase().includes(searchQuery.toLowerCase());

      const isOwner = m.role === 'CREATOR' || m.role === 'OWNER';
      const matchRole =
        roleFilter === 'ALL' ||
        (roleFilter === 'OWNER' && isOwner) ||
        (roleFilter === 'ADMIN' && m.role === 'ADMIN') ||
        (roleFilter === 'MEMBER' && !isOwner && m.role !== 'ADMIN');

      const presence = getMemberPresence(m).toUpperCase();
      const matchPresence = presenceFilter === 'ALL' || presenceFilter === presence;

      return matchSearch && matchRole && matchPresence;
    });
  }, [actualMembers, searchQuery, roleFilter, presenceFilter]);

  // Actions
  const handleSendInvite = (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    inviteMutation.mutate(inviteEmail, {
      onSuccess: () => {
        setInviteEmail('');
        setIsInviteModalOpen(false);
      },
    });
  };

  const handleCreateInviteLink = () => {
    inviteLinkMutation.mutate(null, {
      onSuccess: (data) => {
        const link = `${window.location.origin}/app/crews/join?inviteId=${data.id || data.inviteId}`;
        setInviteLink(link);
        navigator.clipboard.writeText(link);
        setIsLinkCopied(true);
        toast.success('Invite link generated and copied to clipboard!');
        setTimeout(() => setIsLinkCopied(false), 2500);
      },
    });
  };

  const handleTransferOwnership = async (userId) => {
    if (
      await confirm({
        title: 'Transfer Crew Ownership?',
        description: 'You will relinquish crew owner rights and become a standard member.',
        confirmLabel: 'Transfer Ownership',
        cancelLabel: 'Cancel',
        danger: true,
      })
    ) {
      transferOwnershipMutation.mutate(userId);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (
      await confirm({
        title: 'Remove Member from Crew?',
        description: 'They will immediately lose access to crew tasks, channels, and projects.',
        confirmLabel: 'Remove Member',
        cancelLabel: 'Cancel',
        danger: true,
      })
    ) {
      removeMutation.mutate(userId);
    }
  };

  // State 1: Shimmer Skeleton (Loading State)
  if (activeLoading && actualMembers.length === 0) {
    return (
      <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto animate-pulse">
        <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] border border-[var(--border-subtle)]" />
            <div className="space-y-2">
              <div className="h-4 bg-[var(--bg-subtle)] rounded w-40" />
              <div className="h-3 bg-[var(--bg-subtle)] rounded w-56" />
            </div>
          </div>
          <div className="h-8 bg-[var(--bg-subtle)] rounded-lg w-72" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-5 w-16 bg-[var(--bg-subtle)] rounded-full" />
                <div className="h-4 w-14 bg-[var(--bg-subtle)] rounded-full" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--bg-subtle)]" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-3.5 bg-[var(--bg-subtle)] rounded w-24" />
                  <div className="h-3 bg-[var(--bg-subtle)] rounded w-32" />
                </div>
              </div>
              <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full" />
              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-12 bg-[var(--bg-subtle)] rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // State 4: Error State
  if (activeError && actualMembers.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorState
          title="Unable to load team directory"
          description="Failed to retrieve crew members. Please check your network connection and try again."
          onRetry={() => {
            if (refetch) refetch();
            refetchMembers();
          }}
        />
      </div>
    );
  }

  // State 2: Zero Members Empty State
  if (!activeLoading && actualMembers.length === 0) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <EmptyState
          icon={Users}
          title="No Team Members Found"
          description="Build your living team by inviting collaborators to this crew workspace."
          actionLabel="Invite Team Member"
          onAction={() => setIsInviteModalOpen(true)}
        />

        {/* Email Invitation Modal */}
        <Modal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>Invite Member to Crew</ModalTitle>
              <ModalDescription>Send an email invitation to add a collaborator to this crew workspace.</ModalDescription>
            </ModalHeader>
            <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                  <Input
                    type="email"
                    placeholder="colleague@company.com"
                    className="pl-9 h-9 text-[12px]"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <ModalFooter>
                <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setIsInviteModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="h-8 text-[12px]" isLoading={inviteMutation.isPending}>
                  Send Invitation
                </Button>
              </ModalFooter>
            </form>
          </ModalContent>
        </Modal>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-[1400px] mx-auto">
      {/* State 5: Permission Control Banner (Non-owners read-only notice) */}
      {!isCreator && (
        <div className="bg-[var(--accent-soft)]/50 border border-[var(--accent-border)] rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs text-[var(--text-secondary)]">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span>
              <strong className="font-semibold text-[var(--text-primary)]">Read-Only Directory: </strong>
              You are viewing the team roster. Crew owner privileges are required to remove members or transfer ownership.
            </span>
          </div>
          <Badge variant="outline" className="text-[10px] shrink-0 font-medium">
            Member Access
          </Badge>
        </div>
      )}

      {/* Directory Header Toolbar — teams design language (icon chip + title + subtitle) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center border border-[var(--accent-border)] shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <Heading level={3} className="text-[14px] font-semibold tracking-tight text-[var(--text-primary)]">
              Crew Members
            </Heading>
            <Text variant="muted" className="text-[12px] mt-0.5">
              {actualMembers.length} of {memberCap} seats filled ·{' '}
              <span className="text-[var(--success)] font-medium inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                {actualMembers.filter((m) => getMemberPresence(m) === 'active').length} active now
              </span>
            </Text>
          </div>
        </div>

        {/* Controls: Search, Filters, View Switcher & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-60 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-muted)] pointer-events-none" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members or email..."
              className="w-full h-8 pl-9 pr-8 text-[12px] font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg focus:outline-none focus:border-[var(--accent)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all shadow-sm"
            />
            {searchQuery && (
              <IconButton
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                title="Clear search"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
              >
                <X className="w-3.5 h-3.5" />
              </IconButton>
            )}
          </div>

          {/* Role Filter using shared Select component */}
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="h-8 w-[130px] text-xs font-medium bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg shadow-sm">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="ALL">All Roles</SelectItem>
              <SelectItem value="OWNER">Owners</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
              <SelectItem value="MEMBER">Members</SelectItem>
            </SelectContent>
          </Select>

          {/* View Switcher Toggle */}
          <div className="flex items-center h-8 bg-[var(--bg-subtle)] border border-[var(--border-subtle)] rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'h-7 px-2.5 rounded-md transition-colors flex items-center gap-1 font-medium',
                viewMode === 'grid'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={cn(
                'h-7 px-2.5 rounded-md transition-colors flex items-center gap-1 font-medium',
                viewMode === 'table'
                  ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              )}
              title="Compact Table View"
            >
              <List className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Invite Buttons */}
          <Button
            size="sm"
            className="h-8 text-[12px] font-semibold gap-1.5"
            onClick={() => setIsInviteModalOpen(true)}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Invite
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[12px] font-semibold gap-1.5 border-dashed"
            onClick={handleCreateInviteLink}
            isLoading={inviteLinkMutation.isPending}
          >
            <Link2 className="w-3.5 h-3.5" />
            {isLinkCopied ? 'Copied Link' : 'Invite Link'}
          </Button>
        </div>
      </div>

      {/* Shareable Link Active Alert (If generated) */}
      {inviteLink && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-[var(--bg-card)] border border-[var(--accent-border)] rounded-xl flex items-center justify-between gap-3 shadow-sm"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-[var(--accent)] shrink-0" />
            <span className="text-xs text-[var(--text-muted)] font-medium shrink-0">Invite Link:</span>
            <span className="text-xs font-mono text-[var(--text-primary)] truncate">{inviteLink}</span>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-[12px] gap-1 font-semibold shrink-0"
            onClick={() => {
              navigator.clipboard.writeText(inviteLink);
              setIsLinkCopied(true);
              toast.success('Invite link copied!');
              setTimeout(() => setIsLinkCopied(false), 2000);
            }}
          >
            {isLinkCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            {isLinkCopied ? 'Copied' : 'Copy Link'}
          </Button>
        </motion.div>
      )}

      {/* State 3: Filter / Search Empty Results State */}
      {filteredMembers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-[var(--border-subtle)] rounded-xl bg-[var(--bg-card)] p-6">
          <div className="w-10 h-10 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center mb-3">
            <Search className="w-4 h-4 text-[var(--text-muted)]" />
          </div>
          <Heading level={4} className="text-[14px] font-semibold text-[var(--text-primary)]">
            No matching team members found
          </Heading>
          <Text variant="muted" size="sm" className="text-[12px] mt-1 max-w-sm">
            We couldn't find any members matching "{searchQuery}". Try clearing search filters.
          </Text>
          <Button
            variant="outline"
            size="sm"
            className="mt-4 h-8 text-[12px] font-semibold"
            onClick={() => {
              setSearchQuery('');
              setRoleFilter('ALL');
              setPresenceFilter('ALL');
            }}
          >
            Clear Filters & Search
          </Button>
        </div>
      ) : (
        /* State 7: Interactive Living Directory (Grid vs Table View) */
        <AnimatePresence mode="wait">
          {viewMode === 'grid' ? (
            <motion.div
              key="grid"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {filteredMembers.map((member, index) => (
                <MemberCard
                  key={member.userId || member.username || index}
                  member={member}
                  isCreator={isCreator}
                  index={index}
                  searchQuery={searchQuery}
                  workload={getWorkload(member.username)}
                  onSelect={(m) => setSelectedMember(m)}
                  onTransfer={handleTransferOwnership}
                  onRemove={handleRemoveMember}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="table"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >
              <MemberTable
                members={filteredMembers}
                isCreator={isCreator}
                searchQuery={searchQuery}
                getWorkload={getWorkload}
                onSelect={(m) => setSelectedMember(m)}
                onTransfer={handleTransferOwnership}
                onRemove={handleRemoveMember}
              />
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {/* Interactive Member Detail Drawer */}
      <MemberDetailDrawer
        member={selectedMember}
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        workload={selectedMember ? getWorkload(selectedMember.username) : { memberTasks: [] }}
        isCreator={isCreator}
        onTransfer={handleTransferOwnership}
        onRemove={handleRemoveMember}
      />

      {/* Email Invitation Modal */}
      <Modal open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle>Invite Member to Crew</ModalTitle>
            <ModalDescription>Send an email invitation to add a collaborator to this crew workspace.</ModalDescription>
          </ModalHeader>
          <form onSubmit={handleSendInvite} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-mono uppercase tracking-wider text-[var(--text-muted)] font-semibold">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  type="email"
                  placeholder="colleague@company.com"
                  className="pl-9 h-9 text-[12px]"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <ModalFooter>
              <Button type="button" variant="outline" size="sm" className="h-8 text-[12px]" onClick={() => setIsInviteModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" size="sm" className="h-8 text-[12px]" isLoading={inviteMutation.isPending}>
                Send Invitation
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Global Confirmation Dialog */}
      {confirmDialog}
    </div>
  );
}

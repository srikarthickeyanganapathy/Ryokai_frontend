import React, { useState, useMemo } from 'react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription
} from '@/shared/ui/Drawer';
import { motion } from 'framer-motion';
import { Heading, Text } from '@/shared/ui/Typography';
import { Badge } from '@/shared/ui/Badge';
import { Button, IconButton } from '@/shared/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/Select';
import { Icons } from '@/shared/ui/Icons';
import { cn } from '@/shared/lib/cn';
import {
  Mail,
  Shield,
  Users,
  CheckSquare,
  Trash2,
  ShieldAlert,
  Clock,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  BarChart3,
  TrendingUp,
  GitBranch,
  FolderKanban,
  Settings,
  Key,
  Tag,
} from '@/shared/ui/Icons';
import { toast } from 'sonner';

// ───────── Helpers ─────────

function timeAgo(date) {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return null;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 0) return 'just now';
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

const STATUS_CONFIG = {
  ACTIVE: { label: 'Active', color: 'bg-[var(--accent)]', textColor: 'text-[var(--accent)]' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-[var(--warning)]', textColor: 'text-[var(--warning)]' },
  IN_REVIEW: { label: 'In Review', color: 'bg-[var(--info)]', textColor: 'text-[var(--info)]' },
  DONE: { label: 'Done', color: 'bg-[var(--success)]', textColor: 'text-[var(--success)]' },
  COMPLETED: { label: 'Completed', color: 'bg-[var(--success)]', textColor: 'text-[var(--success)]' },
  TODO: { label: 'To Do', color: 'bg-[var(--text-muted)]', textColor: 'text-[var(--text-muted)]' },
  BLOCKED: { label: 'Blocked', color: 'bg-[var(--danger)]', textColor: 'text-[var(--danger)]' },
};

function getStatusConfig(status) {
  const key = (status || '').toUpperCase();
  return STATUS_CONFIG[key] || { label: status || 'Unknown', color: 'bg-[var(--text-muted)]', textColor: 'text-[var(--text-muted)]' };
}

// ───────── Permission Grouping ─────────

const PERMISSION_GROUPS = {
  'Projects': {
    prefixes: ['project', 'projects', 'proj'],
    icon: FolderKanban,
  },
  'Tasks': {
    prefixes: ['task', 'tasks', 'todo'],
    icon: CheckSquare,
  },
  'Teams': {
    prefixes: ['team', 'teams', 'member', 'members'],
    icon: Users,
  },
  'Admin': {
    prefixes: ['admin', 'org', 'organization', 'billing', 'settings', 'config'],
    icon: Settings,
  },
};

function groupPermissions(permissions = []) {
  const groups = {
    Projects: [],
    Tasks: [],
    Teams: [],
    Admin: [],
    Other: [],
  };

  permissions.forEach(perm => {
    const lower = perm.toLowerCase();
    let assigned = false;

    for (const [groupName, config] of Object.entries(PERMISSION_GROUPS)) {
      if (config.prefixes.some(p => lower.startsWith(p))) {
        groups[groupName].push(perm);
        assigned = true;
        break;
      }
    }

    if (!assigned) {
      groups['Other'].push(perm);
    }
  });

  // Remove empty groups
  return Object.fromEntries(
    Object.entries(groups).filter(([, perms]) => perms.length > 0)
  );
}

const GROUP_ICONS = {
  Projects: FolderKanban,
  Tasks: CheckSquare,
  Teams: Users,
  Admin: Settings,
  Other: Tag,
};

// ───────── Member Detail Drawer ─────────

export function MemberDetailDrawer({
  isOpen,
  onClose,
  member,
  roles = [],
  memberTeams = [],
  memberTasks,        // Array of task objects — preferred prop
  activeTaskCount,    // Legacy fallback
  canManageRoles,
  canRemoveMembers,
  onUpdateRole,       // (userId, roleId) — preferred prop
  onRoleChange,       // (userId, roleId) — legacy fallback
  onRemoveMember,     // (member object)
  isUpdatingRole,
  isRemovingMember,
  isSelf,
  isLastAdmin,
}) {
  const [copiedEmail, setCopiedEmail] = useState(false);

  const tasks = memberTasks || [];
  const taskCount = activeTaskCount ?? tasks.length;
  const updateRole = onUpdateRole || onRoleChange;

  // ───────── Computed values ─────────

  // Task activity timeline — last 5 tasks sorted by most recent
  const recentTasks = useMemo(() => {
    return [...tasks]
      .filter(t => t.updatedAt)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
      .slice(0, 5);
  }, [tasks]);

  // Workload distribution by status
  const workloadDistribution = useMemo(() => {
    const dist = { active: 0, inReview: 0, done: 0, other: 0 };
    tasks.forEach(task => {
      const status = (task.status || '').toUpperCase();
      if (['ACTIVE', 'IN_PROGRESS', 'TODO'].includes(status)) {
        dist.active++;
      } else if (['IN_REVIEW', 'REVIEW'].includes(status)) {
        dist.inReview++;
      } else if (['DONE', 'COMPLETED'].includes(status)) {
        dist.done++;
      } else {
        dist.other++;
      }
    });
    return dist;
  }, [tasks]);

  // Permission groups
  const permissionGroups = useMemo(() => {
    return groupPermissions(member?.permissions || []);
  }, [member]);

  // Team roles — find member's role within each team
  const teamRoles = useMemo(() => {
    if (!member) return [];
    return memberTeams.map(team => {
      const teamMembers = team.members || [];
      const membership = teamMembers.find(tm => {
        const tmId = tm.userId ?? tm.id ?? tm;
        return tmId === member.userId
          || (tm.username && tm.username === member.username);
      });
      return {
        team,
        role: membership?.role || membership?.teamRole || 'Member',
        isOwner: membership?.role === 'OWNER' || membership?.isOwner || false,
      };
    });
  }, [member, memberTeams]);

  // Handle copy email
  const handleCopyEmail = async () => {
    if (!member?.email) return;
    try {
      await navigator.clipboard.writeText(member.email);
      setCopiedEmail(true);
      toast.success('Email copied to clipboard');
      setTimeout(() => setCopiedEmail(false), 2000);
    } catch {
      toast.error('Failed to copy email');
    }
  };

  if (!member) return null;

  const currentRole = roles.find((r) => r.name === member.orgRole);
  const isSuspended = member.status === 'SUSPENDED';
  const maxWorkload = Math.max(workloadDistribution.active, workloadDistribution.inReview, workloadDistribution.done, 1);

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent side="right" className="sm:max-w-md p-0 flex flex-col bg-[var(--bg-card)] border-l border-[var(--border-subtle)] shadow-xl">

        {/* Header Section */}
        <div className="relative p-6 border-b border-[var(--border-subtle)] bg-[var(--bg-subtle)]/30">
          <div className="flex items-start gap-4">
            <div className={cn(
              "h-16 w-16 rounded-full border flex items-center justify-center flex-shrink-0 text-lg font-bold bg-[var(--accent-soft)] border-[var(--accent-border)] text-[var(--accent)]"
            )}>
              {member.username?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0 pt-1">
              <div className="flex items-center gap-2 mb-1">
                <Heading level={3} className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                  {member.username}
                </Heading>
                {isSuspended && (
                  <Badge variant="danger" className="text-[10px] uppercase">Suspended</Badge>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{member.email || "No email provided"}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <Badge
                  variant={member.rolePriority === 0 ? 'danger' : member.rolePriority === 1 ? 'warning' : 'outline'}
                  className="text-[10px] uppercase tracking-wider"
                >
                  {member.orgRole}
                </Badge>
                <span className="flex items-center gap-1 text-[11px] text-[var(--text-muted)]">
                  <Shield className="h-3 w-3" /> Priority {member.rolePriority ?? 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* ───────── Quick Actions Panel ───────── */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[11px] flex items-center gap-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
              title="Open chat"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)]" />
              Message
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[11px] flex items-center gap-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
              title="View tasks"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              View Tasks
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-[11px] flex items-center gap-1.5 bg-[var(--bg-card)] hover:bg-[var(--bg-hover)]"
              title={copiedEmail ? 'Copied!' : 'Copy email to clipboard'}
              onClick={handleCopyEmail}
              disabled={!member.email}
            >
              {copiedEmail
                ? <Check className="w-3.5 h-3.5 text-[var(--success)]" />
                : <Copy className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              }
              Copy Email
            </Button>
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <Users className="w-4 h-4 text-[var(--text-muted)] mx-auto mb-1" />
              <div className="text-[15px] font-bold text-[var(--text-primary)]">{memberTeams.length}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Teams</div>
            </div>
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <CheckSquare className="w-4 h-4 text-[var(--text-muted)] mx-auto mb-1" />
              <div className="text-[15px] font-bold text-[var(--text-primary)]">{taskCount}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Tasks</div>
            </div>
            <div className="bg-[var(--bg-subtle)]/50 border border-[var(--border-subtle)] rounded-lg p-3 text-center">
              <Shield className="w-4 h-4 text-[var(--text-muted)] mx-auto mb-1" />
              <div className="text-[15px] font-bold text-[var(--text-primary)]">{member.permissions?.length || 0}</div>
              <div className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Permissions</div>
            </div>
          </div>

          {/* ───────── Member Activity Timeline ───────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
              <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Recent Activity
              </Text>
              {recentTasks.length > 0 && (
                <Badge variant="outline" className="text-[9px] ml-auto">{recentTasks.length} of {tasks.length}</Badge>
              )}
            </div>
            {recentTasks.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                No recent task activity
              </div>
            ) : (
              <div className="space-y-2">
                {recentTasks.map((task, idx) => {
                  const statusConfig = getStatusConfig(task.status);
                  return (
                    <motion.div
                      key={task.id || idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-[var(--bg-subtle)]/40 border border-[var(--border-subtle)] hover:border-[var(--accent-border)] transition-colors"
                    >
                      <div className={cn("w-1.5 h-1.5 rounded-full shrink-0", statusConfig.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-[var(--text-primary)] truncate">
                          {task.title || 'Untitled Task'}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={cn("text-[10px] font-semibold", statusConfig.textColor)}>
                            {statusConfig.label}
                          </span>
                          {task.updatedAt && (
                            <span className="text-[10px] text-[var(--text-muted)]">
                              {timeAgo(new Date(task.updatedAt))}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ───────── Workload Distribution ───────── */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Workload Distribution
              </Text>
            </div>
            {tasks.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                No tasks assigned
              </div>
            ) : (
              <div className="space-y-2 p-3 bg-[var(--bg-subtle)]/30 rounded-lg border border-[var(--border-subtle)]">
                {[
                  { key: 'active', label: 'Active', count: workloadDistribution.active, color: 'bg-[var(--accent)]' },
                  { key: 'inReview', label: 'In Review', count: workloadDistribution.inReview, color: 'bg-[var(--info)]' },
                  { key: 'done', label: 'Done', count: workloadDistribution.done, color: 'bg-[var(--success)]' },
                ].map(item => (
                  <div key={item.key} className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-[var(--text-secondary)] font-medium">{item.label}</span>
                      <span className="text-[var(--text-primary)] font-semibold tabular-nums">{item.count}</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-subtle)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(item.count / maxWorkload) * 100}%` }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={cn("h-full rounded-full", item.color)}
                      />
                    </div>
                  </div>
                ))}
                {workloadDistribution.other > 0 && (
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-[var(--text-muted)]">Other</span>
                    <span className="text-[var(--text-muted)] tabular-nums">{workloadDistribution.other}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ───────── Team Affiliations with Roles ───────── */}
          <div className="space-y-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Team Affiliations
            </Text>
            {teamRoles.length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                Not assigned to any teams
              </div>
            ) : (
              <div className="space-y-2">
                {teamRoles.map(({ team, role, isOwner }) => (
                  <div
                    key={team.id || team.name}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg-subtle)]/40 border border-[var(--border-subtle)]"
                  >
                    <div className="flex items-center gap-2.5">
                      <Users className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span className="text-xs font-medium text-[var(--text-primary)]">{team.name}</span>
                    </div>
                    <Badge
                      variant={isOwner ? 'warning' : 'outline'}
                      className={cn(
                        "text-[10px] font-medium",
                        isOwner && "bg-[var(--warning-soft)]"
                      )}
                    >
                      {role}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ───────── Permission Groups ───────── */}
          <div className="space-y-3">
            <Text className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Access &amp; Permissions
            </Text>
            {Object.keys(permissionGroups).length === 0 ? (
              <div className="text-xs text-[var(--text-muted)] italic p-3 border border-dashed border-[var(--border-subtle)] rounded-md text-center">
                No specific permissions assigned
              </div>
            ) : (
              <div className="space-y-2.5">
                {Object.entries(permissionGroups).map(([groupName, perms]) => {
                  const IconComponent = GROUP_ICONS[groupName] || Tag;
                  return (
                    <div key={groupName} className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <IconComponent className="w-3 h-3 text-[var(--accent)]" />
                        <span className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wider">
                          {groupName}
                        </span>
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {perms.length}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 pl-5">
                        {perms.map(perm => (
                          <span
                            key={perm}
                            className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-secondary)]"
                          >
                            {perm.replace(/_/g, ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Governance Footer */}
        {(canManageRoles || canRemoveMembers) && (
          <div className="p-4 border-t border-[var(--border-subtle)] bg-[var(--bg-base)] flex items-center justify-between gap-3">
            {canManageRoles && (
              <div className="flex-1">
                <label className="text-[10px] font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1 block">
                  Change Role
                </label>
                <Select
                  value={currentRole?.id?.toString() ?? ''}
                  onValueChange={(val) => updateRole?.(member.userId, parseInt(val, 10))}
                  disabled={isUpdatingRole || (isLastAdmin && member.rolePriority === 0)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder={member.orgRole || 'Select Role'} />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id.toString()}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {canRemoveMembers && !isSelf && !isLastAdmin && (
              <Button
                variant="danger"
                size="sm"
                className="mt-5 h-8"
                onClick={() => onRemoveMember(member)}
                disabled={isRemovingMember}
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
              </Button>
            )}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}

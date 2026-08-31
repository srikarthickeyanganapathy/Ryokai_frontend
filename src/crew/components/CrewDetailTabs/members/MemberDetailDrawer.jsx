import { Heading, Text } from '@/shared/ui/Typography';
import { Button } from '@/shared/ui/Button';
import { Badge } from '@/shared/ui/Badge';
import { cn } from '@/shared/lib/cn';
import { Drawer, DrawerContent } from '@/shared/ui/Drawer';
import { Mail, Zap, Activity, CheckCircle2, Crown, Trash2, Flame, UserCheck, ShieldCheck } from '@/shared/ui/Icons';
import { MemberAvatar } from './MemberAvatar';
import { PRESENCE_CONFIG, formatJoinDate, getMemberPresence } from './utils';

// Member badges helper (icons + classes for the drawer profile header)
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
      class: 'bg-[var(--warning-soft)] text-orange-400 border-[var(--warning-border)]',
    });
  }

  if (getMemberPresence(member) === 'focus') {
    badges.push({
      label: 'Deep Work',
      icon: Zap,
      class: 'bg-[var(--accent-soft)] text-purple-400 border-[var(--accent-border)]',
    });
  }

  return badges;
}

// --- Interactive Slide-Over Member Detail Drawer ---
export function MemberDetailDrawer({ member, isOpen, onClose, workload, isCreator, onTransfer, onRemove }) {
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
                <Zap className="w-4 h-4 text-[var(--warning)] shrink-0 mt-0.5" />
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
                <span className="text-xl font-bold text-[var(--success)] block tabular-nums">{workload.completed}</span>
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
                        <span>*</span>
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
                <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] shrink-0" />
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
                <Crown className="w-3.5 h-3.5 text-[var(--warning)]" />
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
